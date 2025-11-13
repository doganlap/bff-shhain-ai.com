/**
 * Advanced Personalization Engine
 * Features:
 * - User behavior analysis and learning
 * - Cultural adaptation (Arabic/Islamic preferences)
 * - Dynamic UI customization
 * - Intelligent content recommendations
 * - Accessibility preferences
 * - Performance optimization based on usage patterns
 */

class PersonalizationEngine {
  constructor() {
    this.userId = null;
    this.userProfile = null;
    this.preferences = null;
    this.behaviorData = new Map();
    this.culturalSettings = null;
    this.isInitialized = false;
    
    // Default preferences
    this.defaultPreferences = {
      language: 'en',
      theme: 'light',
      culturalStyle: 'modern',
      animationLevel: 'normal', // 'minimal', 'normal', 'enhanced'
      density: 'comfortable', // 'compact', 'comfortable', 'spacious'
      notifications: {
        frequency: 'normal',
        channels: ['in_app', 'email'],
        quietHours: { start: 22, end: 7 }
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        screenReader: false
      },
      cultural: {
        calendar: 'gregorian', // 'gregorian', 'hijri', 'both'
        numberFormat: 'western', // 'western', 'arabic'
        dateFormat: 'western', // 'western', 'arabic'
        prayerTimes: false,
        islamicEvents: false
      },
      dashboard: {
        layout: 'default',
        widgets: [],
        compactMode: false
      },
      workflow: {
        autoSave: true,
        confirmations: true,
        shortcuts: true,
        bulkActions: false
      }
    };
  }

  /**
   * Initialize personalization engine for user
   */
  async initialize(userId) {
    try {
      this.userId = userId;
      
      // Load user profile and preferences
      await this.loadUserProfile();
      await this.loadUserPreferences();
      await this.loadBehaviorData();
      await this.detectCulturalContext();
      
      // Apply initial personalization
      await this.applyPersonalization();
      
      // Start behavior tracking
      this.startBehaviorTracking();
      
      this.isInitialized = true;
      console.log('🎯 Personalization Engine initialized for user:', userId);
      
      return this;
    } catch (error) {
      console.error('❌ Failed to initialize Personalization Engine:', error);
      throw error;
    }
  }

  /**
   * Load user profile data
   */
  async loadUserProfile() {
    try {
      const response = await fetch(`/api/users/${this.userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.userProfile = await response.json();
      } else {
        console.warn('Could not load user profile, using defaults');
        this.userProfile = { role: 'user', experience_level: 'intermediate' };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userProfile = { role: 'user', experience_level: 'intermediate' };
    }
  }

  /**
   * Load user preferences
   */
  async loadUserPreferences() {
    try {
      const response = await fetch(`/api/users/${this.userId}/preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const savedPreferences = await response.json();
        this.preferences = { ...this.defaultPreferences, ...savedPreferences };
      } else {
        this.preferences = { ...this.defaultPreferences };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      this.preferences = { ...this.defaultPreferences };
    }
  }

  /**
   * Load user behavior data
   */
  async loadBehaviorData() {
    try {
      const response = await fetch(`/api/users/${this.userId}/behavior-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const behaviorData = await response.json();
        this.processBehaviorData(behaviorData);
      }
    } catch (error) {
      console.error('Error loading behavior data:', error);
    }
  }

  /**
   * Detect cultural context from browser and user data
   */
  async detectCulturalContext() {
    const browserLang = navigator.language || navigator.userLanguage;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    
    this.culturalSettings = {
      browserLanguage: browserLang,
      timezone: timezone,
      isRTL: rtlLanguages.some(lang => browserLang.startsWith(lang)),
      isArabic: browserLang.startsWith('ar'),
      region: this.detectRegion(timezone),
      calendar: this.detectPreferredCalendar(browserLang, timezone)
    };

    // Auto-adjust preferences based on cultural context
    if (this.culturalSettings.isArabic) {
      this.preferences.language = 'ar';
      this.preferences.cultural.calendar = 'hijri';
      this.preferences.cultural.numberFormat = 'arabic';
      this.preferences.cultural.dateFormat = 'arabic';
      this.preferences.cultural.islamicEvents = true;
      
      // Check if user is in a region where prayer times are relevant
      if (this.isMuslimMajorityRegion(this.culturalSettings.region)) {
        this.preferences.cultural.prayerTimes = true;
      }
    }
  }

  /**
   * Apply personalization to the UI
   */
  async applyPersonalization() {
    try {
      // Apply theme and visual preferences
      this.applyTheme();
      this.applyLanguage();
      this.applyCulturalStyles();
      this.applyAccessibilitySettings();
      this.applyAnimationPreferences();
      this.applyLayoutPreferences();
      
      // Customize dashboard
      await this.customizeDashboard();
      
      // Setup intelligent notifications
      this.setupIntelligentNotifications();
      
      console.log('✅ Personalization applied successfully');
    } catch (error) {
      console.error('❌ Error applying personalization:', error);
    }
  }

  /**
   * Apply theme preferences
   */
  applyTheme() {
    const root = document.documentElement;
    const theme = this.preferences.theme;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    root.classList.add(`theme-${theme}`);
    
    // Apply cultural color schemes
    if (this.culturalSettings.isArabic) {
      root.classList.add('cultural-arabic');
      
      // Apply Islamic-inspired color palette if preferred
      if (this.preferences.culturalStyle === 'traditional') {
        root.style.setProperty('--primary-color', '#2D5016'); // Islamic green
        root.style.setProperty('--secondary-color', '#8B4513'); // Traditional brown
        root.style.setProperty('--accent-color', '#DAA520'); // Gold accent
      }
    }
    
    // Apply density preferences
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    root.classList.add(`density-${this.preferences.density}`);
  }

  /**
   * Apply language preferences
   */
  applyLanguage() {
    const html = document.documentElement;
    const lang = this.preferences.language;
    
    html.setAttribute('lang', lang);
    html.setAttribute('dir', this.culturalSettings.isRTL ? 'rtl' : 'ltr');
    
    // Load appropriate fonts
    this.loadCulturalFonts(lang);
    
    // Update page title and meta tags
    this.updatePageMetadata(lang);
  }

  /**
   * Apply cultural styles
   */
  applyCulturalStyles() {
    const root = document.documentElement;
    const culturalStyle = this.preferences.culturalStyle;
    
    // Remove existing cultural classes
    root.classList.remove('cultural-modern', 'cultural-traditional', 'cultural-geometric');
    root.classList.add(`cultural-${culturalStyle}`);
    
    // Apply Islamic geometric patterns if preferred
    if (culturalStyle === 'geometric' && this.culturalSettings.isArabic) {
      this.enableGeometricPatterns();
    }
    
    // Apply traditional Islamic UI elements
    if (culturalStyle === 'traditional' && this.culturalSettings.isArabic) {
      this.enableTraditionalElements();
    }
  }

  /**
   * Apply accessibility settings
   */
  applyAccessibilitySettings() {
    const root = document.documentElement;
    const a11y = this.preferences.accessibility;
    
    // High contrast mode
    if (a11y.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (a11y.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    root.classList.add(`font-${a11y.fontSize}`);
    
    // Screen reader optimizations
    if (a11y.screenReader) {
      root.classList.add('screen-reader-optimized');
      this.enhanceScreenReaderSupport();
    }
  }

  /**
   * Apply animation preferences
   */
  applyAnimationPreferences() {
    const root = document.documentElement;
    const animationLevel = this.preferences.animationLevel;
    
    root.classList.remove('animation-minimal', 'animation-normal', 'animation-enhanced');
    root.classList.add(`animation-${animationLevel}`);
    
    // Set CSS custom properties for animation durations
    const durations = {
      minimal: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
      normal: { fast: '0.2s', normal: '0.3s', slow: '0.5s' },
      enhanced: { fast: '0.3s', normal: '0.5s', slow: '0.8s' }
    };
    
    const duration = durations[animationLevel];
    root.style.setProperty('--animation-fast', duration.fast);
    root.style.setProperty('--animation-normal', duration.normal);
    root.style.setProperty('--animation-slow', duration.slow);
  }

  /**
   * Apply layout preferences
   */
  applyLayoutPreferences() {
    const root = document.documentElement;
    
    // Sidebar preferences
    if (this.behaviorData.has('sidebarCollapsed')) {
      const isCollapsed = this.behaviorData.get('sidebarCollapsed');
      root.classList.toggle('sidebar-collapsed', isCollapsed);
    }
    
    // Panel preferences
    if (this.behaviorData.has('panelLayout')) {
      const layout = this.behaviorData.get('panelLayout');
      root.classList.add(`panel-layout-${layout}`);
    }
  }

  /**
   * Customize dashboard based on user behavior and preferences
   */
  async customizeDashboard() {
    try {
      // Analyze user's most used features
      const mostUsedFeatures = this.analyzeMostUsedFeatures();
      
      // Recommend dashboard widgets
      const recommendedWidgets = this.recommendDashboardWidgets(mostUsedFeatures);
      
      // Apply intelligent layout
      const optimizedLayout = this.optimizeDashboardLayout(recommendedWidgets);
      
      // Update dashboard configuration
      await this.updateDashboardConfig(optimizedLayout);
      
    } catch (error) {
      console.error('Error customizing dashboard:', error);
    }
  }

  /**
   * Setup intelligent notifications based on user behavior
   */
  setupIntelligentNotifications() {
    // Analyze notification engagement patterns
    const engagementData = this.behaviorData.get('notificationEngagement') || {};
    
    // Adjust notification frequency
    if (engagementData.readRate < 0.3) {
      this.preferences.notifications.frequency = 'reduced';
    } else if (engagementData.readRate > 0.8) {
      this.preferences.notifications.frequency = 'enhanced';
    }
    
    // Optimize notification timing
    const optimalHours = this.calculateOptimalNotificationHours(engagementData);
    if (optimalHours.length > 0) {
      this.preferences.notifications.optimalHours = optimalHours;
    }
    
    // Cultural notification preferences
    if (this.culturalSettings.isArabic && this.preferences.cultural.prayerTimes) {
      this.setupPrayerTimeNotifications();
    }
  }

  /**
   * Start behavior tracking
   */
  startBehaviorTracking() {
    // Track page views and time spent
    this.trackPageViews();
    
    // Track feature usage
    this.trackFeatureUsage();
    
    // Track interaction patterns
    this.trackInteractionPatterns();
    
    // Track performance preferences
    this.trackPerformancePreferences();
    
    // Save behavior data periodically
    setInterval(() => {
      this.saveBehaviorData();
    }, 60000); // Save every minute
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(context = 'general') {
    const recommendations = [];
    
    switch (context) {
      case 'dashboard':
        recommendations.push(...this.getDashboardRecommendations());
        break;
      case 'workflow':
        recommendations.push(...this.getWorkflowRecommendations());
        break;
      case 'features':
        recommendations.push(...this.getFeatureRecommendations());
        break;
      default:
        recommendations.push(...this.getGeneralRecommendations());
    }
    
    return recommendations;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(newPreferences) {
    try {
      // Merge with existing preferences
      this.preferences = { ...this.preferences, ...newPreferences };
      
      // Save to backend
      await this.saveUserPreferences();
      
      // Re-apply personalization
      await this.applyPersonalization();
      
      console.log('✅ Preferences updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Get cultural calendar events
   */
  async getCulturalCalendarEvents(startDate, endDate) {
    if (!this.preferences.cultural.islamicEvents) {
      return [];
    }
    
    try {
      const response = await fetch('/api/cultural/islamic-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading cultural events:', error);
    }
    
    return [];
  }

  /**
   * Get prayer times for user's location
   */
  async getPrayerTimes(date = new Date()) {
    if (!this.preferences.cultural.prayerTimes) {
      return null;
    }
    
    try {
      const position = await this.getUserLocation();
      const response = await fetch('/api/cultural/prayer-times', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date.toISOString(),
          latitude: position.latitude,
          longitude: position.longitude
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
    }
    
    return null;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  detectRegion(timezone) {
    const middleEastTimezones = [
      'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Qatar',
      'Asia/Bahrain', 'Asia/Baghdad', 'Asia/Tehran', 'Asia/Damascus'
    ];
    
    if (middleEastTimezones.includes(timezone)) {
      return 'middle_east';
    }
    
    return 'other';
  }

  detectPreferredCalendar(language, timezone) {
    if (language.startsWith('ar') && this.isMuslimMajorityRegion(this.detectRegion(timezone))) {
      return 'hijri';
    }
    return 'gregorian';
  }

  isMuslimMajorityRegion(region) {
    return region === 'middle_east';
  }

  loadCulturalFonts(language) {
    if (language === 'ar') {
      // Load Arabic fonts
      const arabicFonts = [
        'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
        'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
      ];
      
      arabicFonts.forEach(fontUrl => {
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = fontUrl;
          document.head.appendChild(link);
        }
      });
    }
  }

  updatePageMetadata(language) {
    // Update page title based on language
    const titleElement = document.querySelector('title');
    if (titleElement && language === 'ar') {
      // Add RTL mark to title for proper display
      titleElement.textContent = '\u202B' + titleElement.textContent;
    }
  }

  enableGeometricPatterns() {
    document.body.classList.add('geometric-patterns-enabled');
  }

  enableTraditionalElements() {
    document.body.classList.add('traditional-elements-enabled');
  }

  enhanceScreenReaderSupport() {
    // Add additional ARIA labels and descriptions
    const elements = document.querySelectorAll('[data-enhance-sr]');
    elements.forEach(element => {
      if (!element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', element.dataset.enhanceSr);
      }
    });
  }

  processBehaviorData(data) {
    // Process and store behavior analytics
    if (data.pageViews) {
      this.behaviorData.set('pageViews', data.pageViews);
    }
    
    if (data.featureUsage) {
      this.behaviorData.set('featureUsage', data.featureUsage);
    }
    
    if (data.interactionPatterns) {
      this.behaviorData.set('interactionPatterns', data.interactionPatterns);
    }
    
    if (data.notificationEngagement) {
      this.behaviorData.set('notificationEngagement', data.notificationEngagement);
    }
  }

  analyzeMostUsedFeatures() {
    const featureUsage = this.behaviorData.get('featureUsage') || {};
    return Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([feature]) => feature);
  }

  recommendDashboardWidgets(mostUsedFeatures) {
    const widgetMap = {
      'assessments': 'assessment-summary',
      'organizations': 'organization-overview',
      'compliance': 'compliance-status',
      'reports': 'recent-reports',
      'notifications': 'notification-center',
      'analytics': 'analytics-dashboard'
    };
    
    return mostUsedFeatures
      .map(feature => widgetMap[feature])
      .filter(widget => widget);
  }

  optimizeDashboardLayout(widgets) {
    // Create optimized layout based on user preferences and screen size
    const layout = {
      columns: this.preferences.dashboard.compactMode ? 2 : 3,
      widgets: widgets.map((widget, index) => ({
        id: widget,
        position: { x: index % 3, y: Math.floor(index / 3) }
      }))
    };
    
    return layout;
  }

  async updateDashboardConfig(layout) {
    try {
      await fetch(`/api/users/${this.userId}/dashboard-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(layout)
      });
    } catch (error) {
      console.error('Error updating dashboard config:', error);
    }
  }

  calculateOptimalNotificationHours(engagementData) {
    // Analyze when user is most likely to engage with notifications
    const hourlyEngagement = engagementData.hourlyEngagement || {};
    return Object.entries(hourlyEngagement)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([hour]) => parseInt(hour));
  }

  setupPrayerTimeNotifications() {
    // Setup notifications for prayer times
    if ('Notification' in window && Notification.permission === 'granted') {
      // Implementation would depend on prayer time API
      console.log('Prayer time notifications enabled');
    }
  }

  trackPageViews() {
    // Track page navigation
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.recordPageView(window.location.pathname, entry.duration);
        }
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
  }

  trackFeatureUsage() {
    // Track clicks on major features
    document.addEventListener('click', (event) => {
      const feature = event.target.closest('[data-feature]');
      if (feature) {
        this.recordFeatureUsage(feature.dataset.feature);
      }
    });
  }

  trackInteractionPatterns() {
    // Track user interaction patterns
    let interactionCount = 0;
    let sessionStart = Date.now();
    
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        interactionCount++;
        if (interactionCount % 10 === 0) {
          this.recordInteractionPattern({
            type: 'interaction_burst',
            count: interactionCount,
            duration: Date.now() - sessionStart
          });
        }
      });
    });
  }

  trackPerformancePreferences() {
    // Track performance-related preferences
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      this.recordPerformanceContext({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }
  }

  recordPageView(path, duration) {
    const pageViews = this.behaviorData.get('pageViews') || {};
    pageViews[path] = (pageViews[path] || 0) + 1;
    this.behaviorData.set('pageViews', pageViews);
  }

  recordFeatureUsage(feature) {
    const featureUsage = this.behaviorData.get('featureUsage') || {};
    featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    this.behaviorData.set('featureUsage', featureUsage);
  }

  recordInteractionPattern(pattern) {
    const patterns = this.behaviorData.get('interactionPatterns') || [];
    patterns.push({ ...pattern, timestamp: Date.now() });
    this.behaviorData.set('interactionPatterns', patterns.slice(-100)); // Keep last 100
  }

  recordPerformanceContext(context) {
    this.behaviorData.set('performanceContext', context);
  }

  async saveBehaviorData() {
    try {
      const behaviorObject = Object.fromEntries(this.behaviorData);
      await fetch(`/api/users/${this.userId}/behavior-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(behaviorObject)
      });
    } catch (error) {
      console.error('Error saving behavior data:', error);
    }
  }

  async saveUserPreferences() {
    try {
      await fetch(`/api/users/${this.userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.preferences)
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => reject(error),
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  getDashboardRecommendations() {
    return [
      {
        type: 'widget',
        title: 'Add Quick Actions Widget',
        description: 'Based on your usage, you might find quick actions helpful',
        action: 'add_quick_actions_widget'
      }
    ];
  }

  getWorkflowRecommendations() {
    return [
      {
        type: 'shortcut',
        title: 'Enable Keyboard Shortcuts',
        description: 'Speed up your workflow with keyboard shortcuts',
        action: 'enable_shortcuts'
      }
    ];
  }

  getFeatureRecommendations() {
    return [
      {
        type: 'feature',
        title: 'Try Bulk Actions',
        description: 'Process multiple items at once',
        action: 'explore_bulk_actions'
      }
    ];
  }

  getGeneralRecommendations() {
    const recommendations = [];
    
    if (this.culturalSettings.isArabic && this.preferences.culturalStyle === 'modern') {
      recommendations.push({
        type: 'cultural',
        title: 'Try Traditional Islamic Style',
        description: 'Experience a more traditional interface design',
        action: 'switch_to_traditional_style'
      });
    }
    
    return recommendations;
  }
}

export default PersonalizationEngine;
