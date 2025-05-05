import React, { useState } from 'react';
import { debounce } from '../../utils/helpers';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  className = '',
  initialValue = '',
  debounceTime = 300,
  icon = true,
  rounded = 'rounded-lg',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Create debounced search function
  const debouncedSearch = React.useCallback(
    debounce((term) => {
      if (onSearch) {
        onSearch(term);
      }
    }, debounceTime),
    [onSearch, debounceTime]
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  return (
    <div className={`relative ${widthClass} ${className}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
      
      <input
        type="search"
        className={`block ${widthClass} ${icon ? 'pl-10' : 'pl-4'} pr-4 ${sizeClass} ${rounded} border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 dark:bg-slate-700 dark:text-white`}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        {...props}
      />
      
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => {
            setSearchTerm('');
            if (onSearch) onSearch('');
          }}
        >
          <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
