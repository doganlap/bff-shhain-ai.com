import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizationEngine from '../../services/PersonalizationEngine';
import './CulturalAdaptation.css';

/**
 * Cultural Adaptation Provider
 * Provides cultural context and adaptations throughout the application
 * Features:
 * - Islamic/Arabic cultural elements
 * - Prayer time integration
 * - Hijri calendar support
 * - Cultural color schemes and patterns
 * - Localized number and date formats
 * - Cultural holidays and events
 */

const CulturalContext = createContext();

export const useCultural = () => {
  const context = useContext(CulturalContext);
  if (!context) {
    throw new Error('useCultural must be used within a CulturalAdaptationProvider');
  }
  return context;
};

export const CulturalAdaptationProvider = ({ children }) => {
  const [culturalSettings, setCulturalSettings] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [islamicEvents, setIslamicEvents] = useState([]);
  const [hijriDate, setHijriDate] = useState(null);
  const [personalizationEngine, setPersonalizationEngine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeCulturalAdaptation();
  }, []);

  const initializeCulturalAdaptation = async () => {
    try {
      // Initialize personalization engine
      const engine = new PersonalizationEngine();
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        await engine.initialize(userId);
        setPersonalizationEngine(engine);
        setCulturalSettings(engine.culturalSettings);
        
        // Load cultural data if Arabic/Islamic preferences are enabled
        if (engine.culturalSettings.isArabic) {
          await loadCulturalData(engine);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing cultural adaptation:', error);
      setIsLoading(false);
    }
  };

  const loadCulturalData = async (engine) => {
    try {
      // Load prayer times
      if (engine.preferences.cultural.prayerTimes) {
        const times = await engine.getPrayerTimes();
        setPrayerTimes(times);
      }

      // Load Islamic events
      if (engine.preferences.cultural.islamicEvents) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // Next 3 months
        
        const events = await engine.getCulturalCalendarEvents(startDate, endDate);
        setIslamicEvents(events);
      }

      // Calculate Hijri date
      if (engine.preferences.cultural.calendar === 'hijri' || engine.preferences.cultural.calendar === 'both') {
        const hijri = calculateHijriDate(new Date());
        setHijriDate(hijri);
      }
    } catch (error) {
      console.error('Error loading cultural data:', error);
    }
  };

  const calculateHijriDate = (gregorianDate) => {
    try {
      // Simplified Hijri calculation (in production, use a proper library)
      const hijriEpoch = new Date('622-07-16'); // Approximate Hijri epoch
      const daysDiff = Math.floor((gregorianDate - hijriEpoch) / (1000 * 60 * 60 * 24));
      const hijriYear = Math.floor(daysDiff / 354.37) + 1; // Approximate Hijri year length
      const hijriMonth = Math.floor((daysDiff % 354.37) / 29.53) + 1; // Approximate month length
      const hijriDay = Math.floor((daysDiff % 354.37) % 29.53) + 1;
      
      const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
      ];
      
      return {
        year: hijriYear,
        month: hijriMonth,
        day: hijriDay,
        monthName: hijriMonths[hijriMonth - 1] || hijriMonths[0],
        formatted: `${hijriDay} ${hijriMonths[hijriMonth - 1] || hijriMonths[0]} ${hijriYear}هـ`
      };
    } catch (error) {
      console.error('Error calculating Hijri date:', error);
      return null;
    }
  };

  const formatNumber = (number, useArabicNumerals = null) => {
    const useArabic = useArabicNumerals ?? (culturalSettings?.isArabic && personalizationEngine?.preferences.cultural.numberFormat === 'arabic');
    
    if (useArabic) {
      const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return number.toString().replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
    }
    
    return number.toLocaleString();
  };

  const formatDate = (date, format = 'full') => {
    if (!culturalSettings) return date.toLocaleDateString();
    
    const dateFormat = personalizationEngine?.preferences.cultural.dateFormat;
    const calendar = personalizationEngine?.preferences.cultural.calendar;
    
    if (dateFormat === 'arabic' && culturalSettings.isArabic) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: format === 'full' ? 'long' : undefined
      };
      
      let formatted = date.toLocaleDateString('ar-SA', options);
      
      // Add Hijri date if preferred
      if (calendar === 'hijri' || calendar === 'both') {
        const hijri = calculateHijriDate(date);
        if (calendar === 'hijri') {
          formatted = hijri.formatted;
        } else {
          formatted += ` (${hijri.formatted})`;
        }
      }
      
      return formatted;
    }
    
    return date.toLocaleDateString();
  };

  const getNextPrayerTime = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'الفجر', nameEn: 'Fajr', time: prayerTimes.fajr },
      { name: 'الشروق', nameEn: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'الظهر', nameEn: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'العصر', nameEn: 'Asr', time: prayerTimes.asr },
      { name: 'المغرب', nameEn: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'العشاء', nameEn: 'Isha', time: prayerTimes.isha }
    ];
    
    for (const prayer of prayers) {
      const prayerTime = parseTime(prayer.time);
      if (prayerTime > currentTime) {
        return {
          ...prayer,
          timeRemaining: prayerTime - currentTime
        };
      }
    }
    
    // If no prayer found today, return tomorrow's Fajr
    return {
      ...prayers[0],
      timeRemaining: (24 * 60) - currentTime + parseTime(prayers[0].time),
      isTomorrow: true
    };
  };

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getUpcomingIslamicEvents = (limit = 5) => {
    const now = new Date();
    return islamicEvents
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  };

  const getCulturalGreeting = () => {
    if (!culturalSettings?.isArabic) return 'Welcome';
    
    const hour = new Date().getHours();
    
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  const contextValue = {
    // Settings
    culturalSettings,
    personalizationEngine,
    isLoading,
    
    // Prayer times
    prayerTimes,
    getNextPrayerTime,
    
    // Calendar
    hijriDate,
    islamicEvents,
    getUpcomingIslamicEvents,
    
    // Formatting
    formatNumber,
    formatDate,
    getCulturalGreeting,
    
    // Actions
    updateCulturalSettings: (settings) => {
      setCulturalSettings(prev => ({ ...prev, ...settings }));
    },
    
    refreshCulturalData: () => {
      if (personalizationEngine) {
        loadCulturalData(personalizationEngine);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="cultural-loading">
        <motion.div
          className="cultural-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="islamic-pattern-loader">
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            />
          </svg>
        </motion.div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <CulturalContext.Provider value={contextValue}>
      {children}
      
      {/* Cultural UI Enhancements */}
      {culturalSettings?.isArabic && (
        <CulturalUIEnhancements />
      )}
    </CulturalContext.Provider>
  );
};

// Cultural UI Enhancements Component
const CulturalUIEnhancements = () => {
  const { prayerTimes, getNextPrayerTime, hijriDate, formatDate } = useCultural();
  const [showPrayerNotification, setShowPrayerNotification] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    if (prayerTimes) {
      const prayer = getNextPrayerTime();
      setNextPrayer(prayer);
      
      // Check if prayer time is approaching (within 10 minutes)
      if (prayer && prayer.timeRemaining <= 10) {
        setShowPrayerNotification(true);
      }
    }
  }, [prayerTimes, getNextPrayerTime]);

  return (
    <>
      {/* Prayer Time Notification */}
      <AnimatePresence>
        {showPrayerNotification && nextPrayer && (
          <motion.div
            className="prayer-notification"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="prayer-notification-content">
              <div className="prayer-icon">🕌</div>
              <div className="prayer-info">
                <h4>حان وقت {nextPrayer.name}</h4>
                <p>في {nextPrayer.time}</p>
              </div>
              <button 
                className="prayer-notification-close"
                onClick={() => setShowPrayerNotification(false)}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hijri Date Display */}
      {hijriDate && (
        <motion.div
          className="hijri-date-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="hijri-date">{hijriDate.formatted}</span>
          <span className="gregorian-date">{formatDate(new Date())}</span>
        </motion.div>
      )}

      {/* Islamic Geometric Pattern Overlay */}
      <div className="islamic-pattern-overlay">
        <svg className="pattern-background" viewBox="0 0 400 400">
          <defs>
            <pattern id="islamicGeometry" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <g opacity="0.03">
                <polygon points="20,0 40,20 20,40 0,20" fill="currentColor"/>
                <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </g>
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#islamicGeometry)" />
        </svg>
      </div>
    </>
  );
};

export default CulturalAdaptationProvider;
