/**
 * KisanPulse AI — Enhanced Scheme Module V2
 *
 * Completely replaces the original SchemeModule.jsx with:
 *  1. Live Feed badge (NEW) for recently launched government schemes
 *  2. Per-scheme AI Explainer tab (Gemini AI chat, full-page)
 *  3. Video Explanation section (YouTube embed per scheme)
 *  4. "Register Me" service (paid facilitation with multi-step form)
 *  5. Document checklist modal (preserved from v1)
 *  6. Enhanced search + category filter
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCheck2, Search, ExternalLink, CheckCircle2,
  PlayCircle, Bot, ClipboardList, X, Rss,
  RefreshCw, Star, Video, MessageSquare,
  Sparkles, BadgeCheck
} from 'lucide-react';

import { STATIC_SCHEMES, SCHEME_CATEGORIES } from './schemesData';
import SchemeAIChat from './SchemeAIChat';
import SchemeRegistration from './SchemeRegistration';
import SchemeMatchFinder from '../scheme-match-finder/SchemeMatchFinder';
import SchemeAlerts from './SchemeAlerts';
import SchemeAdminPortal from './SchemeAdminPortal';
import MySchemeRequests from './MySchemeRequests';
import { useAuth } from '../../context/AuthContext';

// ─── Tiny Modal wrapper ───────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#ffffff', borderRadius: 16, maxWidth: wide ? 860 : 520, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '22px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Video Embed Section ──────────────────────────────────────────────────────
function SchemeVideoSection({ scheme, language }) {
  const isHi = language === 'hi';
  const [playing, setPlaying] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  useEffect(() => {
    let active=true;
    fetch(`/api/schemes/${encodeURIComponent(scheme.id)}/videos`).then(r=>r.ok?r.json():{videos:[]}).then(data=>{if(active)setUploadedVideos(data.videos||[]);}).catch(()=>{});
    return ()=>{active=false;};
  },[scheme.id]);

  if (!scheme.videoUrl && !uploadedVideos.length) {
    return (
      <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 10, padding: '28px', textAlign: 'center', color: '#64748b' }}>
        <Video size={32} style={{ marginBottom: 10, color: '#94a3b8' }} />
        <div style={{ fontWeight: 600 }}>
          {isHi ? 'वीडियो व्याख्यान जल्द आएगा।' : 'Video explanation coming soon.'}
        </div>
        <p style={{ fontSize: 13, margin: '6px 0 0' }}>
          {isHi ? 'हमारी टीम इस योजना के लिए एक संक्षिप्त वीडियो तैयार कर रही है।' : 'Our team is preparing a short walkthrough for this scheme.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {uploadedVideos.map(video=><div key={video.id} style={{marginBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontWeight:700,color:'#0f172a'}}><PlayCircle size={17} color="#15803d"/>{isHi?(video.titleHi||video.titleEn):video.titleEn}</div>
        <video controls preload="metadata" src={video.url} style={{width:'100%',maxHeight:460,background:'#0f172a',borderRadius:12}}>{isHi?'आपका ब्राउज़र वीडियो नहीं चला सकता।':'Your browser cannot play this video.'}</video>
      </div>)}
      {scheme.videoUrl && <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <PlayCircle size={18} color="#15803d" />
        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
          {isHi
            ? (scheme.videoTitleHi || 'योजना वीडियो व्याख्यान')
            : (scheme.videoTitleEn || 'Scheme Video Walkthrough')}
        </span>
        <span style={{ fontSize: 11, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>
          ~40-60s
        </span>
      </div>

      {!playing ? (
        <div
          onClick={() => setPlaying(true)}
          style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#0f172a', aspectRatio: '16/9' }}
        >
          {/* YouTube thumbnail */}
          <img
            src={(() => {
              const m = (scheme.videoUrl || '').match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
              const ytId = m ? m[1] : (scheme.videoUrl.split('/embed/')[1] || '').split('?')[0];
              return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
            })()}
            alt="Video thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(220,38,38,0.9)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <PlayCircle size={36} color="#fff" fill="#fff" />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
              {isHi ? 'क्लिक करें — वीडियो चलाएं' : 'Click to Play'}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
          <iframe
            width="100%"
            height="100%"
            src={`${scheme.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
            title={isHi ? scheme.videoTitleHi : scheme.videoTitleEn}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block', width: '100%', aspectRatio: '16/9', borderRadius: 12 }}
          />
        </div>
      )}

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
        {isHi
          ? '* वीडियो YouTube पर होस्ट है। इंटरनेट कनेक्शन आवश्यक है।'
          : '* Video hosted on YouTube. Internet connection required.'}
      </p>
      </>}
    </div>
  );
}

// ─── Detail View Tabs ─────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: 'overview', iconEl: <ClipboardList size={16} />, labelEn: 'Overview & Documents', labelHi: 'विवरण और दस्तावेज' },
  { id: 'video', iconEl: <Video size={16} />, labelEn: 'Video Walkthrough', labelHi: 'वीडियो व्याख्यान' },
  { id: 'ai', iconEl: <Bot size={16} />, labelEn: 'Ask AI Advisor', labelHi: 'AI से पूछें' },
  { id: 'register', iconEl: <BadgeCheck size={16} />, labelEn: 'Request Registration Help', labelHi: 'पंजीकरण सहायता माँगें' },
];

function SchemeDetailModal({ scheme, language, onClose }) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('overview');

  if (!scheme) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#ffffff', borderRadius: 18, width: '100%', maxWidth: 860, maxHeight: '94vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', overflow: 'hidden' }}
      >
        {/* Top Strip */}
        <div style={{ background: 'linear-gradient(135deg,#15803d,#166534)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
          <div>
            {scheme.isNew && (
              <span style={{ fontSize: 11, fontWeight: 800, background: '#fde68a', color: '#92400e', padding: '2px 8px', borderRadius: 6, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Rss size={11} /> LIVE FEED · NEW
              </span>
            )}
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.3 }}>
              {isHi ? scheme.nameHi : scheme.nameEn}
            </div>
            <div style={{ color: '#bbf7d0', fontSize: 13, marginTop: 4 }}>
              {isHi ? scheme.categoryHi : scheme.category} · {scheme.state}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '7px 11px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0, overflowX: 'auto' }}>
          {DETAIL_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px',
                fontSize: 13.5, fontWeight: 600, border: 'none', background: 'none',
                cursor: 'pointer', borderBottom: `2.5px solid ${activeTab === tab.id ? '#15803d' : 'transparent'}`,
                color: activeTab === tab.id ? '#15803d' : '#64748b',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.iconEl}
              {isHi ? tab.labelHi : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ overflowY: 'auto', padding: '24px 24px', flex: 1 }}>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ background: '#f8fafc', borderLeft: '4px solid #15803d', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                  {isHi ? 'प्रमुख लाभ' : 'Core Benefit'}
                </div>
                <strong style={{ fontSize: 15, color: '#166534' }}>
                  {isHi ? scheme.benefitHi : scheme.benefit}
                </strong>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase' }}>
                  {isHi ? 'पात्रता' : 'Eligibility'}
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {isHi ? scheme.eligibilityHi : scheme.eligibility}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8, textTransform: 'uppercase' }}>
                  {isHi ? 'आवश्यक दस्तावेज' : 'Required Documents'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {scheme.documents.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: '#0f172a' }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#15803d', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
              >
                {isHi ? 'आधिकारिक पोर्टल खोलें' : 'Visit Official Portal'}
                <ExternalLink size={14} />
              </a>
              {scheme.sourceUrl && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                  {scheme.launchDate && <span>{isHi ? 'शुरुआत/घोषणा: ' : 'Launch/announcement: '}{scheme.launchDate} · </span>}
                  {isHi ? 'स्रोत: ' : 'Source: '}
                  <a href={scheme.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 700 }}>
                    {scheme.sourceName || (isHi ? 'आधिकारिक जानकारी' : 'Official information')} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                  </a>
                  {scheme.verifiedAt && <span> · {isHi ? 'स्रोत रिकॉर्ड तारीख' : 'Source recorded'}: {scheme.verifiedAt}</span>}
                </div>
              )}
            </div>
          )}

          {/* ── VIDEO ── */}
          {activeTab === 'video' && (
            <SchemeVideoSection scheme={scheme} language={language} />
          )}

          {/* ── AI CHAT ── */}
          {activeTab === 'ai' && (
            <SchemeAIChat language={language} scheme={scheme} />
          )}

          {/* ── REGISTER ── */}
          {activeTab === 'register' && (
            <SchemeRegistration
              scheme={scheme}
              language={language}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN MODULE ─────────────────────────────────────────────────────────────

/**
 * SchemeModule (V2)
 * Drop-in replacement for the original SchemeModule.jsx.
 * Compatible with the ModuleContainer props contract.
 */
export default function SchemeModule({ language = 'en', isOffline = false, t, navigate, adminOnly = false }) {
  const { user } = useAuth();
  const isHi = language === 'hi';
  const [showSchemeFinder, setShowSchemeFinder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null); // detail modal
  const [schemes, setSchemes] = useState(STATIC_SCHEMES);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const refreshSchemes = async () => {
    try {
      const response = await fetch('/api/schemes');
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data.schemes)) return;
      setSchemes(data.schemes);
      localStorage.setItem('kisanpulse_schemes_cache', JSON.stringify(data.schemes));
      setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
    } catch { /* Keep the built-in catalogue available if the API is offline. */ }
  };

  useEffect(() => { refreshSchemes(); }, []);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q
        || s.nameEn.toLowerCase().includes(q)
        || s.nameHi.includes(q)
        || s.benefit.toLowerCase().includes(q)
        || s.benefitHi.includes(q)
        || s.category.toLowerCase().includes(q)
        || s.categoryHi.toLowerCase().includes(q)
        || (s.tags || []).some(tag => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [schemes, searchQuery, selectedCategory]);

  const categoryOptions = useMemo(() => {
    const known = new Set(SCHEME_CATEGORIES.map(category => category.id));
    const discovered = schemes.filter(s => !known.has(s.category)).map(s => ({ id: s.category, labelEn: s.category, labelHi: s.categoryHi || s.category }));
    return [...SCHEME_CATEGORIES, ...discovered];
  }, [schemes]);

  if (showSchemeFinder) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1rem 80px' }}>
        <button type="button" onClick={() => setShowSchemeFinder(false)} style={{ marginBottom: 12, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>
          ← {isHi ? 'योजनाओं पर वापस जाएँ' : 'Back to scheme overview'}
        </button>
        <SchemeMatchFinder />
      </div>
    );
  }

  if (adminOnly) {
    if (user?.role !== 'admin') return <div role="alert" style={{ padding: 24 }}>Admin access is required.</div>;
    return <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 80px' }}>
      <h2 style={{ color: '#166534' }}>{isHi ? 'एडमिन संचालन' : 'Admin Operations'}</h2>
      <SchemeAdminPortal language={language} schemes={schemes} onPublished={refreshSchemes} />
    </div>;
  }

  const liveCount = filteredSchemes.filter(s => s.source === 'live-feed').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 80px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck2 size={26} />
            {isHi ? 'सरकारी कृषि योजनाएं एवं सहायता कार्यक्रम' : 'Government Agricultural Schemes & Support'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.3rem 0 0' }}>
            {isHi
              ? '50 किसान-केंद्रित योजनाएँ और कार्यक्रम · हिंदी/अंग्रेज़ी जानकारी · पात्रता और आधिकारिक स्रोत देखें।'
              : 'Browse 50 farmer-focused schemes and programmes with bilingual explanations and official links.'}
          </p>
        </div>

        {/* Live Feed Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: liveCount > 0 ? '#fef2f2' : '#f1f5f9', color: liveCount > 0 ? '#dc2626' : '#64748b', border: `1px solid ${liveCount > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 700 }}>
            <Rss size={13} />
            {liveCount > 0
              ? (isHi ? `${liveCount} हाल की योजनाएँ` : `${liveCount} recent schemes`)
              : (isHi ? `${schemes.length} कैटलॉग रिकॉर्ड` : `${schemes.length} catalogue entries`)}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} />
            {lastRefreshed ? (isHi ? `डेटाबेस: ${lastRefreshed}` : `Database refreshed: ${lastRefreshed}`) : (isHi ? 'स्थानीय कैटलॉग' : 'Local catalogue')}
          </span>
        </div>
      </div>

      <SchemeAlerts language={language} />
      <MySchemeRequests language={language} />
      {user?.role === 'admin' && <SchemeAdminPortal language={language} schemes={schemes} onPublished={refreshSchemes} />}

      <button type="button" onClick={() => setShowSchemeFinder(true)} style={{ marginBottom: 16, border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', background: '#f0fdf4', color: '#166534', cursor: 'pointer', fontWeight: 700 }}>
        {isHi ? 'मेरी स्थिति के अनुसार योजनाएँ खोजें →' : 'Find schemes for my situation →'}
      </button>

      {/* Offline Banner */}
      {isOffline && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {isHi ? 'ऑफलाइन मोड — स्थानीय डेटा दिखाया जा रहा है। AI चैट के लिए इंटरनेट आवश्यक है।' : 'Offline mode — showing cached scheme data. Internet required for AI chat & video.'}
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={isHi ? 'योजना का नाम या लाभ खोजें…' : 'Search by scheme name or benefit…'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', height: 40, paddingLeft: 40, paddingRight: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: '0 1 220px' }}>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#f8fafc', fontWeight: 600 }}
          >
            {categoryOptions.map(c => (
              <option key={c.id} value={c.id}>{isHi ? c.labelHi : c.labelEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Scheme Cards Grid ── */}
      {filteredSchemes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: 14, border: '2px dashed #cbd5e1' }}>
          <Search size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>
            {isHi ? 'कोई योजना नहीं मिली' : 'No schemes found'}
          </div>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {isHi ? 'खोज बदलें या फ़िल्टर हटाएं।' : 'Try a different search or clear the filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredSchemes.map(scheme => (
            <div
              key={scheme.id}
              style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: `1.5px solid ${scheme.isNew ? '#fca5a5' : '#e2e8f0'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              <div>
                {/* Category + Status row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#dcfce7', color: '#15803d' }}>
                    {isHi ? scheme.categoryHi : scheme.category}
                  </span>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {scheme.isNew && (
                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Rss size={10} /> NEW
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{scheme.state}</span>
                  </div>
                </div>

                {/* Scheme Name */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {isHi ? scheme.nameHi : scheme.nameEn}
                </h3>

                {/* Benefit Strip */}
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #16a34a', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                    {isHi ? 'प्रमुख लाभ' : 'Core Benefit'}
                  </span>
                  <span style={{ fontSize: 13.5, color: '#166534', fontWeight: 600 }}>
                    {isHi ? scheme.benefitHi : scheme.benefit}
                  </span>
                </div>

                {/* Feature Icons Row */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {scheme.videoUrl && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                      <PlayCircle size={11} /> {isHi ? 'वीडियो' : 'Video'}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                    <Bot size={11} /> AI
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                    ₹{scheme.serviceFee || 199} {isHi ? 'सेवा' : 'Service'}
                  </span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <button
                onClick={() => setSelectedScheme(scheme)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', background: 'linear-gradient(135deg,#15803d,#166534)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.15s' }}
              >
                <Sparkles size={15} />
                {isHi ? 'विस्तार देखें • AI • वीडियो • पंजीकरण' : 'Details · AI Explain · Video · Register'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Full Detail Modal ── */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          language={language}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}
