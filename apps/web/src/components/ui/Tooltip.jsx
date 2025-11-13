/**
 * Tooltip Component System
 * Provides accessible tooltips with multiple positioning options
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Tooltip positioning utilities
const getTooltipPosition = (triggerRect, tooltipRect, position, offset = 8) => {
  const positions = {
    top: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.top - tooltipRect.height - offset,
    },
    bottom: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.bottom + offset,
    },
    left: {
      x: triggerRect.left - tooltipRect.width - offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
    right: {
      x: triggerRect.right + offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
    'top-start': {
      x: triggerRect.left,
      y: triggerRect.top - tooltipRect.height - offset,
    },
    'top-end': {
      x: triggerRect.right - tooltipRect.width,
      y: triggerRect.top - tooltipRect.height - offset,
    },
    'bottom-start': {
      x: triggerRect.left,
      y: triggerRect.bottom + offset,
    },
    'bottom-end': {
      x: triggerRect.right - tooltipRect.width,
      y: triggerRect.bottom + offset,
    },
  };

  return positions[position] || positions.top;
};

// Ensure tooltip stays within viewport
const adjustPositionForViewport = (position, tooltipRect) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const adjusted = { ...position };

  // Adjust horizontal position
  if (adjusted.x < 0) {
    adjusted.x = 8;
  } else if (adjusted.x + tooltipRect.width > viewport.width) {
    adjusted.x = viewport.width - tooltipRect.width - 8;
  }

  // Adjust vertical position
  if (adjusted.y < 0) {
    adjusted.y = 8;
  } else if (adjusted.y + tooltipRect.height > viewport.height) {
    adjusted.y = viewport.height - tooltipRect.height - 8;
  }

  return adjusted;
};

// Main Tooltip Component
export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 500,
  offset = 8,
  disabled = false,
  className = '',
  contentClassName = '',
  arrow = true,
  trigger = 'hover', // 'hover', 'click', 'focus'
  maxWidth = 'auto',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Calculate tooltip position
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const basePosition = getTooltipPosition(triggerRect, tooltipRect, position, offset);
    const adjustedPosition = adjustPositionForViewport(basePosition, tooltipRect);
    
    setTooltipPosition(adjustedPosition);
  };

  // Show tooltip with delay
  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip immediately
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Handle click trigger
  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      // Update position on scroll/resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible, position, offset]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Event handlers based on trigger type
  const triggerProps = {
    ref: triggerRef,
    onClick: handleClick,
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    }),
    ...(trigger === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip,
    }),
  };

  // Arrow component
  const Arrow = ({ position: arrowPosition }) => {
    const arrowClasses = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
      left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
      right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900',
      'top-start': 'bottom-[-4px] left-3 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
      'top-end': 'bottom-[-4px] right-3 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
      'bottom-start': 'top-[-4px] left-3 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
      'bottom-end': 'top-[-4px] right-3 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
    };

    return (
      <div 
        className={`absolute w-0 h-0 ${arrowClasses[arrowPosition] || arrowClasses.top}`}
      />
    );
  };

  // Tooltip content
  const tooltipContent = (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`
        fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
        pointer-events-none select-none max-w-xs w-auto
        ${contentClassName}
      `}
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        ...(maxWidth !== 'auto' && { maxWidth: maxWidth }),
      }}
      {...props}
    >
      {content}
      {arrow && <Arrow position={position} />}
    </motion.div>
  );

  return (
    <>
      <div className={className} {...triggerProps}>
        {children}
      </div>
      
      {isVisible && createPortal(
        <AnimatePresence>
          {tooltipContent}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

// Specialized tooltip variants
export const InfoTooltip = ({ children, ...props }) => (
  <Tooltip
    contentClassName="bg-blue-600 text-white"
    {...props}
  >
    {children}
  </Tooltip>
);

export const WarningTooltip = ({ children, ...props }) => (
  <Tooltip
    contentClassName="bg-yellow-600 text-white"
    {...props}
  >
    {children}
  </Tooltip>
);

export const ErrorTooltip = ({ children, ...props }) => (
  <Tooltip
    contentClassName="bg-red-600 text-white"
    {...props}
  >
    {children}
  </Tooltip>
);

export const SuccessTooltip = ({ children, ...props }) => (
  <Tooltip
    contentClassName="bg-green-600 text-white"
    {...props}
  >
    {children}
  </Tooltip>
);

// Tooltip with rich content support
export const RichTooltip = ({ 
  children, 
  title, 
  description, 
  actions,
  ...props 
}) => {
  const content = (
    <div className="space-y-2">
      {title && (
        <div className="font-semibold text-white">{title}</div>
      )}
      {description && (
        <div className="text-sm text-gray-200">{description}</div>
      )}
      {actions && (
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={content}
      maxWidth="auto"
      contentClassName="bg-gray-800 text-white p-4 max-w-sm"
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default Tooltip;
