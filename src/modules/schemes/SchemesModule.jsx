import React from 'react';

/**
 * Government Schemes Module (Maintained by Schemes Team)
 * Provided as part of the shared KisanPulse AI application.
 */
export default function SchemesModule() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534', marginBottom: '0.75rem' }}>
          🏛️ Government Agriculture Schemes & Subsidies
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          This module is managed by the KisanPulse Schemes sub-team. Explore eligible central and state agricultural welfare programs:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
            <h3 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>PM-KISAN Samman Nidhi</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>₹6,000/year direct income support in three equal installments to all landholding farmer families.</p>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>Active Scheme</span>
          </div>
          <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
            <h3 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>PM Fasal Bima Yojana (PMFBY)</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>Comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest.</p>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>Active Scheme</span>
          </div>
          <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
            <h3 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>Soil Health Card Scheme</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>Provides reports to farmers on the nutrient status of their soil with customized fertilizer recommendations.</p>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>Active Scheme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
