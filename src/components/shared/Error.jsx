import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

/**
 * Shared Error Display Component
 */
export const Error = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
  retryText = 'Try Again',
  isOffline = false,
  className = ''
}) => {
  return (
    <div className={`kp-error-box ${className}`} role="alert">
      <div className="kp-error-icon-wrap">
        {isOffline ? <WifiOff size={24} /> : <AlertTriangle size={24} />}
      </div>
      <h3 className="kp-error-title">{title}</h3>
      <p className="kp-error-desc">{message}</p>
      
      {onRetry && (
        <div className="kp-error-actions">
          <Button
            variant="danger"
            size="md"
            icon={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Error;
