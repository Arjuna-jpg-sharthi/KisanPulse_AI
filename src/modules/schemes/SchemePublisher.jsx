import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

const initial = { nameEn:'',nameHi:'',category:'Agriculture support',categoryHi:'कृषि सहायता',benefit:'',benefitHi:'',eligibility:'',eligibilityHi:'',launchDate:'',state:'Central (All India)',tags:'',portalUrl:'',sourceUrl:'' };
const field = { width:'100%',boxSizing:'border-box',border:'1px solid #cbd5e1',borderRadius:7,padding:'8px 10px',fontSize:13 };

export default function SchemePublisher({ language='en', adminKey='', onPublished }) {
  const isHi=language==='hi';
  const [values,setValues]=useState(initial);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const update=(name,value)=>setValues(current=>({...current,[name]:value}));
  const publish=async(event)=>{
    event.preventDefault();setBusy(true);setStatus('');
    const id=values.nameEn.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    try{
      const response=await fetch('/api/admin/schemes',{method:'POST',headers:{'content-type':'application/json','x-admin-key':adminKey},body:JSON.stringify({...values,id,tags:values.tags.split(',').map(v=>v.trim()).filter(Boolean)})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not publish scheme');
      setStatus(isHi?`योजना सेव हुई। ${data.notificationsCreated} मिलते-जुलते किसान प्रोफ़ाइल को अलर्ट बनाया गया।`:`Scheme saved. ${data.notificationsCreated} matching farmer profile(s) notified.`);
      setValues(initial);onPublished?.();
    }catch(error){setStatus(error.message);}
    finally{setBusy(false);}
  };
  return <details style={{margin:'0 0 18px',padding:'12px 14px',border:'1px dashed #94a3b8',borderRadius:10,background:'#f8fafc'}}>
    <summary style={{cursor:'pointer',fontWeight:700,color:'#475569',fontSize:13}}>{isHi?'प्रशासक: नई सरकारी योजना जोड़ें':'Admin: add a newly announced scheme'}</summary>
    <form onSubmit={publish} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9,paddingTop:12}}>
      {[
        ['nameEn',isHi?'योजना का नाम (English)':'Scheme name (English)'],['nameHi',isHi?'योजना का नाम (हिंदी)':'Scheme name (Hindi)'],
        ['category',isHi?'श्रेणी (English)':'Category (English)'],['categoryHi',isHi?'श्रेणी (हिंदी)':'Category (Hindi)'],
        ['benefit',isHi?'लाभ/विवरण (English)':'Benefit / explanation (English)'],['benefitHi',isHi?'लाभ/विवरण (हिंदी)':'Benefit / explanation (Hindi)'],
        ['eligibility',isHi?'पात्रता (English)':'Eligibility (English)'],['eligibilityHi',isHi?'पात्रता (हिंदी)':'Eligibility (Hindi)'],
        ['launchDate',isHi?'घोषणा/शुरुआत की तारीख':'Launch / announcement date'],['state',isHi?'लागू राज्य':'Applicable state'],
        ['tags',isHi?'फसल/रुचि टैग, कॉमा से अलग':'Crop / interest tags, comma separated'],['portalUrl',isHi?'आधिकारिक आवेदन पोर्टल URL':'Official application portal URL'],
        ['sourceUrl',isHi?'सरकारी घोषणा/स्रोत URL':'Official announcement / source URL']
      ].map(([name,label])=><label key={name} style={{fontSize:11,fontWeight:700,color:'#475569'}}>{label}{name.endsWith('benefit')||name.endsWith('eligibility')?<textarea required rows={3} value={values[name]} onChange={e=>update(name,e.target.value)} style={{...field,marginTop:4,resize:'vertical'}} />:<input required={!['launchDate','tags','state'].includes(name)} type={name==='launchDate'?'date':'text'} value={values[name]} onChange={e=>update(name,e.target.value)} style={{...field,marginTop:4}} />}</label>)}
      <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><button disabled={busy} type="submit" style={{display:'inline-flex',alignItems:'center',gap:7,border:0,borderRadius:8,padding:'9px 13px',background:'#334155',color:'#fff',fontWeight:700,cursor:'pointer'}}><UploadCloud size={15}/>{busy?(isHi?'सेव हो रहा है…':'Saving…'):(isHi?'योजना प्रकाशित करें और अलर्ट भेजें':'Publish scheme and notify farmers')}</button>{status&&<span role="status" style={{fontSize:12,color:'#475569'}}>{status}</span>}</div>
      <p style={{gridColumn:'1/-1',margin:0,fontSize:11,color:'#64748b'}}>{isHi?'यह फॉर्म तभी चलेगा जब बैकएंड चलाते समय ADMIN_API_KEY सेट हो। सरकारी घोषणा के लिए प्रमाणित लिंक दें।':'Requires ADMIN_API_KEY to be set when the backend starts. Add a source link to the official announcement.'}</p>
    </form>
  </details>;
}
