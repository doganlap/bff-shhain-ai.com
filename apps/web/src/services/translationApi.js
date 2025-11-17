/**
 * Translation API Service
 * Handles real-time translation for regulatory content
 * Supports Arabic-English bidirectional translation
 */

import axios from 'axios';
import translationCache from './translationCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const tenantId = localStorage.getItem('tenant_id');
  if (tenantId) {
    config.params = config.params || {};
    config.params.tenant_id = tenantId;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const translationAPI = {
  /**
   * Translate text content with caching
   * @param {string} text - Text to translate
   * @param {string} fromLang - Source language (ar/en)
   * @param {string} toLang - Target language (ar/en)
   * @param {string} context - Context for better translation (regulatory, legal, technical)
   */
  translateText: async (text, fromLang = 'ar', toLang = 'en', context = 'regulatory') => {
    if (!text || fromLang === toLang) {
      return { translated_text: text, confidence: 1, cached: false };
    }

    try {
      // Check cache first
      const cachedTranslation = await translationCache.get(text, fromLang, toLang, context);
      if (cachedTranslation) {
        return { translated_text: cachedTranslation, confidence: 1, cached: true };
      }

      // Perform translation
      const response = await api.post('/translation/text', {
        text,
        from_language: fromLang,
        to_language: toLang,
        context,
        domain: 'grc'
      });
      
      const result = response.data;
      const translatedText = result.translated_text || text;
      
      // Cache the result
      await translationCache.set(text, fromLang, toLang, translatedText, context);
      
      return { ...result, cached: false };
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original text if translation fails
      return { translated_text: text, confidence: 0, error: error.message, cached: false };
    }
  },

  /**
   * Translate regulatory document
   * @param {string} documentId - Document ID
   * @param {string} toLang - Target language
   */
  translateDocument: async (documentId, toLang = 'en') => {
    try {
      const response = await api.post(`/translation/document/${documentId}`, {
        target_language: toLang,
        preserve_formatting: true
      });
      return response.data;
    } catch (error) {
      console.error('Document translation error:', error);
      throw error;
    }
  },

  /**
   * Translate regulatory update/change
   * @param {Object} regulatoryChange - Regulatory change object
   * @param {string} toLang - Target language
   */
  translateRegulatoryChange: async (regulatoryChange, toLang = 'en') => {
    try {
      const fieldsToTranslate = ['title', 'description', 'summary', 'impact_description'];
      const translations = {};

      // Translate each field
      for (const field of fieldsToTranslate) {
        if (regulatoryChange[field]) {
          const result = await translationAPI.translateText(
            regulatoryChange[field],
            'ar',
            toLang,
            'regulatory'
          );
          translations[field] = result.translated_text;
        }
      }

      return {
        ...regulatoryChange,
        translations: {
          [toLang]: translations
        }
      };
    } catch (error) {
      console.error('Regulatory change translation error:', error);
      return regulatoryChange; // Return original if translation fails
    }
  },

  /**
   * Batch translate multiple regulatory items with caching
   * @param {Array} items - Array of regulatory items
   * @param {string} toLang - Target language
   */
  batchTranslate: async (items, toLang = 'en') => {
    if (!items || items.length === 0) return [];

    try {
      // Check cache for each item
      const cacheResults = await Promise.all(
        items.map(async (item) => {
          const text = item.text || item.title || item.description || item.content;
          const cached = await translationCache.get(text, item.from || 'ar', toLang, 'regulatory');
          return cached ? { translated_text: cached, cached: true } : null;
        })
      );

      // Identify items that need translation
      const itemsToTranslate = [];
      const results = [];
      
      items.forEach((item, index) => {
        if (cacheResults[index]) {
          results[index] = cacheResults[index];
        } else {
          itemsToTranslate.push({ ...item, originalIndex: index });
        }
      });

      // Translate uncached items
      if (itemsToTranslate.length > 0) {
        const response = await api.post('/translation/batch', {
          items: itemsToTranslate.map(item => ({
            id: item.id,
            text: item.text || item.title || item.description || item.content,
            context: 'regulatory'
          })),
          target_language: toLang
        });

        const translations = response.data.translations || [];
        
        // Cache new translations and add to results
        await Promise.all(
          itemsToTranslate.map(async (item, index) => {
            const translation = translations[index];
            if (translation) {
              const text = item.text || item.title || item.description || item.content;
              await translationCache.set(text, item.from || 'ar', toLang, translation.translated_text, 'regulatory');
              results[item.originalIndex] = { ...translation, cached: false };
            }
          })
        );
      }

      return results;
    } catch (error) {
      console.error('Batch translation error:', error);
      return items.map(item => ({ 
        translated_text: item.text || item.title || item.description || item.content, 
        cached: false, 
        error: error.message 
      }));
    }
  },

  /**
   * Get cached translation
   * @param {string} text - Original text
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @param {string} context - Translation context
   */
  getCachedTranslation: async (text, fromLang, toLang, context = 'regulatory') => {
    try {
      // Check local cache first
      const localCached = await translationCache.get(text, fromLang, toLang, context);
      if (localCached) {
        return { translated_text: localCached, source: 'local_cache' };
      }

      // Check server cache
      const textHash = translationUtils.hashText(text);
      const response = await api.get('/translation/cache', {
        params: { text_hash: textHash, from_language: fromLang, to_language: toLang }
      });
      
      if (response.data && response.data.translated_text) {
        // Cache locally for future use
        await translationCache.set(text, fromLang, toLang, response.data.translated_text, context);
        return { ...response.data, source: 'server_cache' };
      }
      
      return null;
    } catch (error) {
      // Cache miss is expected, don't log as error
      return null;
    }
  },

  /**
   * Get translation statistics including cache stats
   */
  getTranslationStats: async () => {
    try {
      const [serverStats, cacheStats] = await Promise.all([
        api.get('/translation/stats').then(res => res.data).catch(() => ({ total_translations: 0, cache_hit_rate: 0 })),
        translationCache.getStats()
      ]);
      
      return {
        ...serverStats,
        local_cache: cacheStats
      };
    } catch (error) {
      console.error('Translation stats error:', error);
      return { total_translations: 0, cache_hit_rate: 0, local_cache: { memorySize: 0, dbSize: 0 } };
    }
  },

  /**
   * Detect language of text
   * @param {string} text - Text to analyze
   */
  detectLanguage: async (text) => {
    try {
      const response = await api.post('/translation/detect', { text });
      return response.data;
    } catch (error) {
      console.error('Language detection error:', error);
      // Fallback detection based on Arabic characters
      const arabicRegex = /[\u0600-\u06FF]/;
      return {
        language: arabicRegex.test(text) ? 'ar' : 'en',
        confidence: 0.5
      };
    }
  },

  /**
   * Get supported languages
   */
  getSupportedLanguages: async () => {
    try {
      const response = await api.get('/translation/languages');
      return response.data;
    } catch (error) {
      console.error('Get languages error:', error);
      // Fallback to default supported languages
      return {
        languages: [
          { code: 'ar', name: 'Arabic', name_ar: 'العربية' },
          { code: 'en', name: 'English', name_ar: 'الإنجليزية' }
        ]
      };
    }
  }
};

/**
 * Translation utility functions
 */
/**
 * Clear translation cache
 */
export const clearTranslationCache = async () => {
  await translationCache.clear();
};

/**
 * Clear expired translations
 */
export const clearExpiredTranslations = async () => {
  await translationCache.clearExpired();
};

export const translationUtils = {
  /**
   * Create a simple hash for text caching
   * @param {string} text - Text to hash
   */
  hashText: (text) => {
    let hash = 0;
    if (text.length === 0) return hash;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },

  /**
   * Check if text contains Arabic characters
   * @param {string} text - Text to check
   */
  isArabic: (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  },

  /**
   * Get opposite language
   * @param {string} lang - Current language
   */
  getOppositeLanguage: (lang) => {
    return lang === 'ar' ? 'en' : 'ar';
  },

  /**
   * Format translation confidence as percentage
   * @param {number} confidence - Confidence score (0-1)
   */
  formatConfidence: (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  }
};

export default translationAPI;
