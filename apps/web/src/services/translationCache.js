/**
 * Translation Cache Service
 * Provides persistent caching for translated content with IndexedDB fallback
 */

class TranslationCache {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemorySize = 1000; // Maximum items in memory cache
    this.dbName = 'GRCTranslationCache';
    this.dbVersion = 1;
    this.storeName = 'translations';
    this.db = null;
    this.initDB();
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  async initDB() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, using memory cache only');
      return;
    }

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            store.createIndex('language', 'language', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    } catch (error) {
      console.error('Failed to initialize translation cache DB:', error);
    }
  }

  /**
   * Generate cache key
   */
  generateKey(text, fromLang, toLang, context = 'regulatory') {
    const hash = this.hashText(text);
    return `${hash}_${fromLang}_${toLang}_${context}`;
  }

  /**
   * Simple hash function for text
   */
  hashText(text) {
    let hash = 0;
    if (text.length === 0) return hash;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get translation from cache
   */
  async get(text, fromLang, toLang, context = 'regulatory') {
    const key = this.generateKey(text, fromLang, toLang, context);
    
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (this.isValid(cached)) {
        return cached.translation;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check IndexedDB
    if (this.db) {
      try {
        const cached = await this.getFromDB(key);
        if (cached && this.isValid(cached)) {
          // Add to memory cache
          this.memoryCache.set(key, cached);
          return cached.translation;
        } else if (cached) {
          // Remove expired entry
          await this.removeFromDB(key);
        }
      } catch (error) {
        console.error('Error reading from translation cache:', error);
      }
    }

    return null;
  }

  /**
   * Store translation in cache
   */
  async set(text, fromLang, toLang, translation, context = 'regulatory', ttl = 24 * 60 * 60 * 1000) {
    const key = this.generateKey(text, fromLang, toLang, context);
    const cacheEntry = {
      key,
      text,
      fromLang,
      toLang,
      context,
      translation,
      timestamp: Date.now(),
      ttl,
      language: toLang
    };

    // Add to memory cache
    this.memoryCache.set(key, cacheEntry);
    
    // Cleanup memory cache if too large
    if (this.memoryCache.size > this.maxMemorySize) {
      this.cleanupMemoryCache();
    }

    // Add to IndexedDB
    if (this.db) {
      try {
        await this.setInDB(cacheEntry);
      } catch (error) {
        console.error('Error writing to translation cache:', error);
      }
    }
  }

  /**
   * Check if cache entry is valid
   */
  isValid(entry) {
    if (!entry || !entry.timestamp || !entry.ttl) return false;
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  /**
   * Get from IndexedDB
   */
  async getFromDB(key) {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set in IndexedDB
   */
  async setInDB(entry) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove from IndexedDB
   */
  async removeFromDB(key) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cleanup memory cache by removing oldest entries
   */
  cleanupMemoryCache() {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    this.memoryCache.clear();
    
    if (this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error clearing translation cache:', error);
      }
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired() {
    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('timestamp');
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const entry = cursor.value;
            if (!this.isValid(entry)) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('Error clearing expired translations:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const memorySize = this.memoryCache.size;
    let dbSize = 0;

    if (this.db) {
      try {
        dbSize = await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.count();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error getting cache stats:', error);
      }
    }

    return {
      memorySize,
      dbSize,
      totalSize: memorySize + dbSize
    };
  }

  /**
   * Batch get multiple translations
   */
  async batchGet(items) {
    const results = [];
    
    for (const item of items) {
      const translation = await this.get(
        item.text,
        item.fromLang || 'ar',
        item.toLang || 'en',
        item.context || 'regulatory'
      );
      results.push(translation);
    }

    return results;
  }

  /**
   * Batch set multiple translations
   */
  async batchSet(items) {
    const promises = items.map(item => 
      this.set(
        item.text,
        item.fromLang || 'ar',
        item.toLang || 'en',
        item.translation,
        item.context || 'regulatory',
        item.ttl
      )
    );

    await Promise.all(promises);
  }
}

// Create singleton instance
const translationCache = new TranslationCache();

export default translationCache;
