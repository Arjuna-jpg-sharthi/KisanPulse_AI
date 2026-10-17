import React, { Component } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

/**
 * Resilient Error Boundary to safeguard app shell from module crashes
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('KisanPulse AI ErrorBoundary captured error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="kp-error-box" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <div className="kp-error-icon-wrap">
            <AlertOctagon size={26} />
          </div>
          <h3 className="kp-error-title">
            {this.props.title || 'Component Error Encountered'}
          </h3>
          <p className="kp-error-desc">
            {this.props.message ||
              'A runtime error occurred in this module. The rest of your application remains operational.'}
          </p>
          {this.state.error?.message && (
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                background: '#fee2e2',
                padding: '8px 12px',
                borderRadius: '6px',
                color: '#991b1b',
                maxWidth: '100%',
                overflowX: 'auto',
                textAlign: 'left'
              }}
            >
              {this.state.error.message}
            </div>
          )}
          <div className="kp-error-actions">
            <Button
              variant="primary"
              size="md"
              icon={<RotateCcw size={15} />}
              onClick={this.handleReset}
            >
              Reload Section
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
