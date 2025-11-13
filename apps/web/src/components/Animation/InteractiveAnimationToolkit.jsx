import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, useMotionValue, useTransform } from 'framer-motion';
import './InteractiveAnimationToolkit.css';

/**
 * Advanced Interactive Animation Toolkit
 * Features:
 * - Micro-interactions and hover effects
 * - Gesture-based animations
 * - Physics-based animations
 * - Cultural animation patterns (Arabic/Islamic geometric patterns)
 * - Performance-optimized animations
 * - Accessibility-aware animations
 */

// ==========================================
// ANIMATED BUTTON COMPONENT
// ==========================================
export const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  culturalStyle = 'modern', // 'modern', 'traditional', 'geometric'
  onClick,
  disabled = false,
  loading = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const buttonVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      background: variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff'
    },
    hover: {
      scale: 1, // Disabled hover scaling for enterprise look
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Keep same shadow
      background: variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff', // Keep same background
      transition: { duration: 0.2 }
    },
    pressed: {
      scale: 0.98,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.1 }
    },
    loading: {
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const geometricPattern = culturalStyle === 'geometric' ? (
    <motion.div
      className="geometric-overlay"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 0.1, rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" className="geometric-svg">
        <pattern id="islamicPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" opacity="0.1"/>
        </pattern>
        <rect width="100" height="100" fill="url(#islamicPattern)" />
      </svg>
    </motion.div>
  ) : null;

  return (
    <motion.button
      className={`animated-button ${variant} ${size} ${culturalStyle} ${disabled ? 'disabled' : ''}`}
      variants={buttonVariants}
      initial="idle"
      animate={loading ? "loading" : "idle"}
      whileHover={!disabled && !loading ? "hover" : "idle"}
      whileTap={!disabled && !loading ? "pressed" : "idle"}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {geometricPattern}

      <motion.div className="button-content">
        {loading ? (
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⟳
          </motion.div>
        ) : (
          children
        )}
      </motion.div>

      {culturalStyle === 'traditional' && (
        <motion.div
          className="traditional-border"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};

// ==========================================
// ANIMATED CARD COMPONENT
// ==========================================
export const AnimatedCard = ({
  children,
  hover3D = true,
  culturalPattern = false,
  glowEffect = false,
  className = '',
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: 0, // Disabled hover lift for enterprise look
      scale: 1, // Disabled hover scaling
      transition: { duration: 0.3 }
    }
  };

  const handleMouseMove = (event) => {
    // Disabled 3D effects for enterprise clean look
    return;

    if (!hover3D) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    // Disabled 3D effects for enterprise clean look
    return;

    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`animated-card ${glowEffect ? 'glow' : ''} ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      style={hover3D ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {culturalPattern && (
        <div className="cultural-pattern-overlay">
          <svg className="pattern-svg" viewBox="0 0 200 200">
            <defs>
              <pattern id="arabicPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.05"/>
                <path d="M20,10 L30,20 L20,30 L10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#arabicPattern)" />
          </svg>
        </div>
      )}

      <div className="card-content" style={hover3D ? { transform: "translateZ(50px)" } : {}}>
        {children}
      </div>

      {glowEffect && (
        <motion.div
          className="glow-effect"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

// ==========================================
// ANIMATED LIST COMPONENT
// ==========================================
export const AnimatedList = ({
  items,
  renderItem,
  staggerDelay = 0.1,
  direction = 'up', // 'up', 'down', 'left', 'right'
  culturalAnimation = false
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const getItemVariants = () => {
    const directions = {
      up: { y: 30, x: 0 },
      down: { y: -30, x: 0 },
      left: { x: 30, y: 0 },
      right: { x: -30, y: 0 }
    };

    return {
      hidden: {
        opacity: 0,
        ...directions[direction],
        scale: 0.8
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    };
  };

  const itemVariants = getItemVariants();

  return (
    <motion.div
      className={`animated-list ${culturalAnimation ? 'cultural' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          className="animated-list-item"
          variants={itemVariants}
          whileHover={{
            scale: 1.02,
            x: culturalAnimation ? (index % 2 === 0 ? 5 : -5) : 0,
            transition: { duration: 0.2 }
          }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ==========================================
// FLOATING ACTION BUTTON
// ==========================================
export const FloatingActionButton = ({
  icon,
  onClick,
  position = 'bottom-right',
  culturalStyle = 'modern',
  tooltip = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const fabVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    hover: {
      scale: 1.1,
      rotate: culturalStyle === 'traditional' ? 5 : 0,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
    },
    tap: {
      scale: 0.95,
      rotate: culturalStyle === 'traditional' ? -5 : 0
    },
    expanded: {
      scale: 1.2,
      rotate: 45,
      transition: { duration: 0.3 }
    }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`fab-container ${position}`}>
      {tooltip && (
        <motion.div
          className="fab-tooltip"
          variants={tooltipVariants}
          initial="hidden"
          animate={showTooltip ? "visible" : "hidden"}
        >
          {tooltip}
        </motion.div>
      )}

      <motion.button
        className={`floating-action-button ${culturalStyle}`}
        variants={fabVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        animate={isExpanded ? "expanded" : "idle"}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick && onClick();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          className="fab-icon"
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>

        {culturalStyle === 'geometric' && (
          <motion.div
            className="geometric-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 60 60" className="ring-svg">
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

// ==========================================
// PROGRESS INDICATOR
// ==========================================
export const AnimatedProgress = ({
  progress = 0,
  culturalStyle = 'modern',
  showPercentage = true,
  color = 'primary'
}) => {
  const progressValue = useMotionValue(0);
  const animatedProgress = useTransform(progressValue, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    progressValue.set(progress);
  }, [progress, progressValue]);

  const progressVariants = {
    hidden: { width: "0%" },
    visible: {
      width: animatedProgress,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  return (
    <div className={`animated-progress ${culturalStyle} ${color}`}>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          variants={progressVariants}
          initial="hidden"
          animate="visible"
        />

        {culturalStyle === 'traditional' && (
          <motion.div
            className="traditional-pattern"
            animate={{ x: [-20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 20 10" className="pattern-fill">
              <pattern id="progressPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="5" height="5" fill="currentColor" opacity="0.3"/>
              </pattern>
              <rect width="20" height="10" fill="url(#progressPattern)" />
            </svg>
          </motion.div>
        )}
      </div>

      {showPercentage && (
        <motion.div
          className="progress-percentage"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
};

// ==========================================
// LOADING SPINNER
// ==========================================
export const CulturalLoadingSpinner = ({
  size = 'medium',
  culturalStyle = 'geometric' // 'geometric', 'calligraphy', 'modern'
}) => {
  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    }
  };

  const geometricSpinner = (
    <motion.div
      className="geometric-spinner"
      variants={spinnerVariants}
      animate="spin"
    >
      <svg viewBox="0 0 100 100" className="spinner-svg">
        <polygon
          points="50,10 90,50 50,90 10,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points="50,25 75,50 50,75 25,50"
          fill="currentColor"
          opacity="0.3"
        />
      </svg>
    </motion.div>
  );

  const calligraphySpinner = (
    <motion.div
      className="calligraphy-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" className="spinner-svg">
        <path
          d="M50,20 Q70,30 60,50 Q70,70 50,80 Q30,70 40,50 Q30,30 50,20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );

  const modernSpinner = (
    <motion.div
      className="modern-spinner"
      variants={spinnerVariants}
      animate="spin"
    >
      <div className="spinner-ring"></div>
    </motion.div>
  );

  const spinners = {
    geometric: geometricSpinner,
    calligraphy: calligraphySpinner,
    modern: modernSpinner
  };

  return (
    <div className={`cultural-loading-spinner ${size} ${culturalStyle}`}>
      {spinners[culturalStyle]}
    </div>
  );
};

export default {
  AnimatedButton,
  AnimatedCard,
  AnimatedList,
  FloatingActionButton,
  AnimatedProgress,
  CulturalLoadingSpinner
};
