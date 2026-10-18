import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Check, MapPin } from 'lucide-react';

const PROFILE_KEY = 'kisanpulse_scheme_profile';
const readProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
};

export default function SchemeAlerts({ language = 'en' }) {
  const isHi = language === 'hi';
  const [profile, setProfile] = useState(readProfile);
  const [state, setState] = useState(profile?.state || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [crops, setCrops] = useState((profile?.crops || []).join(', '));
  const [interests, setInterests] = useState((profile?.interests || []).join(', '));
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(Boolean(profile?.alertsEnabled));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!profile?.id) return undefined;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/notifications?profileId=${encodeURIComponent(profile.id)}`);
        if (!response.ok) return;
        const data = await response.json();
        if (active) setNotifications(data.notifications || []);
      } catch { /* API may be offline while the farmer browses cached schemes. */ }
    };
    load();
    const timer = window.setInterval(load, 20000);
    return () => { active = false; window.clearInterval(timer); };
  }, [profile?.id]);

  const save = async (event) => {
    event.preventDefault();
    if (!state.trim()) { setNotice(isHi ? 'राज्य का नाम भरें।' : 'Enter your state to set up alerts.'); return; }
    setSaving(true); setNotice('');
    const payload = {
      id: profile?.id,
      state: state.trim(),
      district: district.trim(),
      crops: crops.split(',').map((v) => v.trim()).filter(Boolean),
      interests: interests.split(',').map((v) => v.trim()).filter(Boolean),
      language,
      alertsEnabled: enabled,
    };
    try {
      const response = await fetch('/api/profiles', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save preferences');
      const saved = { ...payload, id: data.id };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
      setProfile(saved);
      setNotice(isHi ? 'योजना अलर्ट प्राथमिकताएँ सहेज दी गईं।' : 'Scheme alert preferences saved.');
    } catch {
      setNotice(isHi ? 'अलर्ट सेव नहीं हुए। बैकएंड चल रहा है या नहीं जाँचें।' : 'Could not save alerts. Make sure the app backend is running.');
    } finally { setSaving(false); }
  };

  const markRead = async (item) => {
    try {
      await fetch(`/api/notifications/${item.id}/read`, { method: 'PATCH' });
      setNotifications((items) => items.map((value) => value.id === item.id ? { ...value, read: true } : value));
    } catch { /* Keep the item visible if the API is unavailable. */ }
  };

  return <section style={{ margin: '0 0 16px', padding: '14px 16px', border: '1px solid #bbf7d0', borderRadius: 12, background: '#f0fdf4' }}>
    <details>
      <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 9, color: '#166534', fontWeight: 800 }}>
        {notifications.some((n) => !n.read) ? <BellRing size={18} /> : <Bell size={18} />}
        {isHi ? 'नई योजना के अलर्ट' : 'New scheme alerts'}
        {notifications.filter((n) => !n.read).length > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{notifications.filter((n) => !n.read).length}</span>}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', fontWeight: 500 }}>{isHi ? 'राज्य और फसल के अनुसार अलर्ट पाने के लिए खोलें' : 'Set your state and crops to receive matching updates'}</span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(240px, 1fr)', gap: 16, paddingTop: 14 }}>
        <form onSubmit={save} style={{ display: 'grid', gap: 9 }}>
          <label style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{isHi ? 'राज्य (ज़रूरी)' : 'State (required)'}
            <input value={state} onChange={(e) => setState(e.target.value)} placeholder={isHi ? 'जैसे: उत्तर प्रदेश' : 'e.g. Uttar Pradesh'} style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{isHi ? 'जिला' : 'District'}
            <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder={isHi ? 'जिले का नाम' : 'District name'} style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{isHi ? 'आपकी फसलें (कॉमा लगाएँ)' : 'Your crops (comma separated)'}
            <input value={crops} onChange={(e) => setCrops(e.target.value)} placeholder="Wheat, rice, pulses" style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{isHi ? 'रुचियाँ (कॉमा लगाएँ)' : 'Interests (comma separated)'}
            <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Insurance, irrigation, credit" style={inputStyle} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: 13 }}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            {isHi ? 'मिलती-जुलती योजनाओं के इन-ऐप अलर्ट चालू करें' : 'Turn on matching in-app alerts'}
          </label>
          <button disabled={saving} type="submit" style={{ justifySelf: 'start', border: 0, borderRadius: 8, padding: '8px 13px', background: '#15803d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {saving ? (isHi ? 'सेव हो रहा है…' : 'Saving…') : (isHi ? 'प्राथमिकताएँ सेव करें' : 'Save alert preferences')}
          </button>
          {notice && <small role="status" style={{ color: '#166534' }}>{notice}</small>}
        </form>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 8 }}>{isHi ? 'आपके अलर्ट' : 'Your notifications'}</div>
          {!notifications.length ? <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{isHi ? 'नई मिलती-जुलती योजना आने पर अलर्ट यहाँ दिखेगा।' : 'Matching new schemes will appear here when added to the catalogue.'}</p> : <div style={{ display: 'grid', gap: 7, maxHeight: 210, overflowY: 'auto' }}>{notifications.map((item) => <article key={item.id} style={{ padding: 9, borderRadius: 8, background: item.read ? '#fff' : '#dcfce7', border: '1px solid #bbf7d0' }}><strong style={{ fontSize: 12, color: '#14532d' }}>{isHi ? item.nameHi : item.nameEn}</strong><p style={{ margin: '4px 0', fontSize: 12, color: '#475569' }}>{isHi ? item.messageHi : item.messageEn}</p>{!item.read && <button type="button" onClick={() => markRead(item)} style={{ border: 0, background: 'transparent', color: '#15803d', padding: 0, fontSize: 11, cursor: 'pointer' }}><Check size={12} style={{ verticalAlign: 'middle' }} /> {isHi ? 'पढ़ लिया' : 'Mark read'}</button>}</article>)}</div>}
          <p style={{ margin: '10px 0 0', fontSize: 11, lineHeight: 1.5, color: '#64748b' }}><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {isHi ? 'यह प्रोटोटाइप इन-ऐप अलर्ट देता है। SMS/WhatsApp सूचनाएँ अभी जुड़ी नहीं हैं।' : 'Prototype alerts appear in this app. SMS/WhatsApp delivery is not connected.'}</p>
        </div>
      </div>
    </details>
  </section>;
}

const inputStyle = { display: 'block', width: '100%', marginTop: 4, boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 7, padding: '8px 10px', background: '#fff', color: '#0f172a', fontSize: 13 };
