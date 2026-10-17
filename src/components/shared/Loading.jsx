import React from 'react';

/**
 * Shared Loading Component
 * Supports spinner and skeleton placeholders
 */
export const Loading = ({
  size = 'md',
  text = 'Loading farm data...',
  skeleton = false,
  skeletonLines = 3,
  className = ''
}) => {
  if (skeleton) {
    return (
      <div className={`kp-loading-skeleton-wrap ${className}`} style={{ width: '100%', padding: '16px 0' }}>
        <div className="kp-skeleton" style={{ height: '24px', width: '40%', marginBottom: '12px' }} />
        {Array.from({ length: skeletonLines }).map((_, idx) => (
          <div
            key={idx}
            className="kp-skeleton"
            style={{
              height: '16px',
              width: idx === skeletonLines - 1 ? '60%' : '100%',
              marginBottom: '10px'
            }}
          />
        ))}
      </div>
    );
  }

  const spinnerSizeClass = `kp-spinner-${size}`;

  return (
    <div className={`kp-loading-container ${className}`} role="status" aria-live="polite">
      <div className={`kp-spinner ${spinnerSizeClass}`} />
      {text && <span className="kp-loading-text">{text}</span>}
    </div>
  );
};

export default Loading;
