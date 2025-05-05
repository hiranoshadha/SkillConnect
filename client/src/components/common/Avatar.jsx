import React from 'react';
import { getInitials, stringToColor } from '../../utils/helpers';

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  status = null,
  statusPosition = 'bottom-right',
  border = false,
  onClick,
  ...props
}) => {
  const sizeClasses = sizes[size] || sizes.md;
  const borderClasses = border ? 'border-2 border-white dark:border-slate-800' : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';
  
  // Status position classes
  const statusPositionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };
  
  const statusPositionClass = statusPositionClasses[statusPosition] || statusPositionClasses['bottom-right'];
  
  // Status color classes
  const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };
  
  const statusColorClass = statusColorClasses[status] || '';
  
  // If no image, create an avatar with initials
  const renderContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full object-cover"
        />
      );
    } else if (name) {
      const initials = getInitials(name);
      const bgColor = stringToColor(name);
      
      return (
        <div 
          className="h-full w-full flex items-center justify-center font-medium text-white"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      );
    } else {
      // Default placeholder
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
          <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className={`${sizeClasses} ${borderClasses} ${cursorClasses} rounded-full overflow-hidden`}>
        {renderContent()}
      </div>
      
      {status && (
        <span className={`absolute ${statusPositionClass} block h-2.5 w-2.5 rounded-full ${statusColorClass} ring-2 ring-white dark:ring-slate-800`}></span>
      )}
    </div>
  );
};

export default Avatar;
