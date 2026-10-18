import React,{useEffect,useMemo,useState} from 'react';
import {Check,LockKeyhole,LogOut,RefreshCw,UploadCloud,X} from 'lucide-react';
import SchemePublisher from './SchemePublisher';
import {useAuth} from '../../context/AuthContext';

const input={width:'100%',boxSizing:'border-box',border:'1px solid #cbd5e1',borderRadius:8,padding:'9px 11px',font:'inherit',fontSize:13};
const button={border:0,borderRadius:8,padding:'8px 11px',fontWeight:700,cursor:'pointer'};

export default function SchemeAdminPortal({language='en',schemes=[],onPublished}){
  const isHi=language==='hi';
  const {user,logout}=useAuth();const authenticated=user?.role==='admin';
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [requests,setRequests]=useState([]);
  const [schemeId,setSchemeId]=useState('');const [titleEn,setTitleEn]=useState('');const [titleHi,setTitleHi]=useState('');const [file,setFile]=useState(null);const [videoStatus,setVideoStatus]=useState('');
  const options=useMemo(()=>schemes.map(s=>({id:s.id,name:isHi?(s.nameHi||s.nameEn):s.nameEn})),[schemes,isHi]);
  const loadRequests=async()=>{const response=await fetch('/api/admin/registration-requests',{credentials:'include'});const data=await response.json();if(!response.ok)throw new Error(data.error||'Admin access failed');setRequests(data.requests||[]);};
  useEffect(()=>{if(authenticated)loadRequests().catch((e)=>setError(e.message));},[authenticated]);
  const refresh=async()=>{try{await loadRequests();setError('');}catch(e){setError(e.message);}};
  const updateRequest=async(id,status)=>{setBusy(true);setError('');try{const response=await fetch(`/api/admin/registration-requests/${encodeURIComponent(id)}`,{method:'PATCH',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({status})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not update request');await refresh();}catch(e){setError(e.message);}finally{setBusy(false);}};
  const uploadVideo=async(event)=>{event.preventDefault();setVideoStatus('');if(!file)return; if(file.size>50*1024*1024){setVideoStatus(isHi?'वीडियो 50 MB से छोटा होना चाहिए।':'Video must be smaller than 50 MB.');return;}try{const response=await fetch(`/api/admin/schemes/${encodeURIComponent(schemeId)}/videos`,{method:'POST',headers:{'content-type':file.type,'x-video-title-en':titleEn,'x-video-title-hi':titleHi},credentials:'include',body:file});const data=await response.json();if(!response.ok)throw new Error(data.error||'Upload failed');setVideoStatus(isHi?'वीडियो अपलोड हो गया।':'Video uploaded successfully.');setFile(null);event.target.reset();}catch(e){setVideoStatus(e.message);}};
  if(!authenticated)return null;
  const statusLabel={pending:isHi?'लंबित':'Pending',approved:isHi?'स्वीकृत':'Approved',rejected:isHi?'अस्वीकृत':'Rejected',registered:isHi?'सहायता पूरी':'Help completed'};
  return <section style={{margin:'0 0 18px',border:'1px solid #cbd5e1',borderRadius:12,background:'#fff',overflow:'hidden'}}>
    <header style={{padding:'13px 15px',background:'#0f3d2e',color:'#fff',display:'flex',alignItems:'center',gap:8}}><LockKeyhole size={17}/><strong>{isHi?'एडमिन पोर्टल':'Admin portal'}</strong><span style={{fontSize:12,opacity:.8}}>{requests.filter(r=>r.status==='pending').length} {isHi?'नए अनुरोध':'pending requests'}</span><button onClick={logout} style={{...button,marginLeft:'auto',background:'rgba(255,255,255,.16)',color:'#fff',display:'flex',gap:6,alignItems:'center'}}><LogOut size={14}/>{isHi?'लॉग आउट':'Log out'}</button></header>
    <div style={{padding:14,display:'grid',gap:18}}>
      <div><h3 style={{margin:'0 0 10px',fontSize:15,color:'#14532d'}}>{isHi?'नई योजना प्रकाशित करें':'Publish a government scheme'}</h3><SchemePublisher language={language} onPublished={onPublished}/></div>
      <div><h3 style={{margin:'0 0 10px',fontSize:15,color:'#14532d'}}>{isHi?'योजना का वीडियो अपलोड करें':'Upload a scheme explainer video'}</h3><form onSubmit={uploadVideo} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:9,alignItems:'end'}}>
        <label style={{fontSize:11,fontWeight:700}}>{isHi?'योजना':'Scheme'}<select required value={schemeId} onChange={e=>setSchemeId(e.target.value)} style={{...input,marginTop:4}}><option value="">{isHi?'योजना चुनें':'Choose a scheme'}</option>{options.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label style={{fontSize:11,fontWeight:700}}>{isHi?'वीडियो शीर्षक (English)':'Video title (English)'}<input required value={titleEn} onChange={e=>setTitleEn(e.target.value)} style={{...input,marginTop:4}}/></label>
        <label style={{fontSize:11,fontWeight:700}}>{isHi?'वीडियो शीर्षक (हिंदी)':'Video title (Hindi)'}<input value={titleHi} onChange={e=>setTitleHi(e.target.value)} style={{...input,marginTop:4}}/></label>
        <label style={{fontSize:11,fontWeight:700}}>{isHi?'MP4/WebM, अधिकतम 50 MB':'MP4/WebM video, max 50 MB'}<input required type="file" accept="video/mp4,video/webm" onChange={e=>setFile(e.target.files?.[0]||null)} style={{...input,marginTop:4}}/></label>
        <button disabled={busy||!file} type="submit" style={{...button,background:'#15803d',color:'#fff',display:'inline-flex',alignItems:'center',gap:7,justifySelf:'start'}}><UploadCloud size={15}/>{isHi?'वीडियो अपलोड':'Upload video'}</button>
        {videoStatus&&<span role="status" style={{fontSize:12,color:'#475569'}}>{videoStatus}</span>}
      </form><p style={{fontSize:11,color:'#64748b',marginBottom:0}}>{isHi?'वीडियो इस प्रोटोटाइप के स्थानीय सर्वर पर सेव होगा।':'Videos are stored on this prototype’s local server.'}</p></div>
      <div><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><h3 style={{margin:0,fontSize:15,color:'#14532d'}}>{isHi?'किसानों के पंजीकरण सहायता अनुरोध':'Farmer registration-help requests'}</h3><button onClick={refresh} style={{...button,marginLeft:'auto',background:'#f1f5f9',display:'flex',gap:5,alignItems:'center'}}><RefreshCw size={14}/>{isHi?'रीफ्रेश':'Refresh'}</button></div>
      {!requests.length?<p style={{fontSize:13,color:'#64748b'}}>{isHi?'अभी कोई अनुरोध नहीं है।':'No farmer requests yet.'}</p>:<div style={{display:'grid',gap:9}}>{requests.map(r=><article key={r.id} style={{padding:12,border:'1px solid #e2e8f0',borderRadius:10,background:'#f8fafc'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:8,flexWrap:'wrap'}}><strong style={{color:'#0f172a'}}>{r.farmerName}</strong><span style={{fontSize:11,background:r.status==='pending'?'#fef3c7':'#dcfce7',padding:'3px 7px',borderRadius:999}}>{statusLabel[r.status]||r.status}</span><span style={{marginLeft:'auto',fontSize:11,color:'#64748b'}}>{r.id}</span></div>
        <p style={{margin:'6px 0',fontSize:13,color:'#334155'}}>{r.schemeNameEn} · {r.phone} · {[r.district,r.state].filter(Boolean).join(', ')}{r.crop?` · ${r.crop}`:''}</p><p style={{margin:'4px 0',fontSize:11,color:'#a16207'}}>{isHi?'डेमो भुगतान (असली पैसे नहीं कटे)':'Demo payment (no real money charged)'} · ₹{r.paymentAmount||199} · {(r.paymentMethod||'').toUpperCase()||'—'} · {r.paymentStatus||'legacy'} · {r.paymentRef||'legacy request'}</p>{r.notes&&<p style={{margin:'4px 0',fontSize:12,color:'#64748b'}}>{r.notes}</p>}
        {r.status==='pending'&&<div style={{display:'flex',gap:7,marginTop:9}}><button disabled={busy} onClick={()=>updateRequest(r.id,'approved')} style={{...button,background:'#15803d',color:'#fff'}}><Check size={13} style={{verticalAlign:'middle'}}/> {isHi?'स्वीकारें':'Approve'}</button><button disabled={busy} onClick={()=>updateRequest(r.id,'rejected')} style={{...button,background:'#fee2e2',color:'#991b1b'}}><X size={13} style={{verticalAlign:'middle'}}/> {isHi?'अस्वीकारें':'Reject'}</button></div>}
        {r.status==='approved'&&<button disabled={busy} onClick={()=>updateRequest(r.id,'registered')} style={{...button,marginTop:8,background:'#dbeafe',color:'#1e3a8a'}}>{isHi?'किसान की सहायता पूरी करें':'Mark registration assistance complete'}</button>}
      </article>)}</div>}</div>
      {error&&<p role="alert" style={{color:'#b91c1c',fontSize:12,margin:0}}>{error}</p>}
      <small style={{color:'#64748b',lineHeight:1.5}}>{isHi?'अनुमोदन का अर्थ है कि टीम अनुरोध पर सहायता शुरू करेगी। सरकारी पोर्टल पर वास्तविक आवेदन एडमिन को अलग से करना होगा।':'Approval starts the team’s follow-up. An admin must still submit the actual application through the official government portal.'}</small>
    </div>
  </section>;
}
