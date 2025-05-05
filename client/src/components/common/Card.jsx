import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  shadow = 'shadow-md',
  rounded = 'rounded-xl',
  border = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-slate-800 overflow-hidden transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-lg transform hover:scale-[1.01]' : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${padding} ${shadow} ${rounded} ${border} ${hoverClasses} ${cursorClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', divider = false, ...props }) => {
  const dividerClasses = divider ? 'border-b border-gray-200 dark:border-slate-700 pb-4 mb-4' : '';
  
  return (
    <div className={`${dividerClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', divider = false, ...props }) => {
  const dividerClasses = divider ? 'border-t border-gray-200 dark:border-slate-700 pt-4 mt-4' : '';
  
  return (
    <div className={`${dividerClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
