/**
 * Translation Hook for Real-time Content Translation
 * Provides caching, batch translation, and real-time translation capabilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { translationAPI, translationUtils } from '../services/translationApi';
import { useI18n } from './useI18n';

export const useTranslation = () => {
  const { language } = useI18n();
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const batchQueue = useRef([]);
  const batchTimer = useRef(null);

  // Clear cache when language changes
  useEffect(() => {
    setCache(new Map());
  }, [language]);

  /**
   * Translate a single text with caching
   */
  const translateText = useCallback(async (text, fromLang = 'ar', toLang = language, context = 'regulatory') => {
    if (!text || fromLang === toLang) return text;

    const cacheKey = `${translationUtils.hashText(text)}_${fromLang}_${toLang}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get cached translation from server
      const cachedResult = await translationAPI.getCachedTranslation(
        translationUtils.hashText(text),
        fromLang,
        toLang
      );

      if (cachedResult && cachedResult.translated_text) {
        const translatedText = cachedResult.translated_text;
        setCache(prev => new Map(prev).set(cacheKey, translatedText));
        return translatedText;
      }

      // Perform new translation
      const result = await translationAPI.translateText(text, fromLang, toLang, context);
      const translatedText = result.translated_text || text;
      
      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, translatedText));
      
      return translatedText;
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message);
      return text; // Return original text on error
    } finally {
      setLoading(false);
    }
  }, [language, cache]);

  /**
   * Translate multiple texts in batch
   */
  const translateBatch = useCallback(async (items, toLang = language) => {
    if (!items || items.length === 0) return items;

    try {
      setLoading(true);
      setError(null);

      const result = await translationAPI.batchTranslate(items, toLang);
      
      // Update cache with results
      if (result.translations) {
        setCache(prev => {
          const newCache = new Map(prev);
          result.translations.forEach((translation, index) => {
            const item = items[index];
            const cacheKey = `${translationUtils.hashText(item.text)}_${item.from || 'ar'}_${toLang}`;
            newCache.set(cacheKey, translation.translated_text);
          });
          return newCache;
        });
      }

      return result.translations || items;
    } catch (err) {
      console.error('Batch translation error:', err);
      setError(err.message);
      return items; // Return original items on error
    } finally {
      setLoading(false);
    }
  }, [language]);

  /**
   * Queue text for batch translation (debounced)
   */
  const queueForTranslation = useCallback((text, callback, fromLang = 'ar', toLang = language) => {
    const cacheKey = `${translationUtils.hashText(text)}_${fromLang}_${toLang}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      callback(cache.get(cacheKey));
      return;
    }

    // Add to batch queue
    batchQueue.current.push({
      text,
      callback,
      fromLang,
      toLang,
      cacheKey
    });

    // Clear existing timer
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    // Set new timer for batch processing
    batchTimer.current = setTimeout(async () => {
      const queue = [...batchQueue.current];
      batchQueue.current = [];

      if (queue.length === 0) return;

      try {
        const items = queue.map(item => ({
          text: item.text,
          from: item.fromLang,
          context: 'regulatory'
        }));

        const translations = await translateBatch(items, toLang);
        
        // Execute callbacks with results
        queue.forEach((item, index) => {
          const translatedText = translations[index]?.translated_text || item.text;
          item.callback(translatedText);
          
          // Update cache
          setCache(prev => new Map(prev).set(item.cacheKey, translatedText));
        });
      } catch (err) {
        console.error('Batch queue processing error:', err);
        // Execute callbacks with original text on error
        queue.forEach(item => item.callback(item.text));
      }
    }, 500); // 500ms debounce
  }, [language, cache, translateBatch]);

  /**
   * Translate regulatory change object
   */
  const translateRegulatoryChange = useCallback(async (change, toLang = language) => {
    if (!change) return change;

    try {
      const result = await translationAPI.translateRegulatoryChange(change, toLang);
      return result;
    } catch (err) {
      console.error('Regulatory change translation error:', err);
      return change;
    }
  }, [language]);

  /**
   * Detect language of text
   */
  const detectLanguage = useCallback(async (text) => {
    try {
      const result = await translationAPI.detectLanguage(text);
      return result;
    } catch (err) {
      console.error('Language detection error:', err);
      return { language: translationUtils.isArabic(text) ? 'ar' : 'en', confidence: 0.5 };
    }
  }, []);

  /**
   * Clear translation cache
   */
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }, [cache]);

  /**
   * Preload translations for common terms
   */
  const preloadTranslations = useCallback(async (terms, fromLang = 'ar', toLang = language) => {
    const items = terms.map(term => ({
      text: term,
      from: fromLang,
      context: 'regulatory'
    }));

    await translateBatch(items, toLang);
  }, [language, translateBatch]);

  return {
    translateText,
    translateBatch,
    queueForTranslation,
    translateRegulatoryChange,
    detectLanguage,
    clearCache,
    getCacheStats,
    preloadTranslations,
    loading,
    error,
    cacheSize: cache.size
  };
};

export default useTranslation;
