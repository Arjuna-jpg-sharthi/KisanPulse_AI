/**
 * KisanPulse AI — Scheme Registration Service
 *
 * Collects farmer's scheme-specific information so our team can register
 * on their behalf. Stores request locally (localStorage) and shows
 * UPI payment QR with a transparent service fee disclosure.
 *
 * No real payment gateway integrated for hackathon. In production,
 * replace the UPI link with Razorpay / PhonePe checkout.
 */

import React, { useState } from 'react';
import {
  ClipboardCheck, IndianRupee, Lock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Phone, Info
} from 'lucide-react';

const UPI_ID = 'kisanpulse@upi'; // Replace with real UPI ID before launch

function getSubmissions() {
  try { return JSON.parse(localStorage.getItem('kp_reg_requests') || '[]'); }
  catch { return []; }
}
function saveSubmission(entry) {
  try {
    const all = getSubmissions();
    all.push(entry);
    localStorage.setItem('kp_reg_requests', JSON.stringify(all));
  } catch (e) { console.warn('Could not save registration request', e); }
}

/**
 * SchemeRegistration
 * @param {object} props
 * @param {object}  props.scheme   - Scheme object from schemesData.js
 * @param {string}  props.language - 'en' | 'hi'
 * @param {Function} props.onClose - Called when modal should close
 */
export default function SchemeRegistration({ scheme, language = 'en', onClose }) {
  const isHi = language === 'hi';
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [showDetails, setShowDetails] = useState(false);

  if (!scheme) return null;

  const fields = scheme.registrationFields || [];
  const fee = scheme.serviceFee || 199;

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    fields.forEach(f => {
      const val = (formData[f.id] || '').trim();
      if (f.required && !val) {
        newErrors[f.id] = isHi ? 'यह फ़ील्ड अनिवार्य है।' : 'This field is required.';
      } else if (f.pattern && val) {
        const re = new RegExp(`^${f.pattern}$`);
        if (!re.test(val)) {
          newErrors[f.id] = isHi ? 'अमान्य प्रारूप।' : 'Invalid format.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep('payment');
  };

  const handleConfirmPayment = () => {
    const entry = {
      id: `REG-${Date.now()}`,
      schemeId: scheme.id,
      schemeName: scheme.nameEn,
      formData: { ...formData },
      fee,
      submittedAt: new Date().toISOString(),
      status: 'pending-payment-verification',
    };
    saveSubmission(entry);
    setStep('success');
  };

  // ── Styles (inline, no extra css file needed) ─────────────────────────
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 5 };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#334155' };
  const inputStyle = (hasErr) => ({
    padding: '10px 12px', fontSize: 14, borderRadius: 8,
    border: `1.5px solid ${hasErr ? '#dc2626' : '#cbd5e1'}`,
    background: hasErr ? '#fff5f5' : '#fff',
    outline: 'none', fontFamily: 'inherit',
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: FORM
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div>
        {/* Service Notice */}
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#854d0e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowDetails(p => !p)}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IndianRupee size={15} />
              {isHi ? `सेवा शुल्क: ₹${fee} (पारदर्शी प्रकटीकरण)` : `Service Charge: ₹${fee} (Transparent Disclosure)`}
            </strong>
            {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {showDetails && (
            <ul style={{ margin: '10px 0 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
              <li>{isHi ? 'हम आपके बदले सरकारी पोर्टल पर आवेदन भरेंगे।' : 'We will fill and submit the application on the official government portal on your behalf.'}</li>
              <li>{isHi ? 'शुल्क केवल हमारी मानव सेवा के लिए है — सरकारी लाभ में कोई कटौती नहीं।' : 'Fee is for our facilitation service only — zero deduction from your government benefit.'}</li>
              <li>{isHi ? '24–72 घंटे में आवेदन जमा करने का स्क्रीनशॉट प्राप्त होगा।' : 'You will receive a submission screenshot within 24–72 hours.'}</li>
              <li>{isHi ? 'आप स्वयं भी निःशुल्क आवेदन कर सकते हैं।' : 'You can also apply yourself for free at the official portal.'}</li>
            </ul>
          )}
        </div>

        {/* Security Notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12.5, color: '#15803d' }}>
          <Lock size={14} style={{ flexShrink: 0 }} />
          {isHi
            ? 'आपकी जानकारी केवल इस डिवाइस पर सेव होती है और केवल आवेदन जमा करने के लिए उपयोग की जाएगी।'
            : 'Your information is saved only on this device and used exclusively to submit your application.'}
        </div>

        {/* Scheme Name Banner */}
        <div style={{ background: '#f8fafc', borderLeft: '4px solid #15803d', padding: '10px 14px', marginBottom: 20, borderRadius: '0 8px 8px 0', fontSize: 14, color: '#0f172a' }}>
          <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            {isHi ? 'आवेदन योजना' : 'Applying for'}
          </span>
          <strong>{isHi ? scheme.nameHi : scheme.nameEn}</strong>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {fields.map(field => (
            <div key={field.id} style={fieldStyle}>
              <label htmlFor={`reg-${field.id}`} style={labelStyle}>
                {isHi ? field.labelHi : field.labelEn}
                {field.required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
              </label>
              <input
                id={`reg-${field.id}`}
                type={field.type || 'text'}
                value={formData[field.id] || ''}
                onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                style={inputStyle(!!errors[field.id])}
                placeholder={field.type === 'date' ? '' : (field.hint || '')}
              />
              {errors[field.id] && (
                <span style={{ fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} />
                  {errors[field.id]}
                </span>
              )}
              {field.hint && !errors[field.id] && (
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{field.hint}</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, color: '#475569' }}
          >
            {isHi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            onClick={handleNext}
            style={{ padding: '10px 22px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ClipboardCheck size={16} />
            {isHi ? `आगे बढ़ें → भुगतान (₹${fee})` : `Next → Payment (₹${fee})`}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: PAYMENT
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'payment') {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=KisanPulse&am=${fee}&cu=INR&tn=Scheme+Registration+${scheme.id}`;
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
          <IndianRupee size={32} color="#15803d" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>₹{fee}</div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            {isHi ? `KisanPulse सेवा शुल्क — ${scheme.nameHi}` : `KisanPulse Facilitation Fee — ${scheme.nameEn}`}
          </div>
        </div>

        {/* UPI QR Placeholder */}
        <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>
            {isHi ? 'UPI से भुगतान करें:' : 'Pay via UPI:'}
          </div>
          {/* Real QR image would go here — using placeholder for demo */}
          <div style={{ width: 160, height: 160, background: '#e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            QR CODE<br />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>(Production: Razorpay / PhonePe)</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#0f172a', fontWeight: 700, background: '#e2e8f0', padding: '6px 12px', borderRadius: 6, display: 'inline-block' }}>
            {UPI_ID}
          </div>
          <a
            href={upiLink}
            style={{ display: 'block', marginTop: 12, padding: '10px 20px', background: '#15803d', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
          >
            📱 {isHi ? 'UPI ऐप से खोलें' : 'Open in UPI App'}
          </a>
        </div>

        {/* Phone alternative */}
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Phone size={14} />
          {isHi ? 'भुगतान में सहायता:' : 'Payment help:'} <strong style={{ color: '#0f172a' }}>+91-XXXXX-XXXXX</strong>
        </div>

        <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
          {isHi
            ? 'भुगतान के बाद "पुष्टि करें" दबाएं। हम 24–72 घंटे में आपका आवेदन जमा कर देंगे।'
            : 'After paying, click "Confirm Payment". We will submit your application within 24–72 hours.'}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => setStep('form')}
            style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            {isHi ? '← वापस' : '← Back'}
          </button>
          <button
            onClick={handleConfirmPayment}
            style={{ padding: '10px 22px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <CheckCircle2 size={16} />
            {isHi ? 'मैंने भुगतान कर दिया — पुष्टि करें' : 'I\'ve Paid — Confirm'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: SUCCESS
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#166534)', marginBottom: 20 }}>
        <CheckCircle2 size={36} color="#fff" />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
        {isHi ? 'आवेदन अनुरोध प्राप्त हुआ! 🎉' : 'Registration Request Received! 🎉'}
      </h3>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
        {isHi
          ? `${scheme.nameHi} के लिए आपका आवेदन अनुरोध दर्ज हो गया है। हमारी टीम 24–72 घंटे में आवेदन जमा कर आपको पुष्टि भेजेगी।`
          : `Your ${scheme.nameEn} registration request is logged. Our team will submit the application within 24–72 hours and send you a confirmation screenshot.`}
      </p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#475569', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 700, color: '#0f172a' }}>
          <Info size={15} />
          {isHi ? 'अगले कदम:' : 'Next Steps:'}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>{isHi ? 'अपने दिए मोबाइल नंबर पर SMS/WhatsApp से संपर्क होगा।' : 'We\'ll contact you on the mobile number you provided via SMS/WhatsApp.'}</li>
          <li>{isHi ? 'यदि कोई दस्तावेज अतिरिक्त चाहिए तो सूचित किया जाएगा।' : 'If any additional documents are needed, we\'ll let you know.'}</li>
          <li>{isHi ? 'आवेदन जमा होते ही पोर्टल का स्क्रीनशॉट साझा किया जाएगा।' : 'A portal submission screenshot will be shared once filed.'}</li>
        </ul>
      </div>
      <button
        onClick={onClose}
        style={{ padding: '11px 28px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
      >
        {isHi ? 'बंद करें ✓' : 'Done ✓'}
      </button>
    </div>
  );
}
