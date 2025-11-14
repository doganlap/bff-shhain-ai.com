import { useEffect, useRef, useState } from 'react';

const AutoScroll = () => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const autoScrollTimer = useRef(null);
  const userInteractionTimer = useRef(null);

  const sections = [
    'hero',
    'trust',
    'vision',
    'interactive-3d-cards',
    'ai-team',
    'competitive-advantage',
    'target-sectors',
    'frameworks',
    'dashboard',
    'platform-demo',
    'faq'
  ];

  const smoothScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleUserInteraction = () => {
    // Stop auto-scroll when user interacts
    setIsAutoScrolling(false);
    
    // Clear existing timers
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
    if (userInteractionTimer.current) {
      clearTimeout(userInteractionTimer.current);
    }
  };

  useEffect(() => {
    // Start auto-scroll after 3 seconds
    const startTimer = setTimeout(() => {
      if (isAutoScrolling) {
        autoScrollToNextSection();
      }
    }, 3000);

    // Listen for user interactions
    const events = ['wheel', 'touchstart', 'mousedown', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      clearTimeout(startTimer);
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
      if (userInteractionTimer.current) {
        clearTimeout(userInteractionTimer.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  const autoScrollToNextSection = () => {
    if (!isAutoScrolling) return;

    setCurrentSection(prev => {
      const nextSection = (prev + 1) % sections.length;
      smoothScrollToSection(sections[nextSection]);
      
      // Schedule next scroll (8 seconds per section)
      autoScrollTimer.current = setTimeout(() => {
        if (isAutoScrolling) {
          autoScrollToNextSection();
        }
      }, 8000);
      
      return nextSection;
    });
  };

  useEffect(() => {
    if (isAutoScrolling && currentSection === 0) {
      // Start the auto-scroll cycle
      autoScrollTimer.current = setTimeout(() => {
        autoScrollToNextSection();
      }, 3000);
    }

    return () => {
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
    };
  }, [isAutoScrolling]);

  return null; // This component doesn't render anything
};

export default AutoScroll;
