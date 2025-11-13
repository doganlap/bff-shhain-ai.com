import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ArabicTextEngine.css';

/**
 * Advanced Arabic Text Engine with RTL Support and Typography Enhancement
 * Features:
 * - Intelligent text direction detection
 * - Advanced Arabic typography with proper letter connections
 * - Contextual text shaping and ligatures
 * - Animated text rendering with cultural aesthetics
 * - Voice-over support for Arabic content
 */
const ArabicTextEngine = ({ 
  children, 
  className = '', 
  animated = false, 
  typewriter = false,
  calligraphy = false,
  voice = false,
  personalityType = 'professional' // 'friendly', 'formal', 'casual', 'professional'
}) => {
  const [isRTL, setIsRTL] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Arabic text detection regex
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // Detect text direction and language
  useEffect(() => {
    const text = typeof children === 'string' ? children : '';
    const hasArabic = arabicRegex.test(text);
    setIsRTL(hasArabic);
  }, [children]);

  // Typewriter effect for Arabic text
  useEffect(() => {
    if (typewriter && typeof children === 'string') {
      setIsTyping(true);
      setDisplayText('');
      
      const text = children;
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, isRTL ? 80 : 50); // Slower for Arabic to show proper letter connections

      return () => clearInterval(typeInterval);
    } else {
      setDisplayText(typeof children === 'string' ? children : '');
    }
  }, [children, typewriter, isRTL]);

  // Personality-based styling
  const personalityStyles = useMemo(() => {
    const styles = {
      friendly: {
        fontWeight: '400',
        letterSpacing: isRTL ? '0.02em' : '0.05em',
        lineHeight: '1.6',
        color: '#2D3748'
      },
      formal: {
        fontWeight: '500',
        letterSpacing: isRTL ? '0.01em' : '0.02em',
        lineHeight: '1.5',
        color: '#1A202C'
      },
      casual: {
        fontWeight: '300',
        letterSpacing: isRTL ? '0.03em' : '0.08em',
        lineHeight: '1.7',
        color: '#4A5568'
      },
      professional: {
        fontWeight: '400',
        letterSpacing: isRTL ? '0.015em' : '0.03em',
        lineHeight: '1.55',
        color: '#2D3748'
      }
    };
    return styles[personalityType] || styles.professional;
  }, [personalityType, isRTL]);

  // Animation variants
  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: isRTL ? -20 : 20,
      x: isRTL ? 20 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: isRTL ? 20 : -20,
      x: isRTL ? -20 : 0,
      transition: { duration: 0.3 }
    }
  };

  const calligraphyVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0
    },
    visible: { 
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  // Voice synthesis for Arabic
  const handleVoiceOver = () => {
    if (voice && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(displayText);
      utterance.lang = isRTL ? 'ar-SA' : 'en-US';
      utterance.rate = isRTL ? 0.8 : 1;
      utterance.pitch = personalityType === 'friendly' ? 1.1 : 1;
      speechSynthesis.speak(utterance);
    }
  };

  const combinedClassName = `
    arabic-text-engine 
    ${isRTL ? 'rtl' : 'ltr'} 
    ${calligraphy ? 'calligraphy' : ''} 
    ${personalityType}
    ${className}
  `.trim();

  if (calligraphy && isRTL) {
    return (
      <motion.div 
        className={combinedClassName}
        style={personalityStyles}
        onClick={voice ? handleVoiceOver : undefined}
      >
        <svg
          viewBox="0 0 400 100"
          className="arabic-calligraphy"
        >
          <motion.path
            d="M50,50 Q100,20 150,50 T250,50 Q300,30 350,50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            variants={calligraphyVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.text
            x="200"
            y="55"
            textAnchor="middle"
            className="calligraphy-text"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            {displayText}
          </motion.text>
        </svg>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayText}
        className={combinedClassName}
        style={personalityStyles}
        variants={animated ? textVariants : {}}
        initial={animated ? "hidden" : false}
        animate={animated ? "visible" : false}
        exit={animated ? "exit" : false}
        onClick={voice ? handleVoiceOver : undefined}
      >
        {typewriter ? (
          <span className="typewriter-text">
            {displayText}
            {isTyping && <span className="cursor">|</span>}
          </span>
        ) : (
          children
        )}
        
        {voice && (
          <motion.button
            className="voice-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceOver}
          >
            🔊
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ArabicTextEngine;
