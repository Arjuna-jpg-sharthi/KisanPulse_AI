import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Leaf, MessageCircle, Send, X } from 'lucide-react';
import './KisanAssistant.css';

const VIEWS = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  mandi: { en: 'Smart Mandi', hi: 'स्मार्ट मंडी' },
  farming: { en: 'Crop Health & Farming', hi: 'फसल स्वास्थ्य और खेती' },
  schemes: { en: 'Government Schemes', hi: 'सरकारी योजनाएँ' },
  settings: { en: 'Settings & Sync', hi: 'सेटिंग्स और सिंक' }
};

const getSaved = (key) => {
  try { return JSON.parse(localStorage.getItem(`kisanpulse_${key}`) || '[]'); }
  catch { return []; }
};

function answerQuestion(question, language) {
  const q = question.toLowerCase();
  const isHi = language === 'hi';
  const reply = (en, hi, page, labelEn, labelHi) => ({ text: isHi ? hi : en, page, label: isHi ? labelHi : labelEn });
  if (/^(hi|hello|hey|namaste|नमस्ते|हेलो)[!.\s]*$/.test(q)) return reply('Namaste! Ask me how to use KisanPulse or about the farming tools and guidance available here.', 'नमस्ते! KisanPulse इस्तेमाल करने या खेती के औज़ारों के बारे में पूछें।');
  if (/what can you|help|where|how do i|how can i|कहाँ|कैसे|मदद/.test(q)) return reply('I can guide you to mandi prices and profit estimates, crop observations, irrigation and weather guidance, government schemes, and app settings. Tell me what you want to do.', 'मैं मंडी भाव और लाभ अनुमान, फसल निरीक्षण, सिंचाई और मौसम मार्गदर्शन, सरकारी योजनाओं और ऐप सेटिंग्स में मदद कर सकता हूँ। बताइए आप क्या करना चाहते हैं।');
  if (/marketplace|buyer|trade|crop post|buying demand|खरीदार|व्यापार|खरीद मांग/.test(q)) return reply('Open Kisan Vyapar to post a crop listing or buyer demand, then review ranked matches. This is a local demo: posts are stored in this browser and are not sent to real buyers.', 'फसल सूची या खरीदार की मांग पोस्ट करने और मिलान देखने के लिए किसान व्यापार खोलें। यह स्थानीय डेमो है; पोस्ट इसी ब्राउज़र में रहती हैं और असली खरीदारों को नहीं भेजी जातीं।', 'marketplace', 'Open Kisan Vyapar', 'किसान व्यापार खोलें');
  if (/mandi|price|rate|sell|profit|भाव|मंडी|लाभ|बेच/.test(q)) return reply('Open Smart Mandi to compare market rates and estimate net proceeds after transport and other costs. Check the data source and timestamp; benchmark prices are not guaranteed live quotes.', 'भावों की तुलना और खर्च घटाकर शुद्ध आय का अनुमान लगाने के लिए स्मार्ट मंडी खोलें। डेटा का स्रोत और समय जाँचें; बेंचमार्क भाव लाइव भाव की गारंटी नहीं हैं।', 'mandi', 'Open Smart Mandi', 'स्मार्ट मंडी खोलें');
  if (/crop|disease|pest|leaf|symptom|plant|फसल|रोग|कीट|पत्ती/.test(q)) return reply('Open Crop Health & Farming to record symptoms and a photo, review saved observations, and get cautious next-step guidance. Similar symptoms can have different causes, so this tool does not confirm a disease; consult your local KVK or agriculture officer for diagnosis.', 'लक्षण और फोटो दर्ज करने, निरीक्षण देखने और सावधानीपूर्वक अगले कदम जानने के लिए फसल स्वास्थ्य और खेती खोलें। एक जैसे लक्षणों के अलग कारण हो सकते हैं; यह रोग की पुष्टि नहीं करता। जाँच के लिए स्थानीय कृषि विज्ञान केंद्र या कृषि अधिकारी से संपर्क करें।', 'farming', 'Open Crop Health', 'फसल स्वास्थ्य खोलें');
  if (/irrigat|water|rain|सिंचाई|पानी|बारिश/.test(q)) return reply('The farming module offers stage based irrigation guidance using recent rain, soil hand feel, and days since watering. A phone cannot measure soil moisture; check the soil in the field before acting.', 'खेती मॉड्यूल हाल की बारिश, मिट्टी की नमी को हाथ से जाँचने और पिछली सिंचाई के दिनों के आधार पर मार्गदर्शन देता है। फोन मिट्टी की नमी नहीं माप सकता; निर्णय से पहले खेत की मिट्टी जाँचें।', 'farming', 'Open Farming Tools', 'खेती के औज़ार खोलें');
  if (/weather|spray|wind|मौसम|छिड़काव|हवा/.test(q)) return reply('Open Crop Health & Farming for weather and spray window guidance. Forecasts can change; verify current local conditions before spraying, especially wind and rain.', 'मौसम और छिड़काव समय के मार्गदर्शन के लिए फसल स्वास्थ्य और खेती खोलें। पूर्वानुमान बदल सकता है; छिड़काव से पहले स्थानीय हवा और बारिश की स्थिति जाँचें।', 'farming', 'Open Weather Guidance', 'मौसम मार्गदर्शन खोलें');
  if (/scheme|subsid|pm.?kisan|insurance|योजना|सब्सिडी|बीमा|किसान सम्मान/.test(q)) return reply('Open Government Schemes to browse scheme information and eligibility guidance. Confirm current rules, dates, and application steps on the official government portal before applying.', 'योजनाओं और पात्रता मार्गदर्शन के लिए सरकारी योजनाएँ खोलें। आवेदन से पहले नियम, तारीख और प्रक्रिया आधिकारिक सरकारी पोर्टल पर जाँचें।', 'schemes', 'Explore Schemes', 'योजनाएँ देखें');
  if (/mkisan|m.?kisan|sms advis|text advis|mobile advis|किसान एसएमएस|कृषि एसएमएस/.test(q)) return { text: isHi ? 'mKisan भारत सरकार का मोबाइल कृषि सलाह पोर्टल है। वहाँ अपने क्षेत्र और रुचि के अनुसार कृषि एवं संबद्ध क्षेत्रों की सलाह देखें। सेवा की उपलब्धता और पंजीकरण के मौजूदा निर्देश आधिकारिक पोर्टल पर जाँचें।' : 'mKisan is the Government of India’s mobile agriculture advisory portal. Visit it for agriculture and allied-sector advisories relevant to your area and interests. Check the official portal for current service availability and registration instructions.', externalUrl: 'https://mkisan.gov.in/', label: isHi ? 'mKisan पोर्टल खोलें' : 'Open mKisan portal' };
  if (/language|hindi|english|भाषा|हिंदी|अंग्रेज़ी/.test(q)) return reply('Use the language control in the header or Settings to switch between English and Hindi.', 'अंग्रेज़ी और हिंदी बदलने के लिए हेडर में भाषा नियंत्रण या सेटिंग्स का उपयोग करें।', 'settings', 'Open Settings', 'सेटिंग्स खोलें');
  if (/offline|internet|sync|ऑफलाइन|इंटरनेट|सिंक/.test(q)) return reply('KisanPulse shows the current connection state in the header. Crop calculations, irrigation guidance, saved observations, and buyer drafts work locally; live weather requires an internet connection.', 'KisanPulse हेडर में कनेक्शन स्थिति दिखाता है। फसल गणना, सिंचाई मार्गदर्शन, सहेजे गए निरीक्षण और खरीदार ड्राफ्ट डिवाइस पर चलते हैं; लाइव मौसम के लिए इंटरनेट चाहिए।', 'settings', 'Open Settings', 'सेटिंग्स खोलें');
  if (/dashboard|home|डैशबोर्ड|होम/.test(q)) return reply('The Dashboard summarizes farm indicators and offers shortcuts to the main tools.', 'डैशबोर्ड खेत के संकेतकों का सार और मुख्य औज़ारों के शॉर्टकट दिखाता है।', 'dashboard', 'Open Dashboard', 'डैशबोर्ड खोलें');
  return reply('I’m the KisanPulse guide. Ask me about mandi rates, profit estimates, crop observations, irrigation, weather, schemes, or app settings.', 'मैं KisanPulse मार्गदर्शक हूँ। मंडी भाव, लाभ अनुमान, फसल निरीक्षण, सिंचाई, मौसम, योजनाओं या ऐप सेटिंग्स के बारे में पूछें।');
}

export default function KisanAssistant({ onNavigate, language = 'en' }) {
  const isHi = language === 'hi';
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [tab, setTab] = useState('guide');
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState(() => [{ role: 'assistant', text: isHi ? 'नमस्ते! मैं KisanPulse मार्गदर्शक हूँ। आप खेती और ऐप के बारे में मुझसे पूछ सकते हैं।' : 'Namaste! I’m your KisanPulse guide. Ask me about farming or how to use the app.' }]);
  const [activity, setActivity] = useState({ reports: [], drafts: [] });
  const bottomRef = useRef(null);
  const labels = useMemo(() => isHi ? { title: 'KisanPulse सहायक', subtitle: 'खेती और ऐप मार्गदर्शन', guide: 'मार्गदर्शक', updates: 'मेरी गतिविधि', ask: 'अपना सवाल लिखें…', send: 'भेजें', crop: 'फसल निरीक्षण', drafts: 'खरीदार ड्राफ्ट', none: 'अभी इस डिवाइस पर कुछ सहेजा नहीं गया है।', intro: 'मंडी, फसल, सिंचाई, मौसम या योजनाओं के बारे में पूछें।' } : { title: 'KisanPulse Assistant', subtitle: 'Farm help and app guide', guide: 'Guide', updates: 'My activity', ask: 'Ask about your farm…', send: 'Send', crop: 'Crop observations', drafts: 'Buyer enquiry drafts', none: 'Nothing saved on this device yet.', intro: 'Ask about mandi, crops, irrigation, weather, or schemes.' }, [isHi]);

  useEffect(() => { if (open) { setActivity({ reports: getSaved('crop_reports'), drafts: getSaved('market_drafts') }); } }, [open, tab]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [history]);

  const submit = (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    const response = answerQuestion(text, language);
    setHistory((items) => [...items, { role: 'user', text }, { ...response, role: 'assistant' }]);
    setQuestion('');
  };

  return <aside className="kp-assistant" aria-label={labels.title}>
    {open && !minimized && <section className="kp-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="kp-assistant-title">
      <header className="kp-assistant-head"><span className="kp-assistant-avatar"><Bot size={22} /></span><span className="kp-assistant-title"><strong id="kp-assistant-title">{labels.title}</strong><small>{labels.subtitle}</small></span><button type="button" className="kp-assistant-icon-button" onClick={() => setMinimized(true)} aria-label={isHi ? 'छोटा करें' : 'Minimize'}><ChevronDown size={18}/></button><button type="button" className="kp-assistant-icon-button" onClick={() => setOpen(false)} aria-label={isHi ? 'बंद करें' : 'Close'}><X size={18}/></button></header>
      <div className="kp-assistant-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === 'guide'} className={tab === 'guide' ? 'active' : ''} onClick={() => setTab('guide')}><MessageCircle size={15}/>{labels.guide}</button><button type="button" role="tab" aria-selected={tab === 'activity'} className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}><Leaf size={15}/>{labels.updates}</button></div>
      {tab === 'guide' ? <><div className="kp-assistant-messages" aria-live="polite">{history.map((item, index) => <div key={`${index}-${item.role}`} className={`kp-assistant-message ${item.role}`}><p>{item.text}</p>{item.page && <button type="button" className="kp-assistant-link" onClick={() => { onNavigate(item.page); setOpen(false); }}>{item.label} →</button>}{item.externalUrl && <a className="kp-assistant-link" href={item.externalUrl} target="_blank" rel="noreferrer">{item.label} ↗</a>}</div>)}<div ref={bottomRef}/></div><form className="kp-assistant-form" onSubmit={submit}><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder={labels.ask} aria-label={labels.ask}/><button type="submit" aria-label={labels.send} disabled={!question.trim()}><Send size={17}/></button></form><p className="kp-assistant-note">{labels.intro}</p></> : <div className="kp-assistant-activity">
        <h3>{labels.crop}</h3>{activity.reports.length ? activity.reports.slice(0, 4).map((item, index) => <article key={item.id || index}><strong>{item.crop || item.cropName || (isHi ? 'फसल निरीक्षण' : 'Crop observation')}</strong><p>{item.symptoms || item.notes || item.description || (isHi ? 'निरीक्षण सहेजा गया' : 'Observation saved')}</p></article>) : <p className="kp-assistant-empty">{labels.none}</p>}
        <h3>{labels.drafts}</h3>{activity.drafts.length ? activity.drafts.slice(0, 4).map((item, index) => <article key={item.id || index}><strong>{item.cropName || item.targetMarket || item.crop || item.market || (isHi ? 'खरीदार ड्राफ्ट' : 'Buyer draft')}</strong><p>{item.notes || item.message || item.buyer || (isHi ? 'ड्राफ्ट इस डिवाइस पर सहेजा गया' : 'Draft saved on this device')}</p></article>) : <p className="kp-assistant-empty">{labels.none}</p>}
        <p className="kp-assistant-note">{isHi ? 'यह गतिविधि केवल इसी ब्राउज़र में सहेजी गई है।' : 'This activity is stored in this browser on this device.'}</p>
      </div>}
    </section>}
    {open && minimized && <div className="kp-assistant-mini"><span>{labels.title}</span><button type="button" onClick={() => setMinimized(false)}>{isHi ? 'फिर खोलें' : 'Restore'}</button></div>}
    <button type="button" className="kp-assistant-fab" onClick={() => { setOpen((value) => !value); setMinimized(false); }} aria-expanded={open && !minimized} aria-label={open ? (isHi ? 'सहायक बंद करें' : 'Close assistant') : (isHi ? 'सहायक खोलें' : 'Open assistant')}><span className="kp-assistant-bot"><span className="kp-assistant-antenna"/><span className="kp-assistant-eyes"><i/><i/></span></span><span className="kp-assistant-fab-label">{open ? <X size={18}/> : <MessageCircle size={18}/>}</span></button>
  </aside>;
}



