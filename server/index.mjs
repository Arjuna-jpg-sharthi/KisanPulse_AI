import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, createReadStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { getAuthenticatedUser, handleAuthRequest, initializeAuth } from './auth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
// Load the project's local .env without an additional dependency. Existing
// environment variables always take precedence over values in the file.
try {
  const envText = readFileSync(resolve(here, '../.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !match[1].startsWith('#') && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const databasePath = resolve(here, 'data/kisanpulse.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_hi TEXT NOT NULL,
    category_en TEXT NOT NULL, category_hi TEXT NOT NULL,
    benefit_en TEXT NOT NULL, benefit_hi TEXT NOT NULL,
    eligibility_en TEXT NOT NULL, eligibility_hi TEXT NOT NULL,
    summary_en TEXT NOT NULL DEFAULT '', summary_hi TEXT NOT NULL DEFAULT '',
    launch_date TEXT, state TEXT NOT NULL DEFAULT 'Central (All India)',
    tags_json TEXT NOT NULL DEFAULT '[]', portal_url TEXT NOT NULL,
    source_url TEXT NOT NULL, source_name TEXT NOT NULL,
    verified_at TEXT NOT NULL, is_new INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS mandi_price_records (
    state TEXT NOT NULL, district TEXT NOT NULL DEFAULT '', market TEXT NOT NULL,
    commodity TEXT NOT NULL, variety TEXT NOT NULL DEFAULT '', grade TEXT NOT NULL DEFAULT '',
    arrival_date TEXT NOT NULL, min_price REAL, max_price REAL, modal_price REAL NOT NULL,
    source TEXT NOT NULL DEFAULT 'data.gov.in / AGMARKNET', fetched_at TEXT NOT NULL,
    PRIMARY KEY(state,district,market,commodity,variety,grade,arrival_date)
  );
  CREATE TABLE IF NOT EXISTS farmer_profiles (
    id TEXT PRIMARY KEY, state TEXT NOT NULL, district TEXT NOT NULL DEFAULT '',
    crops_json TEXT NOT NULL DEFAULT '[]', interests_json TEXT NOT NULL DEFAULT '[]',
    language TEXT NOT NULL DEFAULT 'en', alerts_enabled INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    scheme_id TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    message_en TEXT NOT NULL, message_hi TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TEXT,
    UNIQUE(profile_id, scheme_id)
  );
  CREATE TABLE IF NOT EXISTS registration_requests (
    id TEXT PRIMARY KEY, scheme_id TEXT NOT NULL, scheme_name_en TEXT NOT NULL,
    scheme_name_hi TEXT NOT NULL DEFAULT '', farmer_name TEXT NOT NULL,
    phone TEXT NOT NULL, state TEXT NOT NULL, district TEXT NOT NULL DEFAULT '',
    crop TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'en', status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_status TEXT NOT NULL DEFAULT 'not_applicable', payment_ref TEXT NOT NULL DEFAULT '',
    payment_amount INTEGER NOT NULL DEFAULT 0, payment_method TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS scheme_videos (
    id TEXT PRIMARY KEY, scheme_id TEXT NOT NULL, title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL DEFAULT '', file_name TEXT NOT NULL, mime_type TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('farmer','buyer')),
    display_name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', crop TEXT NOT NULL,
    variety TEXT NOT NULL DEFAULT '', quantity REAL NOT NULL,
    min_quantity REAL NOT NULL, expected_price REAL NOT NULL,
    min_price REAL NOT NULL, max_price REAL NOT NULL,
    ready_date TEXT NOT NULL DEFAULT '', state TEXT NOT NULL, district TEXT NOT NULL,
    grade TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    photo_name TEXT NOT NULL DEFAULT '', photo_mime TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS marketplace_messages (
    id TEXT PRIMARY KEY, farmer_listing_id TEXT NOT NULL, buyer_listing_id TEXT NOT NULL,
    sender_listing_id TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('text','voice')),
    body TEXT NOT NULL DEFAULT '', media_name TEXT NOT NULL DEFAULT '',
    media_mime TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS marketplace_notifications (
    id TEXT PRIMARY KEY, recipient_listing_id TEXT NOT NULL, sender_listing_id TEXT NOT NULL,
    message_id TEXT NOT NULL UNIQUE, kind TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TEXT
  );
`);
initializeAuth(db);
const marketListingColumns=new Set(db.prepare('PRAGMA table_info(marketplace_listings)').all().map(column=>column.name));
if(!marketListingColumns.has('user_id'))db.exec('ALTER TABLE marketplace_listings ADD COLUMN user_id INTEGER REFERENCES app_users(id)');
const registrationColumns=new Set(db.prepare('PRAGMA table_info(registration_requests)').all().map(column=>column.name));
if(!registrationColumns.has('payment_status'))db.exec("ALTER TABLE registration_requests ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_applicable'");
if(!registrationColumns.has('payment_ref'))db.exec("ALTER TABLE registration_requests ADD COLUMN payment_ref TEXT NOT NULL DEFAULT ''");
if(!registrationColumns.has('payment_amount'))db.exec('ALTER TABLE registration_requests ADD COLUMN payment_amount INTEGER NOT NULL DEFAULT 0');
if(!registrationColumns.has('payment_method'))db.exec("ALTER TABLE registration_requests ADD COLUMN payment_method TEXT NOT NULL DEFAULT ''");
if (db.prepare('SELECT COUNT(*) AS n FROM schemes').get().n === 0) {
  const { SCHEME_CATALOG } = await import('./scheme-catalog.mjs');
  const insert = db.prepare(`INSERT INTO schemes
    (id,name_en,name_hi,category_en,category_hi,benefit_en,benefit_hi,eligibility_en,eligibility_hi,summary_en,summary_hi,launch_date,state,tags_json,portal_url,source_url,source_name,verified_at,is_new)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.exec('BEGIN');
  try {
    SCHEME_CATALOG.forEach((s) => insert.run(
      s.id,s.nameEn,s.nameHi,s.category,s.categoryHi,s.benefit,s.benefitHi,s.eligibility,s.eligibilityHi,
      s.summary,s.summaryHi,s.launchDate,s.state,JSON.stringify(s.tags),s.portalUrl,s.sourceUrl,s.sourceName,s.verifiedAt,s.isNew?1:0
    ));
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));};
const readBody=async(req)=>{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>200000)throw new Error('Request too large');}return raw?JSON.parse(raw):{};};
const readUpload=async(req,maxBytes=50*1024*1024)=>{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>maxBytes)throw new Error('Video must be smaller than 50 MB.');chunks.push(chunk);}return Buffer.concat(chunks);};
const isAdmin=(req)=>Boolean(process.env.ADMIN_API_KEY)&&req.headers['x-admin-key']===process.env.ADMIN_API_KEY||getAuthenticatedUser(req,db)?.role==='admin';
const requireAdmin=(req,res)=>{if(isAdmin(req))return true;json(res,401,{error:'Admin access required. Enter the configured admin key.'});return false;};
const listSchemes=(q='')=>{const like=`%${q.trim()}%`;return db.prepare(`SELECT * FROM schemes WHERE ?='%%' OR name_en LIKE ? OR name_hi LIKE ? OR benefit_en LIKE ? OR benefit_hi LIKE ? OR category_en LIKE ? ORDER BY CASE WHEN launch_date IS NULL THEN 1 ELSE 0 END,launch_date DESC,name_en`).all(like,like,like,like,like,like).map(s=>({id:s.id,nameEn:s.name_en,nameHi:s.name_hi,category:s.category_en,categoryHi:s.category_hi,benefit:s.benefit_en,benefitHi:s.benefit_hi,eligibility:s.eligibility_en,eligibilityHi:s.eligibility_hi,summary:s.summary_en,summaryHi:s.summary_hi,launchDate:s.launch_date,state:s.state,tags:JSON.parse(s.tags_json),portalUrl:s.portal_url,sourceUrl:s.source_url,sourceName:s.source_name,verifiedAt:s.verified_at,isNew:Boolean(s.is_new),source:s.is_new?'database-alert':'catalog',documents:[]}));};
const matchesProfile=(p,s)=>{if(!p.alerts_enabled)return false;const state=p.state.trim().toLowerCase(),schemeState=s.state.toLowerCase();if(!schemeState.includes('all india')&&!schemeState.includes('central')&&state!==schemeState)return false;const preferences=[...JSON.parse(p.crops_json),...JSON.parse(p.interests_json)].map(v=>v.toLowerCase());const tags=JSON.parse(s.tags_json).map(v=>v.toLowerCase());return !preferences.length||preferences.some(v=>tags.some(t=>t.includes(v)||v.includes(t))||s.category_en.toLowerCase().includes(v));};
const marketListing=(r)=>({id:r.id,role:r.role,displayName:r.display_name,phone:r.phone,crop:r.crop,variety:r.variety,quantityQuintals:r.quantity,minQuantityQuintals:r.min_quantity,expectedPricePerQuintal:r.expected_price,minPricePerQuintal:r.min_price,maxPricePerQuintal:r.max_price,readyDate:r.ready_date,state:r.state,district:r.district,grade:r.grade,description:r.description,photoUrl:r.photo_name?`/api/marketplace/photos/${r.id}`:'',createdAt:r.created_at});
const getListing=(id)=>db.prepare('SELECT * FROM marketplace_listings WHERE id=? AND active=1').get(id);
const marketMatches=(listing)=>{
  const otherRole=listing.role==='farmer'?'buyer':'farmer';
  const candidates=db.prepare('SELECT * FROM marketplace_listings WHERE active=1 AND role=? AND lower(trim(crop))=lower(trim(?)) ORDER BY created_at DESC').all(otherRole,listing.crop);
  return candidates.map(candidate=>{
    const farmer=listing.role==='farmer'?listing:candidate, buyer=listing.role==='buyer'?listing:candidate;
    const low=Math.max(farmer.min_price,buyer.min_price), high=Math.min(farmer.max_price,buyer.max_price);
    const gap=low<=high?0:(low-high)/Math.max(1,(low+high)/2)*100;
    const overlap=Math.min(farmer.quantity,buyer.quantity), quantityPct=Math.min(100,overlap/Math.max(1,buyer.min_quantity)*100);
    const sameState=farmer.state.toLowerCase()===buyer.state.toLowerCase();
    if(gap>10||overlap<buyer.min_quantity)return null;
    const score=Math.round(Math.max(0,100-gap*4)*0.65+quantityPct*0.25+(sameState?10:0));
    const otherListing=marketListing(candidate);delete otherListing.phone;
    return {listing:otherListing,matchScore:Math.min(100,score),priceGapPercent:Math.round(gap*10)/10,quantityAvailable:overlap,priceRangeOverlap:low<=high,reason:low<=high?'Negotiation ranges overlap.':'Price gap is within 10%; negotiation may bridge it.',mutualContact:{farmerListingId:farmer.id,buyerListingId:buyer.id,farmerName:farmer.display_name,buyerName:buyer.display_name,farmerPhone:farmer.phone,buyerPhone:buyer.phone}};
  }).filter(Boolean).sort((a,b)=>b.matchScore-a.matchScore);
};
const mandiCache = new Map();
const openWeatherCache = new Map();
const mandiResourceId = '9ef84268-d588-465a-a308-a864a43d0070';
const mandiSourceUrl = 'https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi';
const parseMandiPrice = (value) => { const n=Number(String(value??'').replaceAll(',','').trim()); return Number.isFinite(n)?n:null; };
const parseMandiDate = (value) => { const m=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m?`${m[3]}-${m[2]}-${m[1]}`:String(value||''); };

const server=createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');try{
  if(await handleAuthRequest(req,res,url,db,readBody))return;
  const account=getAuthenticatedUser(req,db);
  if(url.pathname.startsWith('/api/')&&url.pathname!=='/api/health'&&!account)return json(res,401,{error:'Create an account or sign in to use KisanPulse.'});
  if(account?.role==='buyer'&&(['/api/schemes','/api/ai/scheme-chat','/api/profiles','/api/notifications','/api/registration-requests'].some(path=>url.pathname===path||url.pathname.startsWith(`${path}/`))||url.pathname.startsWith('/api/scheme-videos/')))return json(res,403,{error:'This section is available to farmer accounts.'});
  if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,database:'sqlite',schemes:db.prepare('SELECT COUNT(*) AS n FROM schemes').get().n});
  if(req.method==='GET'&&url.pathname==='/api/weather/geocode'){
    const apiKey=process.env.OPENWEATHER_API_KEY?.trim();
    if(!apiKey)return json(res,503,{code:'OPENWEATHER_KEY_MISSING',error:'Add OPENWEATHER_API_KEY to the project .env file and restart the server.'});
    const query=String(url.searchParams.get('q')||'').trim().slice(0,100);
    if(query.length<2)return json(res,400,{error:'Enter at least two letters for a city or district.'});
    try{
      const upstreamUrl=new URL('https://api.openweathermap.org/geo/1.0/direct');
      upstreamUrl.searchParams.set('q',`${query},IN`);upstreamUrl.searchParams.set('limit','6');upstreamUrl.searchParams.set('appid',apiKey);
      const upstream=await fetch(upstreamUrl,{signal:AbortSignal.timeout(12000)});
      const body=await upstream.json();
      if(!upstream.ok)throw new Error(body.message||`OpenWeather geocoding failed (${upstream.status}).`);
      const locations=(Array.isArray(body)?body:[]).map(item=>({name:String(item.name||''),state:String(item.state||''),country:String(item.country||'IN'),lat:Number(item.lat),lon:Number(item.lon)})).filter(item=>item.name&&Number.isFinite(item.lat)&&Number.isFinite(item.lon));
      return json(res,200,{locations});
    }catch(error){return json(res,502,{error:String(error.message||'Could not search locations with OpenWeather.').slice(0,250)});}
  }
  if(req.method==='GET'&&url.pathname==='/api/weather/forecast'){
    const apiKey=process.env.OPENWEATHER_API_KEY?.trim();
    if(!apiKey)return json(res,503,{code:'OPENWEATHER_KEY_MISSING',error:'Add OPENWEATHER_API_KEY to the project .env file and restart the server.'});
    const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
    if(!Number.isFinite(lat)||lat < -90||lat > 90||!Number.isFinite(lon)||lon < -180||lon > 180)return json(res,400,{error:'Valid latitude and longitude are required.'});
    const cacheKey=`${lat.toFixed(3)},${lon.toFixed(3)}`,cached=openWeatherCache.get(cacheKey);
    if(cached&&Date.now()-cached.at<10*60*1000)return json(res,200,{...cached.data,cached:true});
    const providerUrl=(path)=>{const u=new URL(`https://api.openweathermap.org/data/2.5/${path}`);u.searchParams.set('lat',String(lat));u.searchParams.set('lon',String(lon));u.searchParams.set('units','metric');u.searchParams.set('appid',apiKey);return u;};
    try{
      const [currentResponse,forecastResponse]=await Promise.all([fetch(providerUrl('weather'),{signal:AbortSignal.timeout(15000)}),fetch(providerUrl('forecast'),{signal:AbortSignal.timeout(15000)})]);
      const [current,forecastBody]=await Promise.all([currentResponse.json(),forecastResponse.json()]);
      if(!currentResponse.ok)throw new Error(current.message||`Current weather request failed (${currentResponse.status}).`);
      if(!forecastResponse.ok)throw new Error(forecastBody.message||`Weather forecast request failed (${forecastResponse.status}).`);
      const cityOffset=Number(forecastBody.city?.timezone||current.timezone||0),groups=new Map();
      for(const item of Array.isArray(forecastBody.list)?forecastBody.list:[]){
        const dateKey=new Date((Number(item.dt)+cityOffset)*1000).toISOString().slice(0,10);
        if(!groups.has(dateKey))groups.set(dateKey,[]);groups.get(dateKey).push(item);
      }
      const dates=[...groups.keys()].slice(0,5);
      if(!dates.length)throw new Error('OpenWeather returned no forecast periods for this location.');
      const forecast=dates.map((dateKey,index)=>{
        const entries=groups.get(dateKey),temps=entries.map(x=>Number(x.main?.temp)).filter(Number.isFinite),rain=entries.reduce((sum,x)=>sum+Number(x.rain?.['3h']||x.snow?.['3h']||0),0),rainChance=Math.round(Math.max(...entries.map(x=>Number(x.pop||0)))*100),windSpeedKm=Math.round(Math.max(...entries.map(x=>Number(x.wind?.speed||0)))*3.6),humidity=Math.round(entries.reduce((sum,x)=>sum+Number(x.main?.humidity||0),0)/entries.length),representative=entries[Math.floor(entries.length/2)]||entries[0],weather=representative.weather?.[0]||{},weatherId=Number(weather.id||800),maxTemp=Math.round(Math.max(...temps)),minTemp=Math.round(Math.min(...temps));
        const icon=weatherId>=200&&weatherId<300?'CloudLightning':weatherId>=300&&weatherId<400?'CloudDrizzle':weatherId>=500&&weatherId<600?'CloudRain':weatherId>=600&&weatherId<700?'CloudSnow':weatherId>=700&&weatherId<800?'CloudFog':weatherId===800?'Sun':weatherId===801?'CloudSun':'Cloud';
        const sprayStatus=rainChance>40||rain>2?'Avoid Spray':windSpeedKm>16?'Drift Risk':maxTemp>36?'Heat Stress':'Check Conditions';
        const sprayColor=sprayStatus==='Avoid Spray'?'red':sprayStatus==='Drift Risk'||sprayStatus==='Heat Stress'?'amber':'green';
        const farmAction=sprayStatus==='Avoid Spray'?`Rain is forecast (up to ${rainChance}% chance; about ${Math.round(rain*10)/10} mm across forecast periods). Delay spraying and check drainage.`:sprayStatus==='Drift Risk'?`Wind may reach ${windSpeedKm} km/h. Avoid spraying in gusty conditions.`:sprayStatus==='Heat Stress'?`Daytime temperature may reach ${maxTemp}°C. Avoid field work during peak heat.`:'No major rain or wind warning in this forecast. Check the crop and product label before spraying.';
        const localDate=new Date(`${dateKey}T12:00:00Z`),dayName=index===0?'Today':index===1?'Tomorrow':new Intl.DateTimeFormat('en-IN',{weekday:'long',timeZone:'UTC'}).format(localDate);
        return {dayIndex:index,dayName,date:new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}).format(localDate),fullDate:dateKey,maxTemp,minTemp,condition:String(weather.description||weather.main||'Weather unavailable'),icon,rainChance,precipitationMm:Math.round(rain*10)/10,windSpeedKm,humidity,sprayStatus,sprayColor,farmAction};
      });
      const rainyDays=forecast.filter(day=>day.rainChance>35||day.precipitationMm>2).length;
      const name=String(url.searchParams.get('name')||current.name||'Selected location').slice(0,120),state=String(url.searchParams.get('state')||'').slice(0,100),data={locationName:name,state,latitude:lat,longitude:lon,isLive:true,isOpenWeather:true,source:'OpenWeather 5-day forecast',lastUpdated:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})+' IST',current:{temp:Math.round(Number(current.main?.temp||0)),humidity:Number(current.main?.humidity||0),wind:Math.round(Number(current.wind?.speed||0)*3.6),condition:String(current.weather?.[0]?.description||'Current conditions')},summaryAdvisory:rainyDays>=2?`Rain is forecast on ${rainyDays} of the next five days. Delay irrigation and spraying around expected showers.`:'No widespread rain signal in this five-day forecast. Check daily wind and rain before field work.',forecast};
      openWeatherCache.set(cacheKey,{at:Date.now(),data});return json(res,200,data);
    }catch(error){console.error('[openweather] forecast failed:',String(error?.cause?.code||error?.name||'provider error').slice(0,80));return json(res,502,{error:String(error.message||'OpenWeather forecast request failed.').slice(0,250)});}
  }
  if(req.method==='GET'&&url.pathname==='/api/mandi-prices'){
    const allowed=['state','district','market','commodity','arrival_date'],filters={};
    for(const field of allowed){const value=String(url.searchParams.get(field)||'').trim();if(value.length>100)return json(res,400,{error:`Invalid ${field} filter.`});if(value)filters[field]=value;}
    const rawLimit=Number.parseInt(url.searchParams.get('limit')||'5000',10),limit=Number.isFinite(rawLimit)?Math.min(Math.max(rawLimit,1),10000):5000;
    const queryStored=(maxRows=limit)=>{
      const clauses=Object.keys(filters).map(field=>`${field} LIKE ?`),values=Object.values(filters).map(value=>`%${value}%`);
      const where=clauses.length?`WHERE ${clauses.join(' AND ')}`:'';
      return db.prepare(`SELECT state,district,market,commodity,variety,grade,arrival_date,min_price,max_price,modal_price FROM mandi_price_records ${where} ORDER BY arrival_date DESC,state,district,market,commodity LIMIT ?`).all(...values,maxRows).map(r=>({state:r.state,district:r.district,market:r.market,commodity:r.commodity,variety:r.variety,grade:r.grade,arrivalDate:r.arrival_date,minPrice:r.min_price,maxPrice:r.max_price,modalPrice:r.modal_price}));
    };
    const apiKey=process.env.DATA_GOV_IN_API_KEY?.trim();
    const cacheKey=JSON.stringify({filters,limit}),force=url.searchParams.get('refresh')==='1',cached=mandiCache.get(cacheKey);
    if(!force&&cached&&Date.now()-cached.at<15*60*1000)return json(res,200,{...cached.payload,cached:true});
    if(!apiKey){
      const records=queryStored();
      if(records.length)return json(res,200,{source:'data.gov.in / AGMARKNET',sourceUrl:mandiSourceUrl,fetchedAt:'',snapshotAsOf:records.map(r=>r.arrivalDate).sort().at(-1)||'',total:records.length,records,cached:true,staleSnapshot:true,notice:'Showing saved official observations. Add DATA_GOV_IN_API_KEY and restart to refresh live data.'});
      return json(res,503,{code:'API_KEY_MISSING',error:'Official mandi prices need DATA_GOV_IN_API_KEY in the server .env. No live or sample prices are being shown.'});
    }
    try{
      const pageSize=1000,recordsByKey=new Map();let reportedTotal=0;
      for(let offset=0;offset<limit;offset+=pageSize){
        const upstreamUrl=new URL(`https://api.data.gov.in/resource/${mandiResourceId}`);
        upstreamUrl.searchParams.set('api-key',apiKey);upstreamUrl.searchParams.set('format','json');upstreamUrl.searchParams.set('limit',String(Math.min(pageSize,limit-offset)));upstreamUrl.searchParams.set('offset',String(offset));
        for(const [field,value] of Object.entries(filters))upstreamUrl.searchParams.set(`filters[${field}]`,value);
        const upstream=await fetch(upstreamUrl,{signal:AbortSignal.timeout(20000)});
        if(!upstream.ok)throw new Error(`Provider returned HTTP ${upstream.status}`);
        const body=await upstream.json();if(body.status&&body.status!=='ok')throw new Error('Provider did not return a successful response.');
        reportedTotal=Number(body.total)||reportedTotal;
        const page=(Array.isArray(body.records)?body.records:[]).map(r=>({state:String(r.state||''),district:String(r.district||''),market:String(r.market||''),commodity:String(r.commodity||''),variety:String(r.variety||''),grade:String(r.grade||''),arrivalDate:parseMandiDate(r.arrival_date),minPrice:parseMandiPrice(r.min_price),maxPrice:parseMandiPrice(r.max_price),modalPrice:parseMandiPrice(r.modal_price)})).filter(r=>r.state&&r.market&&r.commodity&&r.arrivalDate&&r.modalPrice!==null);
        for(const record of page){const key=[record.state,record.district,record.market,record.commodity,record.variety,record.grade,record.arrivalDate].join('|');recordsByKey.set(key,record);}
        if(page.length<pageSize||recordsByKey.size>=reportedTotal||recordsByKey.size>=limit)break;
      }
      const records=[...recordsByKey.values()].slice(0,limit),fetchedAt=new Date().toISOString();
      const save=db.prepare(`INSERT INTO mandi_price_records(state,district,market,commodity,variety,grade,arrival_date,min_price,max_price,modal_price,source,fetched_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(state,district,market,commodity,variety,grade,arrival_date) DO UPDATE SET min_price=excluded.min_price,max_price=excluded.max_price,modal_price=excluded.modal_price,source=excluded.source,fetched_at=excluded.fetched_at`);
      db.exec('BEGIN');try{for(const r of records)save.run(r.state,r.district,r.market,r.commodity,r.variety,r.grade,r.arrivalDate,r.minPrice,r.maxPrice,r.modalPrice,'data.gov.in / AGMARKNET',fetchedAt);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
      const payload={source:'data.gov.in / AGMARKNET',sourceUrl:mandiSourceUrl,fetchedAt,snapshotAsOf:records.map(r=>r.arrivalDate).sort().at(-1)||'',total:reportedTotal||records.length,stored:records.length,complete:records.length>=reportedTotal,records,cached:false,staleSnapshot:false};
      mandiCache.set(cacheKey,{at:Date.now(),payload});return json(res,200,payload);
    }catch(error){
      const records=queryStored();
      if(records.length)return json(res,200,{source:'data.gov.in / AGMARKNET',sourceUrl:mandiSourceUrl,fetchedAt:'',snapshotAsOf:records.map(r=>r.arrivalDate).sort().at(-1)||'',total:records.length,records,cached:true,staleSnapshot:true,notice:'Live refresh failed. Showing previously saved official observations.'});
      console.error('[mandi-provider] request failed:',String(error?.cause?.code||error?.name||'upstream error').slice(0,80));
      return json(res,502,{error:'Official mandi prices could not be reached. Check the data.gov.in API key and try again.'});
    }
  }
  if(req.method==='POST'&&url.pathname==='/api/ai/assistant-transcribe'){
    const apiKey=process.env.GROQ_API_KEY;
    if(!apiKey)return json(res,503,{error:'Groq is not configured. Add GROQ_API_KEY to the project .env file and restart the server.'});
    const body=await readBody(req),audio=String(body.audioBase64||'').replace(/^data:[^,]+,/,''),mimeType=String(body.mimeType||'').split(';')[0].toLowerCase();
    if(!audio||audio.length>180000||!/^[A-Za-z0-9+/]+={0,2}$/.test(audio))return json(res,400,{error:'The recording is empty or too long. Record a shorter question.'});
    const extensions={'audio/webm':'webm','audio/ogg':'ogg','audio/mp4':'mp4','audio/wav':'wav','audio/mpeg':'mp3','audio/mp3':'mp3','audio/aac':'aac','audio/flac':'flac'};
    if(!extensions[mimeType])return json(res,415,{error:'This browser audio format is not supported. Try Chrome or Edge.'});
    let upstream,result;
    try {
      const form=new FormData();
      form.append('file',new Blob([Buffer.from(audio,'base64')],{type:mimeType}),`recording.${extensions[mimeType]}`);
      form.append('model','whisper-large-v3-turbo');
      form.append('response_format','json');
      upstream=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{authorization:`Bearer ${apiKey}`},body:form,signal:AbortSignal.timeout(30000)});
      result=await upstream.json();
    } catch {upstream=null;result={};}
    if(!upstream?.ok){const status=upstream?.status;console.error('[groq] voice transcription failed:',status||'NETWORK');const errors={401:'Groq rejected the API key. Check GROQ_API_KEY in .env.',403:'This Groq key does not have access to transcription.',429:'Groq usage limit reached. Try again later.',503:'Groq is temporarily unavailable. Try again in a moment.',NETWORK:'Could not reach Groq. Check the internet connection.'};return json(res,status===429?429:502,{error:errors[status||'NETWORK']||'Could not transcribe this recording.'});}
    const transcript=String(result?.text||'').trim();
    if(!transcript)return json(res,422,{error:'No speech was detected. Try speaking closer to the microphone.'});
    return json(res,200,{transcript:transcript.slice(0,500)});
  }
  if(req.method==='POST'&&url.pathname==='/api/ai/assistant-chat'){
    const apiKey=process.env.GROQ_API_KEY;
    if(!apiKey)return json(res,503,{error:'Groq is not configured. Add GROQ_API_KEY to the project .env file and restart the server.'});
    const body=await readBody(req),language=body.language==='hi'?'hi':'en',question=String(body.question||'').trim().slice(0,1500);
    if(!question)return json(res,400,{error:'A question is required.'});
    const systemInstruction=language==='hi'
      ? 'तुम KisanPulse AI हो, भारत के किसानों के लिए सरल हिंदी कृषि और ऐप सहायक। किसान की भाषा में संक्षिप्त, उपयोगी और स्पष्ट जवाब दो। इस चैट में केवल हिंदी (देवनागरी) या अंग्रेज़ी में जवाब दो; उर्दू या उर्दू लिपि का उपयोग न करो। लाइव मंडी भाव, मौसम, सरकारी योजना की ताज़ा स्थिति, पात्रता, तारीख, राशि या पैदावार के बारे में मनगढ़ंत दावा मत करो; ऐसी जानकारी के लिए ऐप के संबंधित अनुभाग और आधिकारिक स्रोत देखने को कहो। फसल रोग की पक्की पहचान या बिना पर्याप्त संदर्भ कीटनाशक की खुराक मत बताओ; स्थानीय कृषि विज्ञान केंद्र या कृषि अधिकारी से पुष्टि करने को कहो। ऐप इस्तेमाल करने के सवालों में कदम-दर-कदम मदद करो।'
      : 'You are KisanPulse AI, a practical agriculture and app guide for farmers in India. Reply only in the selected language: English for language=en or simple standard Hindi in Devanagari for language=hi. Never use Urdu or Urdu script. Answer concisely with useful steps. Never invent live mandi prices, weather, current government scheme status, eligibility, dates, amounts, or yields; direct users to the relevant app section and official source for current information. Do not claim a certain crop diagnosis or give pesticide doses without adequate context; recommend confirmation with a local KVK or agriculture officer. Give clear step-by-step help for app questions.';
    const messages=[{role:'system',content:systemInstruction},...(Array.isArray(body.history)?body.history.slice(-8).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.text||'').slice(0,1000)})).filter(m=>m.content):[]),{role:'user',content:question}];
    let upstream,result;
    try{upstream=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:process.env.GROQ_CHAT_MODEL||'openai/gpt-oss-20b',messages,temperature:0.4,max_completion_tokens:800}),signal:AbortSignal.timeout(30000)});result=await upstream.json();}catch{upstream=null;result={};}
    if(!upstream?.ok){const status=upstream?.status;console.error('[groq] assistant request failed:',status||'NETWORK',String(result?.error?.code||'').slice(0,40));const errors={401:'Groq rejected the API key. Check GROQ_API_KEY in the project .env file.',403:'This Groq key does not have access to the selected model.',404:'The configured Groq model is unavailable. Check GROQ_CHAT_MODEL.',429:'Groq usage limit reached. Please try again later.',503:'Groq is temporarily unavailable. Please try again in a few minutes.',NETWORK:'Could not reach Groq. Check the internet connection and try again.'};return json(res,status===429?429:502,{error:errors[status||'NETWORK']||'Groq could not answer this message.'});}
    const answer=String(result?.choices?.[0]?.message?.content||'').trim();
    if(!answer)return json(res,502,{error:'Groq returned an empty answer. Please try again.'});
    return json(res,200,{answer,model:result?.model||process.env.GROQ_CHAT_MODEL||'openai/gpt-oss-20b'});
  }
  if(req.method==='POST'&&url.pathname==='/api/ai/scheme-chat'){
    const apiKey=process.env.GROQ_API_KEY;
    if(!apiKey)return json(res,503,{error:'Groq is not configured. Add GROQ_API_KEY to the project .env file and restart the server.'});
    const body=await readBody(req),language=body.language==='hi'?'hi':'en',question=String(body.question||'').trim().slice(0,1500);
    if(!question)return json(res,400,{error:'A question is required.'});
    const scheme=body.scheme&&typeof body.scheme==='object'?body.scheme:null;
    const context=scheme?`\n\nScheme context (provided by KisanPulse catalogue):\nName: ${String(language==='hi'?scheme.nameHi:scheme.nameEn||'').slice(0,200)}\nSummary: ${String(language==='hi'?(scheme.summaryHi||scheme.benefitHi):(scheme.summary||scheme.benefit)||'').slice(0,2500)}\nEligibility: ${String(language==='hi'?scheme.eligibilityHi:scheme.eligibility||'').slice(0,1500)}\nOfficial portal: ${String(scheme.portalUrl||'').slice(0,300)}\nSource: ${String(scheme.sourceUrl||scheme.portalUrl||'').slice(0,300)}`:'';
    const systemInstruction=language==='hi'
      ? 'तुम KisanPulse AI के सरल हिंदी कृषि एवं सरकारी योजना सलाहकार हो। किसान की भाषा में छोटे, स्पष्ट कदमों में जवाब दो। योजना के लाभ, पात्रता, दस्तावेज और आवेदन प्रक्रिया समझाओ। सरकारी जानकारी, तारीख, राशि या पात्रता का अनुमान मत लगाओ। संदर्भ उपलब्ध न हो तो साफ कहो और आधिकारिक स्रोत देखने को कहो। यह सामान्य मार्गदर्शन है; अंतिम पात्रता संबंधित सरकारी पोर्टल पर जाँचें।'+context
      : 'You are KisanPulse AI, a practical agriculture and government-scheme advisor for Indian farmers. Answer in simple, concise English with clear steps. Explain benefits, eligibility, documents and application steps when relevant. Never invent official facts, dates, amounts or eligibility. If the supplied context is insufficient, say so and point to the official source. Remind users to verify final eligibility on the government portal.'+context;
    const messages=[{role:'system',content:systemInstruction},...(Array.isArray(body.history)?body.history.slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.text||'').slice(0,1500)})).filter(m=>m.content):[]),{role:'user',content:question}];
    let upstream,result;
    try{upstream=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:process.env.GROQ_CHAT_MODEL||'openai/gpt-oss-20b',messages,temperature:0.4,max_completion_tokens:800}),signal:AbortSignal.timeout(30000)});result=await upstream.json();}catch{upstream=null;result={};}
    if(!upstream?.ok){const status=upstream?.status;console.error('[groq] scheme advisor failed:',status||'NETWORK',String(result?.error?.code||'').slice(0,40));const errors={401:'Groq rejected the API key. Check GROQ_API_KEY in the project .env file.',403:'This Groq key does not have access to the selected model.',404:'The configured Groq model is unavailable. Check GROQ_CHAT_MODEL.',429:'Groq usage limit reached. Please try again later.',503:'Groq is temporarily unavailable. Please try again in a few minutes.',NETWORK:'Could not reach Groq. Check the internet connection and try again.'};return json(res,status===429?429:502,{error:errors[status||'NETWORK']||'The AI service could not answer. Check the Groq API key and model access.'});}
    const answer=String(result?.choices?.[0]?.message?.content||'').trim();
    if(!answer)return json(res,502,{error:'The AI service returned an empty answer. Please try again.'});
    return json(res,200,{answer,model:result?.model||process.env.GROQ_CHAT_MODEL||'openai/gpt-oss-20b'});
  }
  if(req.method==='GET'&&url.pathname==='/api/schemes')return json(res,200,{schemes:listSchemes(url.searchParams.get('q')||''),total:db.prepare('SELECT COUNT(*) AS n FROM schemes').get().n});
  if(req.method==='GET'&&url.pathname==='/api/marketplace/listings'){
    const role=url.searchParams.get('role'),crop=url.searchParams.get('crop'),state=url.searchParams.get('state');
    const rows=db.prepare(`SELECT * FROM marketplace_listings WHERE active=1 AND (?='' OR role=?) AND (?='' OR lower(crop)=lower(?)) AND (?='' OR lower(state)=lower(?)) ORDER BY created_at DESC LIMIT 200`).all(role||'',role||'',crop||'',crop||'',state||'',state||'');
    return json(res,200,{listings:rows.map(r=>{const l=marketListing(r);delete l.phone;return l;})});
  }
  if(req.method==='POST'&&url.pathname==='/api/marketplace/listings'){
    const x=await readBody(req);const role=x.role==='buyer'?'buyer':x.role==='farmer'?'farmer':'';
    const account=getAuthenticatedUser(req,db);if(account.role==='buyer'&&role!=='buyer')return json(res,403,{error:'Buyer accounts can only publish buyer demand posts.'});
    const crop=String(x.crop||'').trim().slice(0,80),name=String(x.displayName||'').trim().slice(0,100),state=String(x.state||'').trim().slice(0,100),district=String(x.district||'').trim().slice(0,100);
    const quantity=Number(x.quantityQuintals),minQty=Number(x.minQuantityQuintals??1),price=Number(x.expectedPricePerQuintal),minPrice=Number(x.minPricePerQuintal),maxPrice=Number(x.maxPricePerQuintal);
    if(!role||!crop||!name||!state||!district||![quantity,minQty,price,minPrice,maxPrice].every(n=>Number.isFinite(n)&&n>0)||minQty>quantity||minPrice>maxPrice||price<minPrice||price>maxPrice)return json(res,400,{error:'Check role, crop, name, location, quantity and price ranges.'});
    const id=`KP-${randomUUID().slice(0,8).toUpperCase()}`;
    db.prepare(`INSERT INTO marketplace_listings(id,role,display_name,phone,crop,variety,quantity,min_quantity,expected_price,min_price,max_price,ready_date,state,district,grade,description,user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,role,name,String(x.phone||'').replace(/[^0-9+]/g,'').slice(0,18),crop,String(x.variety||'').slice(0,100),quantity,minQty,price,minPrice,maxPrice,String(x.readyDate||'').slice(0,20),state,district,String(x.grade||'').slice(0,100),String(x.description||'').slice(0,1000),account.id);
    return json(res,201,{listing:marketListing(getListing(id)),matches:marketMatches(getListing(id))});
  }
  const marketListingMatch=url.pathname.match(/^\/api\/marketplace\/listings\/([A-Z0-9-]+)\/matches$/);
  if(req.method==='GET'&&marketListingMatch){const listing=getListing(marketListingMatch[1]);if(!listing)return json(res,404,{error:'Listing not found.'});if(listing.user_id!==getAuthenticatedUser(req,db).id)return json(res,403,{error:'Only the account that created this listing can view its matches.'});return json(res,200,{matches:marketMatches(listing)});}
  const marketPhotoMatch=url.pathname.match(/^\/api\/marketplace\/photos\/([A-Z0-9-]+)$/);
  if(req.method==='POST'&&marketPhotoMatch){const listing=getListing(marketPhotoMatch[1]);if(!listing)return json(res,404,{error:'Listing not found.'});if(listing.user_id!==getAuthenticatedUser(req,db).id)return json(res,403,{error:'Only the account that created this listing can add its photo.'});const mime=String(req.headers['content-type']||'');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime];if(!ext)return json(res,415,{error:'Use a JPG, PNG or WebP crop photo.'});const data=await readUpload(req,5*1024*1024);if(!data.length)return json(res,400,{error:'Photo is empty.'});const dir=resolve(here,'uploads/marketplace');mkdirSync(dir,{recursive:true});const file=`${listing.id}.${ext}`;writeFileSync(resolve(dir,file),data);db.prepare('UPDATE marketplace_listings SET photo_name=?,photo_mime=? WHERE id=?').run(file,mime,listing.id);return json(res,201,{photoUrl:`/api/marketplace/photos/${listing.id}`});}
  if(req.method==='GET'&&marketPhotoMatch){const row=getListing(marketPhotoMatch[1]);if(!row?.photo_name)return json(res,404,{error:'Photo not found.'});res.writeHead(200,{'content-type':row.photo_mime,'cache-control':'public, max-age=3600'});return createReadStream(resolve(here,'uploads/marketplace',row.photo_name)).pipe(res);}
  if(req.method==='POST'&&url.pathname==='/api/marketplace/messages'){
    const x=await readBody(req),farmerId=String(x.farmerListingId||''),buyerId=String(x.buyerListingId||''),senderId=String(x.senderListingId||''),kind=x.kind==='voice'?'voice':'text';
    const farmer=getListing(farmerId),buyer=getListing(buyerId),account=getAuthenticatedUser(req,db);if(!farmer||!buyer||farmer.role!=='farmer'||buyer.role!=='buyer'||![farmerId,buyerId].includes(senderId))return json(res,400,{error:'A valid matched farmer and buyer listing are required.'});
    if(![farmer.user_id,buyer.user_id].includes(account.id)||getListing(senderId)?.user_id!==account.id)return json(res,403,{error:'Only the matched farmer or buyer account can chat in this listing pair.'});
    if(!marketMatches(farmer).some(m=>m.listing.id===buyerId))return json(res,403,{error:'Chat is available only after a marketplace match.'});
    const body=String(x.body||'').trim().slice(0,2000);if(kind==='text'&&!body)return json(res,400,{error:'Message is required.'});const id=randomUUID();
    db.prepare('INSERT INTO marketplace_messages(id,farmer_listing_id,buyer_listing_id,sender_listing_id,kind,body) VALUES(?,?,?,?,?,?)').run(id,farmerId,buyerId,senderId,kind,body);const recipientId=senderId===farmerId?buyerId:farmerId;db.prepare('INSERT INTO marketplace_notifications(id,recipient_listing_id,sender_listing_id,message_id,kind) VALUES(?,?,?,?,?)').run(randomUUID(),recipientId,senderId,id,kind);return json(res,201,{id,notificationCreated:true});
  }
  if(req.method==='GET'&&url.pathname==='/api/marketplace/notifications'){
    const account=getAuthenticatedUser(req,db),requested=(url.searchParams.get('listingIds')||'').split(',').filter(id=>/^[A-Z0-9-]{5,40}$/.test(id)).slice(0,30);const ids=requested.filter(id=>db.prepare('SELECT 1 FROM marketplace_listings WHERE id=? AND user_id=?').get(id,account.id));if(!ids.length)return json(res,200,{notifications:[]});const marks=ids.map(()=>'?').join(',');const rows=db.prepare(`SELECT n.id,n.recipient_listing_id,n.sender_listing_id,n.kind,n.created_at,l.crop,l.display_name FROM marketplace_notifications n JOIN marketplace_listings l ON l.id=n.sender_listing_id WHERE n.recipient_listing_id IN (${marks}) AND n.read_at IS NULL ORDER BY n.created_at DESC LIMIT 100`).all(...ids);return json(res,200,{notifications:rows.map(n=>({id:n.id,recipientListingId:n.recipient_listing_id,senderListingId:n.sender_listing_id,kind:n.kind,createdAt:n.created_at,crop:n.crop,senderName:n.display_name}))});
  }
  const marketNotificationRead=url.pathname.match(/^\/api\/marketplace\/notifications\/([a-f0-9-]+)\/read$/);
  if(req.method==='PATCH'&&marketNotificationRead){const x=await readBody(req),listingId=String(x.listingId||''),account=getAuthenticatedUser(req,db);if(!db.prepare('SELECT 1 FROM marketplace_listings WHERE id=? AND user_id=?').get(listingId,account.id))return json(res,403,{error:'These notifications do not belong to this account.'});const result=db.prepare('UPDATE marketplace_notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND recipient_listing_id=? AND read_at IS NULL').run(marketNotificationRead[1],listingId);return json(res,200,{ok:true,updated:Boolean(result.changes)});}
  if(req.method==='PATCH'&&url.pathname==='/api/marketplace/notifications/read-all'){const x=await readBody(req),listingId=String(x.listingId||''),account=getAuthenticatedUser(req,db);if(!db.prepare('SELECT 1 FROM marketplace_listings WHERE id=? AND user_id=?').get(listingId,account.id))return json(res,403,{error:'These notifications do not belong to this account.'});db.prepare('UPDATE marketplace_notifications SET read_at=CURRENT_TIMESTAMP WHERE recipient_listing_id=? AND read_at IS NULL').run(listingId);return json(res,200,{ok:true});}
  const chatMatch=url.pathname.match(/^\/api\/marketplace\/messages\/([A-Z0-9-]+)\/([A-Z0-9-]+)$/);
  if(req.method==='GET'&&chatMatch){const [a,b]=chatMatch.slice(1),account=getAuthenticatedUser(req,db);if(!db.prepare('SELECT 1 FROM marketplace_listings WHERE id IN (?,?) AND user_id=? LIMIT 1').get(a,b,account.id))return json(res,403,{error:'Only matched listing owners can read this chat.'});const rows=db.prepare(`SELECT id,sender_listing_id,kind,body,media_name,media_mime,created_at FROM marketplace_messages WHERE farmer_listing_id=? AND buyer_listing_id=? ORDER BY created_at,id LIMIT 300`).all(a,b);return json(res,200,{messages:rows.map(m=>({id:m.id,senderListingId:m.sender_listing_id,kind:m.kind,body:m.body,mediaUrl:m.media_name?`/api/marketplace/voice/${m.id}`:'',createdAt:m.created_at}))});}
  if(req.method==='POST'&&url.pathname==='/api/marketplace/voice'){
    const farmerId=String(req.headers['x-farmer-listing']||''),buyerId=String(req.headers['x-buyer-listing']||''),senderId=String(req.headers['x-sender-listing']||''),account=getAuthenticatedUser(req,db);const farmer=getListing(farmerId),buyer=getListing(buyerId);if(!farmer||!buyer||![farmerId,buyerId].includes(senderId)||getListing(senderId)?.user_id!==account.id||!marketMatches(farmer).some(m=>m.listing.id===buyerId))return json(res,403,{error:'Voice messages require an owned listing in a valid matched pair.'});
    const mime=String(req.headers['content-type']||'').split(';')[0],ext={'audio/webm':'webm','audio/ogg':'ogg','audio/mp4':'m4a'}[mime];if(!ext)return json(res,415,{error:'Voice notes must be WebM, OGG or MP4 audio.'});const data=await readUpload(req,10*1024*1024);if(!data.length)return json(res,400,{error:'Voice note is empty.'});const id=randomUUID(),dir=resolve(here,'uploads/marketplace');mkdirSync(dir,{recursive:true});const file=`voice-${id}.${ext}`;writeFileSync(resolve(dir,file),data);db.prepare('INSERT INTO marketplace_messages(id,farmer_listing_id,buyer_listing_id,sender_listing_id,kind,media_name,media_mime) VALUES(?,?,?,?,?,?,?)').run(id,farmerId,buyerId,senderId,'voice',file,mime);const recipientId=senderId===farmerId?buyerId:farmerId;db.prepare('INSERT INTO marketplace_notifications(id,recipient_listing_id,sender_listing_id,message_id,kind) VALUES(?,?,?,?,?)').run(randomUUID(),recipientId,senderId,id,'voice');return json(res,201,{id,mediaUrl:`/api/marketplace/voice/${id}`,notificationCreated:true});
  }
  const voiceMatch=url.pathname.match(/^\/api\/marketplace\/voice\/([a-f0-9-]+)$/);
  if(req.method==='GET'&&voiceMatch){const m=db.prepare('SELECT media_name,media_mime,farmer_listing_id,buyer_listing_id FROM marketplace_messages WHERE id=? AND kind=\'voice\'').get(voiceMatch[1]);if(!m)return json(res,404,{error:'Voice note not found.'});const account=getAuthenticatedUser(req,db);if(!db.prepare('SELECT 1 FROM marketplace_listings WHERE id IN (?,?) AND user_id=? LIMIT 1').get(m.farmer_listing_id,m.buyer_listing_id,account.id))return json(res,403,{error:'Only matched listing owners can play this voice note.'});res.writeHead(200,{'content-type':m.media_mime,'cache-control':'private, no-store'});return createReadStream(resolve(here,'uploads/marketplace',m.media_name)).pipe(res);}
  const schemeVideoMatch=url.pathname.match(/^\/api\/schemes\/([a-z0-9-]+)\/videos$/);
  if(req.method==='GET'&&schemeVideoMatch){const videos=db.prepare('SELECT id,scheme_id,title_en,title_hi,mime_type,uploaded_at FROM scheme_videos WHERE scheme_id=? ORDER BY uploaded_at DESC').all(schemeVideoMatch[1]).map(v=>({id:v.id,schemeId:v.scheme_id,titleEn:v.title_en,titleHi:v.title_hi,mimeType:v.mime_type,uploadedAt:v.uploaded_at,url:`/api/scheme-videos/${v.id}`}));return json(res,200,{videos});}
  const videoFileMatch=url.pathname.match(/^\/api\/scheme-videos\/([a-f0-9-]+)$/);
  if(req.method==='GET'&&videoFileMatch){const video=db.prepare('SELECT file_name,mime_type FROM scheme_videos WHERE id=?').get(videoFileMatch[1]);if(!video)return json(res,404,{error:'Video not found'});res.writeHead(200,{'content-type':video.mime_type,'cache-control':'public, max-age=3600','content-disposition':'inline'});return createReadStream(resolve(here,'uploads',video.file_name)).pipe(res);}
  if(req.method==='POST'&&url.pathname==='/api/registration-requests'){
    if(getAuthenticatedUser(req,db)?.role!=='farmer')return json(res,403,{error:'Scheme registration assistance is available to farmer accounts.'});
    const r=await readBody(req);const required=['schemeId','schemeNameEn','farmerName','phone','state'];if(required.some(k=>!String(r[k]||'').trim()))return json(res,400,{error:'Scheme, farmer name, phone and state are required.'});
    if(r.paymentMode!=='demo'||r.paymentStatus!=='demo_paid'||Number(r.paymentAmount)!==199||!['upi','card'].includes(r.paymentMethod))return json(res,402,{error:'Complete the clearly labelled demo payment step first.'});
    const phone=String(r.phone).replace(/[\s()+-]/g,'');if(!/^\d{10,15}$/.test(phone))return json(res,400,{error:'Enter a valid phone number.'});
    const id=`KP-${randomUUID().slice(0,8).toUpperCase()}`,demoPaymentId=`DEMO-${randomUUID().slice(0,10).toUpperCase()}`;db.prepare('INSERT INTO registration_requests(id,scheme_id,scheme_name_en,scheme_name_hi,farmer_name,phone,state,district,crop,notes,language,payment_status,payment_ref,payment_amount,payment_method) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,String(r.schemeId).slice(0,100),String(r.schemeNameEn).slice(0,200),String(r.schemeNameHi||'').slice(0,200),String(r.farmerName).trim().slice(0,120),phone,String(r.state).trim().slice(0,100),String(r.district||'').trim().slice(0,100),String(r.crop||'').trim().slice(0,120),String(r.notes||'').trim().slice(0,1000),r.language==='hi'?'hi':'en','demo_paid',demoPaymentId,199,r.paymentMethod);return json(res,201,{id,status:'pending',paymentStatus:'demo_paid',demoPaymentId,amount:199,realCharge:false});
  }
  if(req.method==='POST'&&url.pathname==='/api/registration-requests/history'){
    const lookup=await readBody(req);const requestId=String(lookup.requestId||'').trim().toUpperCase();const phone=String(lookup.phone||'').replace(/[\s()+-]/g,'');
    if(!/^KP-[A-F0-9]{8}$/.test(requestId)||!/^\d{10,15}$/.test(phone))return json(res,400,{error:'Enter the request ID and phone number used for that request.'});
    const r=db.prepare('SELECT id,scheme_name_en,scheme_name_hi,status,payment_status,payment_ref,payment_amount,payment_method,created_at,updated_at FROM registration_requests WHERE id=? AND phone=?').get(requestId,phone);
    if(!r)return json(res,404,{error:'No matching request was found. Check the request ID and phone number.'});
    return json(res,200,{request:{id:r.id,schemeNameEn:r.scheme_name_en,schemeNameHi:r.scheme_name_hi,status:r.status,paymentStatus:r.payment_status,paymentRef:r.payment_ref,paymentAmount:r.payment_amount,paymentMethod:r.payment_method,createdAt:r.created_at,updatedAt:r.updated_at,realCharge:false}});
  }
  if(req.method==='GET'&&url.pathname==='/api/admin/registration-requests'){
    if(!requireAdmin(req,res))return;const requests=db.prepare('SELECT * FROM registration_requests ORDER BY CASE status WHEN \'pending\' THEN 0 WHEN \'approved\' THEN 1 ELSE 2 END,created_at DESC').all().map(r=>({id:r.id,schemeId:r.scheme_id,schemeNameEn:r.scheme_name_en,schemeNameHi:r.scheme_name_hi,farmerName:r.farmer_name,phone:r.phone,state:r.state,district:r.district,crop:r.crop,notes:r.notes,language:r.language,status:r.status,adminNote:r.admin_note,paymentStatus:r.payment_status,paymentRef:r.payment_ref,paymentAmount:r.payment_amount,paymentMethod:r.payment_method,createdAt:r.created_at,updatedAt:r.updated_at}));return json(res,200,{requests});
  }
  const requestStatusMatch=url.pathname.match(/^\/api\/admin\/registration-requests\/([A-Z0-9-]+)$/);
  if(req.method==='PATCH'&&requestStatusMatch){if(!requireAdmin(req,res))return;const r=await readBody(req);if(!['approved','rejected','registered'].includes(r.status))return json(res,400,{error:'Status must be approved, rejected or registered.'});const result=db.prepare('UPDATE registration_requests SET status=?,admin_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(r.status,String(r.adminNote||'').trim().slice(0,500),requestStatusMatch[1]);if(!result.changes)return json(res,404,{error:'Request not found.'});return json(res,200,{ok:true,status:r.status});}
  const videoUploadMatch=url.pathname.match(/^\/api\/admin\/schemes\/([a-z0-9-]+)\/videos$/);
  if(req.method==='POST'&&videoUploadMatch){if(!requireAdmin(req,res))return;const schemeId=videoUploadMatch[1];const mimeType=String(req.headers['content-type']||'').split(';')[0];const extensions={'video/mp4':'mp4','video/webm':'webm'};if(!extensions[mimeType])return json(res,415,{error:'Upload an MP4 or WebM video.'});const titleEn=String(req.headers['x-video-title-en']||'').trim().slice(0,200);const titleHi=String(req.headers['x-video-title-hi']||'').trim().slice(0,200);if(!titleEn)return json(res,400,{error:'English video title is required.'});const data=await readUpload(req);if(!data.length)return json(res,400,{error:'Choose a video file first.'});const id=randomUUID();const fileName=`${id}.${extensions[mimeType]}`;const uploadDir=resolve(here,'uploads');mkdirSync(uploadDir,{recursive:true});writeFileSync(resolve(uploadDir,fileName),data,{flag:'wx'});db.prepare('INSERT INTO scheme_videos(id,scheme_id,title_en,title_hi,file_name,mime_type) VALUES(?,?,?,?,?,?)').run(id,schemeId,titleEn,titleHi,fileName,mimeType);return json(res,201,{video:{id,schemeId,titleEn,titleHi,mimeType,url:`/api/scheme-videos/${id}`}});}
  if(req.method==='POST'&&url.pathname==='/api/profiles'){if(getAuthenticatedUser(req,db)?.role!=='farmer')return json(res,403,{error:'Scheme alerts are available to farmer accounts.'});const p=await readBody(req);const id=String(p.id||crypto.randomUUID());if(!String(p.state||'').trim())return json(res,400,{error:'State is required'});const v=[id,String(p.state).slice(0,100),String(p.district||'').slice(0,100),JSON.stringify(Array.isArray(p.crops)?p.crops.slice(0,20).map(String):[]),JSON.stringify(Array.isArray(p.interests)?p.interests.slice(0,20).map(String):[]),p.language==='hi'?'hi':'en',p.alertsEnabled?1:0];db.prepare(`INSERT INTO farmer_profiles(id,state,district,crops_json,interests_json,language,alerts_enabled) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,district=excluded.district,crops_json=excluded.crops_json,interests_json=excluded.interests_json,language=excluded.language,alerts_enabled=excluded.alerts_enabled,updated_at=CURRENT_TIMESTAMP`).run(...v);return json(res,200,{id,alertsEnabled:Boolean(v[6])});}
  if(req.method==='GET'&&url.pathname==='/api/notifications'){const id=url.searchParams.get('profileId');if(!id)return json(res,400,{error:'profileId is required'});const items=db.prepare(`SELECT n.*,s.name_en,s.name_hi,s.launch_date FROM notifications n JOIN schemes s ON s.id=n.scheme_id WHERE n.profile_id=? ORDER BY n.created_at DESC LIMIT 100`).all(id).map(n=>({id:n.id,schemeId:n.scheme_id,nameEn:n.name_en,nameHi:n.name_hi,launchDate:n.launch_date,messageEn:n.message_en,messageHi:n.message_hi,createdAt:n.created_at,read:Boolean(n.read_at)}));return json(res,200,{notifications:items});}
  const readMatch=url.pathname.match(/^\/api\/notifications\/(\d+)\/read$/);if(req.method==='PATCH'&&readMatch){db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=?').run(Number(readMatch[1]));return json(res,200,{ok:true});}
  if(req.method==='POST'&&url.pathname==='/api/admin/schemes'){if(!requireAdmin(req,res))return;const s=await readBody(req);const required=['id','nameEn','nameHi','category','categoryHi','benefit','benefitHi','eligibility','eligibilityHi','portalUrl','sourceUrl'];if(required.some(k=>!String(s[k]||'').trim()))return json(res,400,{error:'Both languages, eligibility, and official portal/source links are required.'});if(!/^https:\/\//i.test(s.portalUrl)||!/^https:\/\//i.test(s.sourceUrl))return json(res,400,{error:'Use HTTPS official links.'});s.id=String(s.id).toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,80);s.state=String(s.state||'Central (All India)');s.tags=Array.isArray(s.tags)?s.tags.map(String):[];s.summary=s.summary||s.benefit;s.summaryHi=s.summaryHi||s.benefitHi;s.sourceName=s.sourceName||'Official government source';s.verifiedAt=new Date().toISOString().slice(0,10);db.prepare(`INSERT INTO schemes(id,name_en,name_hi,category_en,category_hi,benefit_en,benefit_hi,eligibility_en,eligibility_hi,summary_en,summary_hi,launch_date,state,tags_json,portal_url,source_url,source_name,verified_at,is_new) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET name_en=excluded.name_en,name_hi=excluded.name_hi,category_en=excluded.category_en,category_hi=excluded.category_hi,benefit_en=excluded.benefit_en,benefit_hi=excluded.benefit_hi,eligibility_en=excluded.eligibility_en,eligibility_hi=excluded.eligibility_hi,summary_en=excluded.summary_en,summary_hi=excluded.summary_hi,launch_date=excluded.launch_date,state=excluded.state,tags_json=excluded.tags_json,portal_url=excluded.portal_url,source_url=excluded.source_url,source_name=excluded.source_name,verified_at=excluded.verified_at,is_new=1`).run(s.id,s.nameEn,s.nameHi,s.category,s.categoryHi,s.benefit,s.benefitHi,s.eligibility,s.eligibilityHi,s.summary,s.summaryHi,s.launchDate||null,s.state,JSON.stringify(s.tags),s.portalUrl,s.sourceUrl,s.sourceName,s.verifiedAt);const profiles=db.prepare('SELECT * FROM farmer_profiles WHERE alerts_enabled=1').all();const notify=db.prepare('INSERT OR IGNORE INTO notifications(profile_id,scheme_id,message_en,message_hi) VALUES(?,?,?,?)');const saved={...s,category_en:s.category,tags_json:JSON.stringify(s.tags)};db.exec('BEGIN');try{profiles.forEach(p=>{if(matchesProfile(p,saved))notify.run(p.id,s.id,`A new scheme may fit your farm: ${s.nameEn}. Check eligibility on the official portal.`,`आपके खेत के लिए नई योजना उपयोगी हो सकती है: ${s.nameHi}। पात्रता आधिकारिक पोर्टल पर जाँचें।`);});db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}return json(res,201,{scheme:s,notificationsCreated:profiles.filter(p=>matchesProfile(p,saved)).length});}
  return json(res,404,{error:'Not found'});
}catch(error){console.error(error);return json(res,500,{error:'Server error'});}});
const port=Number(process.env.API_PORT||3001);server.listen(port,'127.0.0.1',()=>console.log(`KisanPulse API listening at http://localhost:${port}`));
