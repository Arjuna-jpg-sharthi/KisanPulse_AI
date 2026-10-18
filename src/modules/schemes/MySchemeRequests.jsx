import React,{useState} from 'react';
import {ClipboardList,Search,Clock3,ReceiptText} from 'lucide-react';

const input={width:'100%',boxSizing:'border-box',border:'1px solid #cbd5e1',borderRadius:8,padding:'10px 12px',font:'inherit',fontSize:14};
const statusText={
  en:{pending:'Pending review',approved:'Approved · team will follow up',rejected:'Not approved',registered:'Help completed'},
  hi:{pending:'समीक्षा लंबित',approved:'स्वीकृत · टीम संपर्क करेगी',rejected:'स्वीकृत नहीं',registered:'सहायता पूरी हुई'},
};

export default function MySchemeRequests({language='en'}){
  const isHi=language==='hi';
  const [requestId,setRequestId]=useState('');const [phone,setPhone]=useState('');const [record,setRecord]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const lookup=async(event)=>{event.preventDefault();setBusy(true);setError('');setRecord(null);try{const response=await fetch('/api/registration-requests/history',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId,phone})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not find this request.');setRecord(data.request);}catch(err){setError(isHi?'अनुरोध नहीं मिला। अनुरोध नंबर और वही मोबाइल नंबर जाँचें।':err.message||'Could not find this request.');}finally{setBusy(false);}};
  const when=(value)=>value?new Date(`${value.replace(' ','T')}Z`).toLocaleString(isHi?'hi-IN':'en-IN'):'—';
  const status=(value)=>(statusText[isHi?'hi':'en'][value]||value);
  return <section style={{marginBottom:16,padding:16,border:'1px solid #bfdbfe',borderRadius:14,background:'linear-gradient(135deg,#eff6ff,#fff)'}}>
    <h3 style={{margin:'0 0 5px',display:'flex',alignItems:'center',gap:8,color:'#1e3a8a',fontSize:16}}><ClipboardList size={19}/>{isHi?'मेरे योजना अनुरोध':'My Scheme Requests'}</h3>
    <p style={{margin:'0 0 12px',fontSize:12.5,lineHeight:1.55,color:'#475569'}}>{isHi?'भुगतान रसीद से अनुरोध नंबर और आवेदन में इस्तेमाल किया गया मोबाइल नंबर डालकर अपनी सहायता की स्थिति देखें।':'Check your assistance progress and demo payment receipt using the request ID from your confirmation and the same phone number used to apply.'}</p>
    <form onSubmit={lookup} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9,alignItems:'end'}}>
      <label style={{display:'grid',gap:4,fontSize:12,fontWeight:700,color:'#334155'}}>{isHi?'अनुरोध नंबर':'Request ID'}<input required value={requestId} onChange={e=>setRequestId(e.target.value.toUpperCase())} placeholder="KP-XXXXXXXX" maxLength={11} style={input}/></label>
      <label style={{display:'grid',gap:4,fontSize:12,fontWeight:700,color:'#334155'}}>{isHi?'मोबाइल नंबर':'Phone number'}<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={18} style={input}/></label>
      <button disabled={busy} type="submit" style={{border:0,borderRadius:8,padding:'11px 14px',background:busy?'#94a3b8':'#1d4ed8',color:'#fff',fontWeight:750,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,cursor:busy?'wait':'pointer'}}><Search size={15}/>{busy?(isHi?'जाँच रहे हैं…':'Checking…'):(isHi?'स्थिति देखें':'View progress')}</button>
    </form>
    {error&&<p role="alert" style={{margin:'9px 0 0',color:'#b91c1c',fontSize:12}}>{error}</p>}
    {record&&<article style={{marginTop:12,padding:13,border:'1px solid #bbf7d0',borderRadius:10,background:'#f0fdf4',color:'#334155',fontSize:12.5,lineHeight:1.7}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}><strong style={{color:'#14532d',fontSize:14}}>{isHi?(record.schemeNameHi||record.schemeNameEn):record.schemeNameEn}</strong><span style={{padding:'3px 8px',borderRadius:999,background:record.status==='pending'?'#fef3c7':'#dcfce7',fontWeight:700}}>{status(record.status)}</span></div>
      <div style={{marginTop:5}}><strong>{isHi?'अनुरोध नंबर':'Request ID'}:</strong> {record.id}</div>
      <div style={{display:'flex',alignItems:'center',gap:6}}><ReceiptText size={15}/><strong>{isHi?'डेमो भुगतान':'Demo payment'}:</strong> ₹{record.paymentAmount||199} · {(record.paymentMethod||'—').toUpperCase()} · {record.paymentRef||'—'}</div>
      <div style={{fontWeight:700,color:'#a16207'}}>{isHi?'यह केवल डेमो है—कोई वास्तविक भुगतान नहीं हुआ।':'Demo only — no real money was charged.'}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'4px 15px',color:'#64748b'}}><span><Clock3 size={13} style={{verticalAlign:'-2px'}}/> {isHi?'जमा':'Submitted'}: {when(record.createdAt)}</span><span>{isHi?'अंतिम अपडेट':'Last updated'}: {when(record.updatedAt)}</span></div>
    </article>}
    <small style={{display:'block',marginTop:9,color:'#64748b'}}>{isHi?'सुरक्षा के लिए अनुरोध नंबर और मोबाइल नंबर दोनों मिलना आवश्यक है।':'For privacy, both the request ID and its matching phone number are required.'}</small>
  </section>;
}
