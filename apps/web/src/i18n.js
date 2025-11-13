/**
 * i18n Configuration for GRC Master Application
 * Shahin-AI KSA | شاهين الذكي السعودية
 * 
 * This file initializes the internationalization system
 * and sets up default configurations for Arabic and English support
 */

// Initialize i18n system
console.log('🌍 Initializing i18n system for Shahin-AI KSA');

// Set default language based on browser or localStorage
const getDefaultLanguage = () => {
  // Check localStorage first
  const savedLanguage = localStorage.getItem('grc-language');
  if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Check browser language
  const browserLanguage = navigator.language || navigator.userLanguage;
  if (browserLanguage.startsWith('ar')) {
    return 'ar';
  }
  
  // Default to Arabic for KSA market
  return 'ar';
};

// Set document attributes on initialization
const initializeDocumentAttributes = () => {
  const language = getDefaultLanguage();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  
  // Add CSS class for language-specific styling
  document.documentElement.classList.add(`lang-${language}`);
  document.documentElement.classList.add(`dir-${direction}`);
  
  console.log(`📝 Document initialized with language: ${language}, direction: ${direction}`);
};

// Initialize on load
initializeDocumentAttributes();

// Export configuration
export const i18nConfig = {
  defaultLanguage: getDefaultLanguage(),
  supportedLanguages: ['ar', 'en'],
  fallbackLanguage: 'en',
  rtlLanguages: ['ar']
};

export default i18nConfig;
