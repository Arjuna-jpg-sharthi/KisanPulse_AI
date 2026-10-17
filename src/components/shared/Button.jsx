import React from 'react';

/**
 * Shared Button Component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'accent' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.icon]
 * @param {'left' | 'right'} [props.iconPosition='left']
 * @param {string} [props.className='']
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  children,
  type = 'button',
  ...rest
}) => {
  const variantClass = `kp-btn-${variant}`;
  const sizeClass = `kp-btn-${size}`;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`kp-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="kp-spinner kp-spinner-sm" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="kp-btn-icon" aria-hidden="true">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="kp-btn-icon" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
};

export default Button;
