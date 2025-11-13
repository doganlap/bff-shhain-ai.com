import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { Bell, Search, User, LogOut, Settings, Globe, Sun, Moon, Grid3X3, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import ModernSlideNavigator from '../navigation/ModernSlideNavigator';

const Header = () => {
  const { state, actions } = useApp();
  const { user, currentTenant, stats } = state;
  const { t, language, changeLanguage, isRTL } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const handleLogout = () => {
    actions.logout();
  };

  return (
    <header 
      className={`glass-header shadow-sm border-b px-6 py-4 ${
        isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}
      dir={isRTL() ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className={`absolute ${isRTL() ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
            <input
              type="text"
              placeholder={t('common.search')}
              className={`w-full ${isRTL() ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Modern Page Navigator Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNavigatorOpen(true)}
            className="p-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg transition-all duration-200 relative group"
            title={language === 'ar' ? 'مستكشف الصفحات المتقدم' : 'Advanced Page Navigator'}
          >
            <Grid3X3 className={`h-5 w-5 ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-white'}`} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Star className="h-2 w-2 text-white" />
            </motion.span>
          </motion.button>

          {/* Compliance Score */}
          <div className={`hidden md:flex items-center ${isRTL() ? 'space-x-reverse' : ''} space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {stats.compliance_score || 87.5}% {t('status.compliant')}
            </span>
          </div>

          {/* Language Toggle */}
          <button 
            onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
            className={`p-2 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
            title={language === 'en' ? 'العربية' : 'English'}
          >
            <Globe className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 ${isDark() ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
            title={isDark ? t('action.switch_to_light') : t('action.switch_to_dark')}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button className={`relative p-2 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Tenant Selector */}
          {currentTenant && (
            <div className={`hidden md:flex items-center ${isRTL() ? 'space-x-reverse' : ''} space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>{t('common.tenant')}:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentTenant.name}</span>
            </div>
          )}

          {/* User Menu */}
          <div className="relative group">
            <button className={`flex items-center ${isRTL() ? 'space-x-reverse' : ''} space-x-2 p-2 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              {user && (
                <div className={`hidden md:block ${isRTL() ? 'text-right' : 'text-left'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name || user.email}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.role || t('role.user')}</p>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute ${isRTL() ? 'left-0' : 'right-0'} mt-2 w-48 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
              <div className="py-1">
                <button className={`flex items-center w-full px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <User className={`h-4 w-4 ${isRTL() ? 'ml-3' : 'mr-3'}`} />
                  {t('nav.profile')}
                </button>
                <button className={`flex items-center w-full px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Settings className={`h-4 w-4 ${isRTL() ? 'ml-3' : 'mr-3'}`} />
                  {t('nav.settings')}
                </button>
                <hr className={`my-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                <button 
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}
                >
                  <LogOut className={`h-4 w-4 ${isRTL() ? 'ml-3' : 'mr-3'}`} />
                  {t('action.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Slide Navigator */}
      <ModernSlideNavigator 
        isOpen={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
      />
    </header>
  );
};

export default Header;
