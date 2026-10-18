import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, LockKeyhole, CreditCard, ArrowLeft, ShieldCheck, FlaskConical } from 'lucide-react';

const inputStyle={width:'100%',boxSizing:'border-box',padding:'10px 12px',border:'1px solid #cbd5e1',borderRadius:8,font:'inherit',fontSize:14};
const buttonStyle={border:0,borderRadius:8,padding:'10px 15px',fontWeight:700,cursor:'pointer'};
const DEMO_FEE=199;

export default function SchemeRegistration({scheme,language='en',onClose}){
  const isHi=language==='hi';
  const [form,setForm]=useState({name:'',phone:'',state:'',district:'',crop:'',notes:'',consent:false});
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [request,setRequest]=useState(null);const [step,setStep]=useState('details');const [method,setMethod]=useState('upi');
  if(!scheme)return null;
  const set=(field,value)=>setForm(current=>({...current,[field]:value}));
  const submitAfterDemoPayment=async()=>{
    setBusy(true);setError('');
    try{
      const response=await fetch('/api/registration-requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({schemeId:scheme.id,schemeNameEn:scheme.nameEn,schemeNameHi:scheme.nameHi,farmerName:form.name,phone:form.phone,state:form.state,district:form.district,crop:form.crop,notes:form.notes,language,paymentMode:'demo',paymentStatus:'demo_paid',paymentAmount:DEMO_FEE,paymentMethod:method})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not send request.');setRequest(data);
    }catch(err){setError(isHi?'अनुरोध नहीं भेजा जा सका। इंटरनेट और सर्वर जाँचकर फिर प्रयास करें।':err.message||'Could not send request. Check your connection and try again.');}
    finally{setBusy(false);}
  };
  if(request)return <div style={{textAlign:'center',padding:'22px 12px'}}><CheckCircle2 size={44} color="#15803d"/><h3 style={{color:'#14532d'}}>{isHi?'आपका अनुरोध भेज दिया गया':'Your request has been sent'}</h3><p style={{color:'#475569',lineHeight:1.6}}>{isHi?`डेमो भुगतान संदर्भ ${request.demoPaymentId} (कोई वास्तविक पैसा नहीं लिया गया)। अनुरोध नंबर ${request.id}। हमारी टीम अपडेट के लिए आपसे संपर्क करेगी। यह सरकारी आवेदन नहीं है।`:`Demo payment reference ${request.demoPaymentId} (no real money was charged). Request ${request.id}. Our team will contact you with updates. This is not an official government application.`}</p><button onClick={onClose} style={{...buttonStyle,background:'#15803d',color:'#fff'}}>{isHi?'बंद करें':'Done'}</button></div>;
  const fields=[['name',isHi?'पूरा नाम':'Full name','text',true],['phone',isHi?'मोबाइल नंबर':'Phone number','tel',true],['state',isHi?'राज्य':'State','text',true],['district',isHi?'जिला':'District','text',false],['crop',isHi?'फसल (यदि लागू हो)':'Crop (if relevant)','text',false]];
  const info=isHi?'यह केवल डेमो चेकआउट है। कोई वास्तविक भुगतान नहीं होगा। UPI PIN, OTP, कार्ड PIN या बैंक पासवर्ड कभी न लिखें। वास्तविक भुगतान सुविधा अभी जुड़ी नहीं है।':'DEMO CHECKOUT ONLY. No real payment will be made. Never enter a UPI PIN, OTP, card PIN, or bank password here. Live payments are not connected.';
  return <div style={{display:'grid',gap:13}}>
    <div style={{padding:13,border:'1px solid #fcd34d',borderRadius:10,background:'#fffbeb',color:'#854d0e',fontSize:13,lineHeight:1.6}}><strong style={{display:'inline-flex',alignItems:'center',gap:6}}><FlaskConical size={15}/>{isHi?'डेमो मोड — नकली भुगतान':'Demo mode — simulated payment'}</strong><br/>{info}</div>
    <div style={{fontWeight:700,color:'#334155'}}>{isHi?scheme.nameHi:scheme.nameEn}</div>
    {step==='details'?<form onSubmit={e=>{e.preventDefault();setError('');setStep('payment')}} style={{display:'grid',gap:13}}>
      <div style={{padding:13,border:'1px solid #bbf7d0',borderRadius:10,background:'#f0fdf4',color:'#14532d',fontSize:13,lineHeight:1.6}}><strong>{isHi?'योजना सहायता अनुरोध':'Request help with this scheme'}</strong><br/>{isHi?'डेमो भुगतान के बाद एडमिन आपकी जानकारी देखकर फोन पर संपर्क करेगा। यह सरकारी पोर्टल पर आवेदन जमा नहीं करता।':'After the demo payment step, an admin will review your request and contact you. This does not submit a government application.'}</div>
      {fields.map(([key,label,type,required])=><label key={key} style={{display:'grid',gap:5,fontSize:13,fontWeight:650,color:'#334155'}}>{label}{required?' *':''}<input required={required} type={type} value={form[key]} onChange={e=>set(key,e.target.value)} style={inputStyle} maxLength={key==='phone'?18:120}/></label>)}
      <label style={{display:'grid',gap:5,fontSize:13,fontWeight:650,color:'#334155'}}>{isHi?'आपकी मदद के बारे में बताएं (वैकल्पिक)':'What help do you need? (optional)'}<textarea rows={3} maxLength={1000} value={form.notes} onChange={e=>set('notes',e.target.value)} style={{...inputStyle,resize:'vertical'}}/></label>
      <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12.5,color:'#475569',lineHeight:1.5}}><input required type="checkbox" checked={form.consent} onChange={e=>set('consent',e.target.checked)} style={{marginTop:3}}/><span><LockKeyhole size={13} style={{verticalAlign:'middle'}}/> {isHi?'मैं सहमत हूँ कि KisanPulse टीम मेरे अनुरोध की समीक्षा के लिए मेरे नाम और फोन नंबर का उपयोग कर सकती है। आधार, बैंक विवरण या पासवर्ड यहाँ न भेजें।':'I agree that the KisanPulse team may use my name and phone number to review this request. Do not enter Aadhaar, bank details, or passwords here.'}</span></label>
      <div style={{display:'flex',justifyContent:'flex-end',gap:9}}><button type="button" onClick={onClose} style={{...buttonStyle,border:'1px solid #cbd5e1',background:'#fff'}}>{isHi?'रद्द करें':'Cancel'}</button><button type="submit" style={{...buttonStyle,display:'inline-flex',alignItems:'center',gap:7,background:'#15803d',color:'#fff'}}><ClipboardCheck size={16}/>{isHi?'आगे बढ़ें · ₹199':'Continue to demo payment · ₹199'}</button></div>
    </form>:<section style={{display:'grid',gap:13}}>
      <button type="button" onClick={()=>setStep('details')} style={{justifySelf:'start',display:'inline-flex',alignItems:'center',gap:6,border:0,background:'transparent',color:'#166534',fontWeight:700,cursor:'pointer'}}><ArrowLeft size={16}/>{isHi?'जानकारी पर वापस':'Back to details'}</button>
      <div style={{padding:16,border:'1px solid #cbd5e1',borderRadius:12,display:'grid',gap:12,background:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><strong style={{display:'flex',alignItems:'center',gap:7,color:'#14532d'}}><CreditCard size={18}/>{isHi?'सहायता शुल्क':'Assistance fee'}</strong><strong style={{fontSize:22}}>₹{DEMO_FEE}</strong></div>
        <label style={{display:'grid',gap:5,fontSize:13,fontWeight:650,color:'#334155'}}>{isHi?'डेमो भुगतान तरीका चुनें':'Choose a simulated payment method'}<select value={method} onChange={e=>setMethod(e.target.value)} style={inputStyle}><option value="upi">UPI app (simulated)</option><option value="card">Card checkout (simulated)</option></select></label>
        <div style={{fontSize:12,color:'#475569',display:'flex',gap:7,lineHeight:1.5}}><ShieldCheck size={16} color="#15803d" style={{flexShrink:0}}/>{isHi?'भुगतान प्रमाण केवल डेमो है। कोई भुगतान विवरण नहीं माँगा जाएगा या सेव नहीं होगा।':'This is a simulated payment confirmation. No payment credentials are requested or stored.'}</div>
        {error&&<div role="alert" style={{color:'#b91c1c',fontSize:13}}>{error}</div>}
        <button disabled={busy} type="button" onClick={submitAfterDemoPayment} style={{...buttonStyle,display:'inline-flex',justifyContent:'center',alignItems:'center',gap:8,background:busy?'#86a997':'#15803d',color:'#fff'}}>{busy?(isHi?'डेमो अनुरोध भेजा जा रहा है…':'Submitting demo request…'):(isHi?'डेमो भुगतान सफल करें · ₹199':'Simulate successful payment · ₹199')}</button>
        <small style={{textAlign:'center',color:'#a16207'}}>{isHi?'डेमो: यह बटन बैंक या UPI से संपर्क नहीं करता।':'DEMO: This button does not contact a bank or UPI app.'}</small>
      </div>
    </section>}
  </div>;
}
