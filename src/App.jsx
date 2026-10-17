import React, { useState, useEffect } from 'react';
import FarmingModule from './modules/farming/FarmingModule';
import SchemesModule from './modules/schemes/SchemesModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('farming');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8faf9' }}>
      {/* Top Application Bar */}
      <header style={{
        backgroundColor: '#1b4332',
        color: '#ffffff',
        padding: '0.875rem 1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '1.75rem',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🌱
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em', margin: 0 }}>
              KisanPulse AI
            </h1>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0 }}>
              Smart Agronomic Decision Support & Market Intelligence
            </p>
          </div>
        </div>

        {/* Connectivity Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: isOnline ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.25)',
          border: `1px solid ${isOnline ? '#4ade80' : '#f87171'}`,
          color: isOnline ? '#bbf7d0' : '#fecaca'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#4ade80' : '#ef4444',
            display: 'inline-block'
          }} />
          {isOnline ? 'Online — Live Sync Ready' : 'Offline Mode — Local Cache Active'}
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1.5rem',
        display: 'flex',
        gap: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('farming')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            borderBottom: activeTab === 'farming' ? '3px solid #2d6a4f' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'farming' ? '#2d6a4f' : '#6b7280',
            fontWeight: activeTab === 'farming' ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🌾</span> Smart Farming & Mandi Engine
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            borderBottom: activeTab === 'schemes' ? '3px solid #2d6a4f' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'schemes' ? '#2d6a4f' : '#6b7280',
            fontWeight: activeTab === 'schemes' ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🏛️</span> Government Schemes
        </button>
      </nav>

      {/* Main Module Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'farming' ? <FarmingModule isOnline={isOnline} /> : <SchemesModule />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f1f5f3',
        borderTop: '1px solid #e5e7eb',
        padding: '1rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#6b7280'
      }}>
        KisanPulse AI &copy; 2026 &bull; Smart Agriculture & Rural Development Module &bull; Built with transparent agronomic logic
      </footer>
    </div>
  );
}
