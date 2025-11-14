/**
 * i18n Configuration for GRC Master Application
 * Shahin-AI KSA | شاهين الذكي السعودية
 * 
 * This file initializes the internationalization system
 * and sets up default configurations for Arabic and English support
 */

// Initialize i18n system
console.log('🌍 Initializing i18n system for Shahin-AI KSA');

// Get default language in a way that is safe for Node/Vitest (no window/document)
const getDefaultLanguage = () => {
  // In non-browser environments (SSR, tests), fall back to Arabic
  if (typeof window === 'undefined') {
    return 'ar';
  }

  try {
    // Check localStorage first
    const savedLanguage = window.localStorage.getItem('grc-language');
    if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch (err) {
    console.warn('i18n: unable to access localStorage, falling back to browser language');
  }
  
  try {
    // Check browser language
    const browserLanguage = window.navigator.language || window.navigator.userLanguage;
    if (browserLanguage && browserLanguage.startsWith('ar')) {
      return 'ar';
    }
  } catch (err) {
    console.warn('i18n: unable to read navigator language, falling back to default');
  }
  
  // Default to Arabic for KSA market
  return 'ar';
};

// Set document attributes on initialization (browser only)
const initializeDocumentAttributes = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const language = getDefaultLanguage();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  
  // Add CSS class for language-specific styling
  document.documentElement.classList.add(`lang-${language}`);
  document.documentElement.classList.add(`dir-${direction}`);
  
  console.log(`📝 Document initialized with language: ${language}, direction: ${direction}`);
};

// Initialize on load (browser only)
initializeDocumentAttributes();

// Export configuration
export const i18nConfig = {
  defaultLanguage: getDefaultLanguage(),
  supportedLanguages: ['ar', 'en'],
  fallbackLanguage: 'en',
  rtlLanguages: ['ar']
};

export default i18nConfig;
