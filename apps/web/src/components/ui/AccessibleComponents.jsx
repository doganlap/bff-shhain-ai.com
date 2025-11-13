import React from 'react';

/**
 * Accessible Button Component
 * Fixes: Buttons must have discernible text, Button type attribute has not been set
 */
export const AccessibleButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  type = 'button',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
          role="img"
          aria-label="Loading"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            className="opacity-25"
          />
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

/**
 * Accessible Form Input Component
 * Fixes: A form field element should have an id or name attribute
 */
export const AccessibleInput = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="Required field">*</span>
          )}
        </label>
      )}
      
      <input
        id={inputId}
        name={name || inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel || label}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-500'
          }
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Accessible Select Component
 */
export const AccessibleSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  ariaLabel,
  className = '',
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="Required field">*</span>
          )}
        </label>
      )}
      
      <select
        id={selectId}
        name={name || selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel || label}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 text-red-900' 
            : 'border-gray-300 text-gray-900'
          }
          ${className}
        `}
        {...props}
      >
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Accessible Icon Button Component
 * For icon-only buttons that need screen reader text
 */
export const AccessibleIconButton = ({
  icon: Icon,
  ariaLabel,
  variant = 'ghost',
  size = 'medium',
  ...props
}) => {
  if (!ariaLabel) {
    console.warn('AccessibleIconButton: ariaLabel is required for screen readers');
  }

  return (
    <AccessibleButton
      variant={variant}
      size={size}
      ariaLabel={ariaLabel}
      {...props}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </AccessibleButton>
  );
};

/**
 * Skip Link Component for keyboard navigation
 */
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-blue-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-white
      "
    >
      {children}
    </a>
  );
};

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleIconButton,
  SkipLink
};
