/**
 * Interactive Modern Components Library
 * Advanced UI components with animations and interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Check, Search, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

// ============================================
// MODAL COMPONENT
// ============================================

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleOverlayClick}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`
            w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl
            max-h-[90vh] overflow-hidden flex flex-col
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close dialog"
                  type="button"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-auto ${contentClassName}`}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// ============================================
// DROPDOWN COMPONENT
// ============================================

export const Dropdown = ({
  trigger,
  children,
  position = 'bottom-start',
  offset = 8,
  closeOnClick = true,
  className = '',
  contentClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // Calculate dropdown position
  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    const positions = {
      'bottom-start': {
        x: triggerRect.left,
        y: triggerRect.bottom + offset,
      },
      'bottom-end': {
        x: triggerRect.right - contentRect.width,
        y: triggerRect.bottom + offset,
      },
      'top-start': {
        x: triggerRect.left,
        y: triggerRect.top - contentRect.height - offset,
      },
      'top-end': {
        x: triggerRect.right - contentRect.width,
        y: triggerRect.top - contentRect.height - offset,
      },
    };

    const basePosition = positions[position] || positions['bottom-start'];
    
    // Adjust for viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let adjustedPosition = { ...basePosition };

    if (adjustedPosition.x < 0) {
      adjustedPosition.x = 8;
    } else if (adjustedPosition.x + contentRect.width > viewport.width) {
      adjustedPosition.x = viewport.width - contentRect.width - 8;
    }

    if (adjustedPosition.y < 0) {
      adjustedPosition.y = 8;
    } else if (adjustedPosition.y + contentRect.height > viewport.height) {
      adjustedPosition.y = viewport.height - contentRect.height - 8;
    }

    setDropdownPosition(adjustedPosition);
  };

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen, position, offset]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleContentClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  const dropdownContent = isOpen && (
    <AnimatePresence>
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={`
          fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200
          min-w-fit max-w-sm max-h-80 overflow-auto
          ${contentClassName}
        `}
        style={{
          left: dropdownPosition.x,
          top: dropdownPosition.y,
        }}
        onClick={handleContentClick}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className={className}>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {createPortal(dropdownContent, document.body)}
    </div>
  );
};

// ============================================
// SELECT COMPONENT
// ============================================

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  multiple = false,
  disabled = false,
  className = '',
  error = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(option => 
        Array.isArray(value) && value.includes(option.value)
      );
      return selectedOptions.length > 0 
        ? `${selectedOptions.length} selected`
        : placeholder;
    }
    
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-left
        bg-white border rounded-lg transition-colors
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${className}
      `}
      {...props}
    >
      <span className={value ? 'text-gray-900' : 'text-gray-500'}>
        {getDisplayValue()}
      </span>
      <ChevronDown 
        className={`w-4 h-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
  );

  const content = (
    <div className="py-1">
      {searchable && (
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search options..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
      
      <div className="max-h-64 sm:max-h-80 overflow-auto">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500">
            No options found
          </div>
        ) : (
          filteredOptions.map((option) => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`
                  w-full flex items-center px-3 py-2 text-left text-sm
                  hover:bg-gray-100 transition-colors
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                {multiple && (
                  <div className={`
                    w-4 h-4 mr-2 border rounded flex items-center justify-center
                    ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                  `}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                <span className="flex-1">{option.label}</span>
                {!multiple && isSelected && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      isOpen={isOpen}
      onToggle={setIsOpen}
      closeOnClick={!multiple}
      className="relative"
    >
      {content}
    </Dropdown>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================

export const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  icon: CustomIcon,
}) => {
  const types = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
  };

  const config = types[type] || types.info;
  const Icon = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${config.iconColor} hover:opacity-70`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// LOADING SPINNER
// ============================================

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
    green: 'border-green-600',
    red: 'border-red-600',
  };

  return (
    <div
      className={`
        ${sizes[size]} border-2 ${colors[color]} border-t-transparent
        rounded-full animate-spin ${className}
      `}
    />
  );
};

export default {
  Modal,
  Dropdown,
  Select,
  Alert,
  LoadingSpinner,
};
