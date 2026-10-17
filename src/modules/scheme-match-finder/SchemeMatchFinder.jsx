/**
 * SchemeModule.jsx — KisanPulse AI · Government SchemeMatch
 *
 * Main UI component for scheme discovery, matching, and bookmarking.
 * Exports a default React component named SchemeModule.
 *
 * ⚠️  KisanPulse AI is NOT an official government service and cannot
 *     submit applications or guarantee eligibility / benefits.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SCHEMES,
  CATEGORIES,
  STATES,
  LAND_CATEGORIES,
  OWNERSHIP_TYPES,
  SUPPORT_NEEDS,
} from './schemeData.js';
import { matchSchemes, searchSchemes } from './schemeMatcher.js';
import './scheme.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BOOKMARK_KEY = 'kisanpulse_scheme_bookmarks';

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(ids) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
}

/** Format a category id to its label */
function categoryLabel(catId) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.label : catId;
}

/** Days since a date string */
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Disclaimer banner shown at top */
function Disclaimer() {
  return (
    <div className="scheme-disclaimer">
      <strong>⚠️ Important / महत्वपूर्ण</strong>
      KisanPulse AI is <strong>not</strong> an official government service. Information shown here is
      sourced from official portals but may not reflect the latest updates. Always verify details on
      the official scheme website before applying. We cannot submit applications or guarantee
      eligibility or benefits.
      <br />
      <span className="scheme-hi">
        किसानपल्स AI एक सरकारी सेवा नहीं है। कृपया आवेदन से पहले आधिकारिक वेबसाइट पर जानकारी
        सत्यापित करें।
      </span>
    </div>
  );
}

// ---- Scheme Card ----------------------------------------------------------

function SchemeCard({ scheme, bookmarked, onToggleBookmark, onSelect, matchResult }) {
  return (
    <div className="scheme-card" onClick={() => onSelect(scheme.id)}>
      <div className="scheme-card-header">
        <div>
          {matchResult && (
            <span
              className={`scheme-match-badge ${
                matchResult.matchType === 'likely' ? 'scheme-match-likely' : 'scheme-match-potential'
              }`}
            >
              {matchResult.matchType === 'likely' ? '🟢 Likely Relevant' : '🟡 Potential Match'}
            </span>
          )}
          <h3 className="scheme-card-name">{scheme.name}</h3>
          {scheme.nameHi && <span className="scheme-hi">{scheme.nameHi}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span className="scheme-card-category">{categoryLabel(scheme.category)}</span>
          <button
            className={`scheme-bookmark-btn ${bookmarked ? 'scheme-bookmarked' : ''}`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this scheme'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(scheme.id);
            }}
          >
            {bookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>
      <p className="scheme-card-purpose">{scheme.purpose}</p>
      {matchResult && matchResult.reasons.length > 0 && (
        <ul className="scheme-match-reasons">
          {matchResult.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {matchResult && matchResult.caveats.length > 0 && (
        <ul className="scheme-match-caveats">
          {matchResult.caveats.slice(0, 2).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      <div className="scheme-card-meta">
        <span>🏛️ {scheme.department}</span>
        <span>📅 Verified: {scheme.lastVerified || 'Unknown'}</span>
      </div>
    </div>
  );
}

// ---- Scheme Detail --------------------------------------------------------

function SchemeDetail({ scheme, bookmarked, onToggleBookmark, onBack }) {
  const stale = daysSince(scheme.lastVerified) > 180; // > 6 months

  return (
    <div className="scheme-detail">
      <button className="scheme-back-btn" onClick={onBack}>
        ← Back to list
      </button>

      <h2 className="scheme-detail-name">{scheme.name}</h2>
      {scheme.nameHi && <p className="scheme-detail-hi">{scheme.nameHi}</p>}

      <button
        className={`scheme-bookmark-btn ${bookmarked ? 'scheme-bookmarked' : ''}`}
        onClick={() => onToggleBookmark(scheme.id)}
        style={{ marginBottom: '1rem' }}
      >
        {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
      </button>

      {stale && (
        <div className="scheme-verification-warning">
          ⚠️ This information was last verified on <strong>{scheme.lastVerified}</strong> — more than
          6 months ago. Details may have changed. Please check the official website for the latest
          rules.
          <br />
          <span className="scheme-hi">
            यह जानकारी 6 महीने से अधिक पुरानी हो सकती है। कृपया नवीनतम नियमों के लिए आधिकारिक
            वेबसाइट देखें।
          </span>
        </div>
      )}

      {/* Purpose */}
      <div className="scheme-detail-section">
        <h3>Purpose / उद्देश्य</h3>
        <p>{scheme.purpose}</p>
        {scheme.purposeHi && <p className="scheme-hi">{scheme.purposeHi}</p>}
      </div>

      {/* Benefits */}
      <div className="scheme-detail-section">
        <h3>Benefits / लाभ</h3>
        <ul className="scheme-detail-list">
          {scheme.benefits.map((b, i) => (
            <li key={i}>
              {b}
              {scheme.benefitsHi && scheme.benefitsHi[i] && (
                <span className="scheme-hi">{scheme.benefitsHi[i]}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Eligibility */}
      <div className="scheme-detail-section">
        <h3>Eligibility Criteria / पात्रता मानदंड</h3>
        <ul className="scheme-detail-list">
          {scheme.eligibility.map((e, i) => (
            <li key={i}>
              {e}
              {scheme.eligibilityHi && scheme.eligibilityHi[i] && (
                <span className="scheme-hi">{scheme.eligibilityHi[i]}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Documents */}
      <div className="scheme-detail-section">
        <h3>Commonly Required Documents / आवश्यक दस्तावेज़</h3>
        <ul className="scheme-detail-list">
          {scheme.documents.map((d, i) => (
            <li key={i}>
              {d}
              {scheme.documentsHi && scheme.documentsHi[i] && (
                <span className="scheme-hi">{scheme.documentsHi[i]}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Application Steps */}
      <div className="scheme-detail-section">
        <h3>How to Apply / आवेदन कैसे करें</h3>
        <ol className="scheme-detail-steps">
          {scheme.applicationSteps.map((s, i) => (
            <li key={i}>
              {s}
              {scheme.applicationStepsHi && scheme.applicationStepsHi[i] && (
                <span className="scheme-hi"> {scheme.applicationStepsHi[i]}</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Department */}
      <div className="scheme-detail-section">
        <h3>Responsible Department / जिम्मेदार विभाग</h3>
        <p>{scheme.department}</p>
        {scheme.departmentHi && <p className="scheme-hi">{scheme.departmentHi}</p>}
      </div>

      {/* Official link */}
      <div className="scheme-detail-section">
        <h3>Official Website / आधिकारिक वेबसाइट</h3>
        <a
          className="scheme-official-link"
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 Visit Official Portal
        </a>
      </div>

      {/* Source & verification */}
      <div className="scheme-source-info">
        <strong>Source:</strong>{' '}
        <a href={scheme.source} target="_blank" rel="noopener noreferrer">
          {scheme.source}
        </a>
        <br />
        <strong>Last Verified:</strong> {scheme.lastVerified || 'Not available'}
        <br />
        <em>
          Information may change. Always refer to the official portal for the most current details.
        </em>
      </div>
    </div>
  );
}

// ---- Farmer Profile Questionnaire -----------------------------------------

function ProfileForm({ onSubmit }) {
  const [state, setState] = useState('');
  const [ownership, setOwnership] = useState('');
  const [landCategory, setLandCategory] = useState('');
  const [crop, setCrop] = useState('');
  const [supportNeeds, setSupportNeeds] = useState([]);

  const toggleNeed = (id) => {
    setSupportNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const canSubmit = state !== '' || ownership !== '' || supportNeeds.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ state, ownership, landCategory, crop, supportNeeds });
  };

  return (
    <form className="scheme-form" onSubmit={handleSubmit}>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
        Answer a few questions to find schemes that may be relevant to you. We do not collect
        Aadhaar, bank details, or other sensitive information.
        <br />
        <span className="scheme-hi">
          कुछ सवालों के जवाब दें ताकि आपके लिए संभावित योजनाएँ खोजी जा सकें। हम आधार या बैंक
          विवरण नहीं एकत्र करते।
        </span>
      </p>

      {/* State */}
      <div className="scheme-form-group">
        <label className="scheme-form-label">
          State / राज्य <span className="scheme-hi">(राज्य)</span>
        </label>
        <select
          className="scheme-form-select"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select your state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Ownership */}
      <div className="scheme-form-group">
        <label className="scheme-form-label">
          Land Ownership / Cultivation Status{' '}
          <span className="scheme-hi">(भूमि स्वामित्व / कृषि स्थिति)</span>
        </label>
        <select
          className="scheme-form-select"
          value={ownership}
          onChange={(e) => setOwnership(e.target.value)}
        >
          <option value="">Select status</option>
          {OWNERSHIP_TYPES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label} — {o.labelHi}
            </option>
          ))}
        </select>
      </div>

      {/* Land category */}
      <div className="scheme-form-group">
        <label className="scheme-form-label">
          Approximate Landholding{' '}
          <span className="scheme-hi">(अनुमानित भूमि जोत)</span>
        </label>
        <select
          className="scheme-form-select"
          value={landCategory}
          onChange={(e) => setLandCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {LAND_CATEGORIES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label} — {l.labelHi}
            </option>
          ))}
        </select>
      </div>

      {/* Crop */}
      <div className="scheme-form-group">
        <label className="scheme-form-label">
          Primary Crop <span className="scheme-hi">(प्राथमिक फसल)</span>
        </label>
        <input
          className="scheme-form-input"
          type="text"
          placeholder="e.g. Rice, Wheat, Cotton…"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
      </div>

      {/* Support needs */}
      <div className="scheme-form-group">
        <label className="scheme-form-label">
          Type of Support Needed{' '}
          <span className="scheme-hi">(आवश्यक सहायता का प्रकार)</span>
        </label>
        <div className="scheme-form-checkboxes">
          {SUPPORT_NEEDS.map((sn) => (
            <label
              key={sn.id}
              className={`scheme-form-checkbox-label ${
                supportNeeds.includes(sn.id) ? 'scheme-checkbox-checked' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={supportNeeds.includes(sn.id)}
                onChange={() => toggleNeed(sn.id)}
              />
              {sn.label}
              <span className="scheme-hi">({sn.labelHi})</span>
            </label>
          ))}
        </div>
      </div>

      <button className="scheme-form-submit" type="submit" disabled={!canSubmit}>
        Find Matching Schemes / योजनाएँ खोजें
      </button>
    </form>
  );
}

// ---- Empty state ----------------------------------------------------------

function EmptyState({ icon, text, sub }) {
  return (
    <div className="scheme-empty">
      <div className="scheme-empty-icon">{icon || '🔍'}</div>
      <p className="scheme-empty-text">{text || 'No schemes found.'}</p>
      {sub && <p className="scheme-empty-sub">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main module component
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'browse', label: 'Browse Schemes', labelHi: 'योजनाएँ देखें' },
  { id: 'match', label: 'Find for Me', labelHi: 'मेरे लिए खोजें' },
  { id: 'bookmarks', label: 'Bookmarks', labelHi: 'बुकमार्क' },
];

function SchemeModule() {
  // Navigation
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Bookmarks (persisted)
  const [bookmarks, setBookmarks] = useState(() => loadBookmarks());

  // Match results
  const [matchResults, setMatchResults] = useState(null);

  // Persist bookmarks
  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }, []);

  // Filtered scheme list for Browse tab
  const filteredSchemes = useMemo(
    () => searchSchemes(searchQuery, { state: filterState, category: filterCategory }),
    [searchQuery, filterState, filterCategory]
  );

  // Bookmarked schemes
  const bookmarkedSchemes = useMemo(
    () => SCHEMES.filter((s) => bookmarks.includes(s.id)),
    [bookmarks]
  );

  // Handle match form submission
  const handleProfileSubmit = (profile) => {
    const results = matchSchemes(profile);
    setMatchResults(results);
  };

  // Select scheme → detail view
  const openDetail = (id) => setSelectedSchemeId(id);
  const closeDetail = () => setSelectedSchemeId(null);

  // If a scheme is selected, show its detail
  const selectedScheme = selectedSchemeId
    ? SCHEMES.find((s) => s.id === selectedSchemeId)
    : null;

  if (selectedScheme) {
    return (
      <div className="scheme-module">
        <Disclaimer />
        <SchemeDetail
          scheme={selectedScheme}
          bookmarked={bookmarks.includes(selectedScheme.id)}
          onToggleBookmark={toggleBookmark}
          onBack={closeDetail}
        />
      </div>
    );
  }

  return (
    <div className="scheme-module">
      <h1 className="scheme-title">🌾 Government SchemeMatch</h1>
      <p className="scheme-subtitle">
        Discover government agricultural schemes that may be relevant to you.
        <br />
        <span className="scheme-hi">
          सरकारी कृषि योजनाएँ खोजें जो आपके लिए प्रासंगिक हो सकती हैं।
        </span>
      </p>

      <Disclaimer />

      {/* Tab navigation */}
      <nav className="scheme-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`scheme-nav-btn ${activeTab === tab.id ? 'scheme-nav-active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setMatchResults(null); // reset match when switching tabs
            }}
          >
            {tab.label}{' '}
            <span className="scheme-hi">({tab.labelHi})</span>
            {tab.id === 'bookmarks' && bookmarks.length > 0 && ` (${bookmarks.length})`}
          </button>
        ))}
      </nav>

      {/* ---- Browse tab ---- */}
      {activeTab === 'browse' && (
        <>
          <div className="scheme-search-bar">
            <input
              className="scheme-search-input"
              type="text"
              placeholder="Search schemes… / योजना खोजें…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="scheme-filter-select"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="">All States / सभी राज्य</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="scheme-filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories / सभी श्रेणियाँ</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.labelHi}
                </option>
              ))}
            </select>
          </div>

          {filteredSchemes.length === 0 ? (
            <EmptyState
              icon="🔍"
              text="No schemes match your search."
              sub="Try different keywords or clear filters. / अन्य कीवर्ड या फ़िल्टर आज़माएँ।"
            />
          ) : (
            <div className="scheme-card-list">
              {filteredSchemes.map((s) => (
                <SchemeCard
                  key={s.id}
                  scheme={s}
                  bookmarked={bookmarks.includes(s.id)}
                  onToggleBookmark={toggleBookmark}
                  onSelect={openDetail}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ---- Match tab ---- */}
      {activeTab === 'match' && (
        <>
          {!matchResults ? (
            <>
              <h2 className="scheme-section-title">
                Farmer Profile / किसान प्रोफ़ाइल
              </h2>
              <ProfileForm onSubmit={handleProfileSubmit} />
            </>
          ) : (
            <>
              <div className="scheme-bookmarks-header">
                <h2 className="scheme-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                  Matching Results / मिलान परिणाम
                </h2>
                <button
                  className="scheme-back-btn"
                  onClick={() => setMatchResults(null)}
                >
                  ← New Search
                </button>
              </div>

              <div className="scheme-disclaimer" style={{ marginTop: '0.5rem' }}>
                These are <strong>potential matches</strong> based on the information you provided.
                Actual eligibility is determined by the implementing agency. We do not guarantee
                approval or benefit payments.
                <br />
                <span className="scheme-hi">
                  ये आपकी दी गई जानकारी के आधार पर <strong>संभावित मिलान</strong> हैं। वास्तविक
                  पात्रता कार्यान्वयन एजेंसी द्वारा निर्धारित की जाती है। हम अनुमोदन या लाभ
                  भुगतान की गारंटी नहीं देते।
                </span>
              </div>

              {matchResults.length === 0 ? (
                <EmptyState
                  icon="📋"
                  text="No matching schemes found for your profile."
                  sub="Try adjusting your answers, or browse all schemes. / अपने उत्तर बदलें या सभी योजनाएँ देखें।"
                />
              ) : (
                <div className="scheme-card-list">
                  {matchResults.map((mr) => (
                    <SchemeCard
                      key={mr.scheme.id}
                      scheme={mr.scheme}
                      bookmarked={bookmarks.includes(mr.scheme.id)}
                      onToggleBookmark={toggleBookmark}
                      onSelect={openDetail}
                      matchResult={mr}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---- Bookmarks tab ---- */}
      {activeTab === 'bookmarks' && (
        <>
          <h2 className="scheme-section-title">
            Your Bookmarked Schemes / आपकी बुकमार्क की गई योजनाएँ
          </h2>

          {bookmarkedSchemes.length === 0 ? (
            <EmptyState
              icon="☆"
              text="No bookmarks yet."
              sub="Browse or search schemes and tap ☆ to bookmark. / योजनाएँ देखें और ☆ दबाकर बुकमार्क करें।"
            />
          ) : (
            <>
              <div className="scheme-disclaimer">
                Bookmarked schemes are saved in your browser's local storage. Information shown may
                not be current — always verify on the official portal before applying.
                <br />
                <span className="scheme-hi">
                  बुकमार्क आपके ब्राउज़र में सहेजे जाते हैं। जानकारी वर्तमान नहीं हो सकती —
                  आवेदन से पहले आधिकारिक पोर्टल पर सत्यापित करें।
                </span>
              </div>
              <div className="scheme-card-list">
                {bookmarkedSchemes.map((s) => (
                  <SchemeCard
                    key={s.id}
                    scheme={s}
                    bookmarked={true}
                    onToggleBookmark={toggleBookmark}
                    onSelect={openDetail}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SchemeModule;
