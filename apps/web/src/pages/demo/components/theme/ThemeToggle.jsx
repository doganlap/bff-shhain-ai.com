import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';

const ThemeToggle = ({ variant = 'button' }) => {
  const { toggleTheme, isDark } = useTheme();

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title={isDark ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5" />
        </motion.div>

        {/* Placeholder to maintain button size */}
        <div className="w-5 h-5 opacity-0">
          <Sun className="w-5 h-5" />
        </div>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        <ArabicTextEngine text="المظهر:" />
      </span>

      <div className="relative bg-gray-200 dark:bg-gray-700 rounded-xl p-1 flex items-center">
        {/* Background slider */}
        <motion.div
          layout
          className="absolute top-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          animate={{
            x: isDark ? 40 : 0
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Light mode button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !isDark && toggleTheme()}
          className={`relative z-10 p-2 rounded-lg transition-colors ${
            !isDark
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          title="الوضع الفاتح"
        >
          <Sun className="w-4 h-4" />
        </motion.button>

        {/* Dark mode button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => isDark && toggleTheme()}
          className={`relative z-10 p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-gray-100'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="الوضع الداكن"
        >
          <Moon className="w-4 h-4" />
        </motion.button>
      </div>

      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isDark ? 'داكن' : 'فاتح'}
      </span>
    </div>
  );
};

export default ThemeToggle;
