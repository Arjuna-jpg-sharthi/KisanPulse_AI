import React from 'react';

/**
 * Shared Card Component
 */
export const Card = ({
  variant = 'default',
  hoverable = false,
  className = '',
  onClick,
  children,
  ...rest
}) => {
  const classes = [
    'kp-card',
    hoverable ? 'kp-card-hoverable' : '',
    variant === 'stat' ? 'kp-card-stat' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  icon,
  iconVariant = 'default',
  action,
  className = '',
  children
}) => {
  return (
    <div className={`kp-card-header ${className}`}>
      <div className="kp-card-header-left">
        {icon && (
          <div className={`kp-card-icon-wrap ${iconVariant}`}>
            {icon}
          </div>
        )}
        {(title || subtitle) && (
          <div className="kp-card-title-group">
            {title && <h3 className="kp-card-title">{title}</h3>}
            {subtitle && <p className="kp-card-subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {action && <div className="kp-card-header-action">{action}</div>}
    </div>
  );
};

export const CardBody = ({ className = '', children, ...rest }) => {
  return (
    <div className={`kp-card-body ${className}`} {...rest}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = '', children, ...rest }) => {
  return (
    <div className={`kp-card-footer ${className}`} {...rest}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
