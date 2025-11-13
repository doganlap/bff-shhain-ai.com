import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('dogan-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      // Update CSS variables for dark mode
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#262626');
      root.style.setProperty('--bg-tertiary', '#404040');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--border-color-light', '#4b5563');
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--brand-primary', '#3b82f6');
      root.style.setProperty('--brand-secondary', '#1e40af');
    } else {
      root.classList.remove('dark');
      // Reset CSS variables for light mode
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--bg-tertiary', '#f3f4f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#374151');
      root.style.setProperty('--text-muted', '#6b7280');
      root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--border-color-light', '#f3f4f6');
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--brand-primary', '#2563eb');
      root.style.setProperty('--brand-secondary', '#1d4ed8');
    }

    // Save theme to localStorage
    localStorage.setItem('dogan-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
