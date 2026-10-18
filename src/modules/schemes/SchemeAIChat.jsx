/**
 * KisanPulse — Local scheme-catalogue advisor
 *
 * Full-page scheme chat powered by the bundled KisanPulse catalogue.
 * Replies locally in the browser; it does not call Gemini or another AI API.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, X, Sparkles, AlertCircle,
  RotateCcw, ChevronRight, Info
} from 'lucide-react';
import { answerSchemeQuestion } from '../../services/farmingAiService';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * SchemeAIChat
 * @param {object} props
 * @param {string}  props.language   - 'en' | 'hi'
 * @param {object}  [props.scheme]   - Pre-loaded scheme context (optional)
 */
export default function SchemeAIChat({ language = 'en', scheme = null }) {
  const isHi = language === 'hi';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const answer = answerSchemeQuestion(text, language, scheme);
      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      console.error('[SchemeAIChat local knowledge]', err);
      setError(isHi
        ? 'इस सवाल का जवाब योजना कैटलॉग से तैयार नहीं हो पाया। योजना का विवरण खोलकर फिर पूछें।'
        : 'I could not prepare an answer from the scheme catalogue. Open the scheme details and try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  // ── Suggested Starter Questions ──────────────────────────────────────────
  const suggestions = isHi
    ? [
        scheme ? `${scheme.nameHi} के मुख्य फायदे क्या हैं?` : 'PM-KISAN में कितनी राशि मिलती है?',
        scheme ? `${scheme.nameHi} के लिए कौन से दस्तावेज चाहिए?` : 'फसल बीमा के लिए कौन पात्र है?',
        'आवेदन कैसे करें? ऑनलाइन या ऑफलाइन?',
        'क्या बटाईदार किसान भी पात्र हैं?',
      ]
    : [
        scheme ? `What are the main benefits of ${scheme.nameEn}?` : 'How much money does PM-KISAN give per year?',
        scheme ? `What documents do I need for ${scheme.nameEn}?` : 'Who is eligible for crop insurance?',
        'Can I apply online or do I need to visit an office?',
        'Are tenant farmers / sharecroppers also eligible?',
      ];

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN CHAT INTERFACE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 24px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Chat Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,#15803d,#166534)', borderRadius: '12px 12px 0 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: 8 }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
              {isHi ? 'KisanPulse AI योजना सहायक' : 'KisanPulse AI Scheme Advisor'}
            </div>
            <div style={{ color: '#bbf7d0', fontSize: 12 }}>
              {isHi ? 'योजना कैटलॉग से हिंदी और अंग्रेज़ी में जवाब • API की जरूरत नहीं' : 'Hindi and English answers from the scheme catalogue • No API key needed'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={clearChat}
            title={isHi ? 'चैट साफ करें' : 'Clear chat'}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}
          >
            <RotateCcw size={14} />
            {isHi ? 'साफ करें' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Active Scheme Context Badge */}
      {scheme && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#15803d', flexShrink: 0 }}>
          <Info size={14} />
          <span>
            {isHi ? 'सक्रिय संदर्भ:' : 'Active context:'}{' '}
            <strong>{isHi ? scheme.nameHi : scheme.nameEn}</strong>
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 300, background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: 'none' }}>

        {/* Empty state with suggestions */}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ background: 'linear-gradient(135deg,#dcfce7,#f0fdf4)', borderRadius: '50%', padding: 20, marginBottom: 16 }}>
              <Sparkles size={36} color="#15803d" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              {isHi ? 'योजना के बारे में कुछ भी पूछें' : 'Ask me anything about this scheme'}
            </h3>
            <p style={{ fontSize: 13.5, color: '#64748b', textAlign: 'center', maxWidth: 400, marginBottom: 24 }}>
              {isHi
                ? 'पात्रता, दस्तावेज, लाभ, आवेदन — मैं आपकी भाषा में समझाऊंगा।'
                : 'Eligibility, documents, benefits, how to apply — I\'ll explain it all in plain language.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 480 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13.5, color: '#334155', fontWeight: 500 }}
                >
                  <ChevronRight size={15} color="#15803d" style={{ flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 10
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#166534)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Bot size={16} color="#fff" />
              </div>
            )}
            <div
              style={{
                maxWidth: '82%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                background: msg.role === 'user' ? 'linear-gradient(135deg,#15803d,#166534)' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {/* Render **bold** markdown roughly */}
              {msg.text.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 0 ? part : <strong key={j}>{part}</strong>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#166534)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px 16px 16px 16px', padding: '12px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(n => (
                <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#15803d', display: 'inline-block', animation: `bounce 1.2s ${n * 0.2}s ease-in-out infinite` }} />
              ))}
              <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '14px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={500}
          placeholder={isHi ? 'योजना के बारे में सवाल लिखें… (Enter = भेजें)' : 'Ask about this scheme… (Enter to send)'}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none', maxHeight: 100, overflowY: 'auto' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 16px',
            background: loading || !input.trim() ? '#e2e8f0' : '#15803d',
            color: loading || !input.trim() ? '#94a3b8' : '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            fontSize: 14,
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
          {isHi ? 'भेजें' : 'Send'}
        </button>
      </div>
    </div>
  );
}
