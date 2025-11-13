/**
 * Government-Grade Theme Configuration
 * Centralized color and styling constants for consistent theming
 */

export const THEME_COLORS = {
  // Status Colors (Government Standard)
  SUCCESS: {
    light: 'bg-green-100 text-green-800 border-green-200',
    dark: 'bg-green-900 text-green-200 border-green-700',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
    button: 'bg-green-600 hover:bg-green-700'
  },
  
  WARNING: {
    light: 'bg-amber-100 text-amber-800 border-amber-200',
    dark: 'bg-amber-900 text-amber-200 border-amber-700',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    button: 'bg-amber-600 hover:bg-amber-700'
  },
  
  DANGER: {
    light: 'bg-red-100 text-red-800 border-red-200',
    dark: 'bg-red-900 text-red-200 border-red-700',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
    button: 'bg-red-600 hover:bg-red-700'
  },
  
  INFO: {
    light: 'bg-blue-100 text-blue-800 border-blue-200',
    dark: 'bg-blue-900 text-blue-200 border-blue-700',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  
  NEUTRAL: {
    light: 'bg-gray-100 text-gray-800 border-gray-200',
    dark: 'bg-gray-900 text-gray-200 border-gray-700',
    icon: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-800',
    button: 'bg-gray-600 hover:bg-gray-700'
  }
};

export const NOTIFICATION_COLORS = {
  SUCCESS: 'bg-green-50 border-green-200',
  WARNING: 'bg-amber-50 border-amber-200',
  ERROR: 'bg-red-50 border-red-200',
  INFO: 'bg-blue-50 border-blue-200',
  SYSTEM: 'bg-purple-50 border-purple-200'
};

export const GOVERNMENT_BRANDING = {
  PRIMARY: 'text-brand-primary dark:text-brand-secondary',
  ACCENT: 'text-yellow-300 dark:text-yellow-400', // Royal Saudi accent
  BACKGROUND: 'bg-slate-50 dark:bg-slate-900',
  CARD: 'bg-white dark:bg-gray-800',
  BORDER: 'border-gray-200 dark:border-gray-700'
};

export const COMPONENT_SIZES = {
  ICON_SMALL: 'h-4 w-4',
  ICON_MEDIUM: 'h-5 w-5',
  ICON_LARGE: 'h-6 w-6',
  ICON_XLARGE: 'h-8 w-8',
  SPACING_SMALL: 'p-2',
  SPACING_MEDIUM: 'p-4',
  SPACING_LARGE: 'p-6'
};

export const ANIMATION_CLASSES = {
  SPIN: 'animate-spin',
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
  FADE_IN: 'transition-opacity duration-300',
  HOVER_SCALE: 'transform transition-transform hover:scale-105'
};

// RTL Support Classes
export const RTL_CLASSES = {
  TEXT_ALIGN: isRTL => isRTL ? 'text-right' : 'text-left',
  FLEX_DIRECTION: isRTL => isRTL ? 'flex-row-reverse' : 'flex-row',
  MARGIN_LEFT: isRTL => isRTL ? 'mr-' : 'ml-',
  MARGIN_RIGHT: isRTL => isRTL ? 'ml-' : 'mr-'
};