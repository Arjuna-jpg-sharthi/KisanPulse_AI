import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

/**
 * Shared Empty State Component
 */
export const EmptyState = ({
  icon = null,
  title = 'No Data Found',
  description = 'There are currently no records available for this section.',
  action = null, // { label, onClick, icon, variant }
  className = ''
}) => {
  return (
    <div className={`kp-empty-state ${className}`}>
      <div className="kp-empty-icon-wrap">
        {icon || <PackageOpen size={32} />}
      </div>
      <h4 className="kp-empty-title">{title}</h4>
      <p className="kp-empty-desc">{description}</p>
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
