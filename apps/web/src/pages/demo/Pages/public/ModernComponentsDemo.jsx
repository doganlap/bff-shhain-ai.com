/**
 * Modern Components Demo Page
 * Showcases all the new i18n, RTL, tooltip, and interactive components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Moon, Sun, Info, AlertTriangle, CheckCircle, XCircle,
  Settings, User, Mail, Clock, Star,
  Zap, Shield, Activity
} from 'lucide-react';

// Import our new components
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';
import { Tooltip, InfoTooltip, WarningTooltip, ErrorTooltip, RichTooltip } from '../../components/ui/Tooltip';
import { Modal, Dropdown, Select, Alert, LoadingSpinner } from '../../components/ui/InteractiveComponents';

const ModernComponentsDemo = () => {
  const { t, language, changeLanguage, isRTL } = useI18n();
  const { toggleTheme, isDark } = useTheme();
  
  // Demo state
  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState([]);
  const [alertVisible, setAlertVisible] = useState(true);

  // Demo data
  const selectOptions = [
    { value: 'iso27001', label: 'ISO 27001 - Information Security' },
    { value: 'nist', label: 'NIST Cybersecurity Framework' },
    { value: 'sama', label: 'SAMA Cybersecurity Controls' },
    { value: 'pci', label: 'PCI DSS - Payment Card Industry' },
    { value: 'gdpr', label: 'GDPR - Data Protection' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${
      isDark() ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`} dir={isRTL() ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('nav.components_demo') || 'Modern Components Demo'}
            </h1>
            <p className={`text-lg ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Showcase of i18n, RTL, tooltips, and interactive components
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <Tooltip content="Switch Language" position="bottom">
              <button
                onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                className={`p-3 rounded-lg transition-colors ${
                  isDark() ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                } shadow-lg`}
              >
                <Globe className="h-5 w-5" />
              </button>
            </Tooltip>
            
            {/* Theme Switcher */}
            <Tooltip content={isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="bottom">
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-colors ${
                  isDark() ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                } shadow-lg`}
              >
                {isDark() ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </Tooltip>
          </div>
        </div>
        
        {/* Current Settings Display */}
        <div className={`p-4 rounded-lg ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Language:</span> {language === 'en' ? 'English' : 'العربية'}
            </div>
            <div>
              <span className="font-medium">Direction:</span> {isRTL() ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)'}
            </div>
            <div>
              <span className="font-medium">Theme:</span> {isDark() ? 'Dark Mode' : 'Light Mode'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demo Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tooltip Demos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl shadow-lg ${isDark() ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Tooltip Components
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Tooltip content="Basic tooltip with default styling" position="top">
              <button className={`p-3 rounded-lg transition-colors ${
                isDark() ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Star className="h-5 w-5" />
              </button>
            </Tooltip>
            
            <InfoTooltip content="Information tooltip with blue styling" position="top">
              <button className={`p-3 rounded-lg transition-colors ${
                isDark() ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-100 hover:bg-blue-200'
              }`}>
                <Info className="h-5 w-5 text-blue-600" />
              </button>
            </InfoTooltip>
            
            <WarningTooltip content="Warning tooltip with yellow styling" position="bottom">
              <button className={`p-3 rounded-lg transition-colors ${
                isDark() ? 'bg-yellow-900 hover:bg-yellow-800' : 'bg-yellow-100 hover:bg-yellow-200'
              }`}>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </button>
            </WarningTooltip>
            
            <ErrorTooltip content="Error tooltip with red styling" position="bottom">
              <button className={`p-3 rounded-lg transition-colors ${
                isDark() ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200'
              }`}>
                <XCircle className="h-5 w-5 text-red-600" />
              </button>
            </ErrorTooltip>
          </div>
          
          <div className="mt-4">
            <RichTooltip
              title="Rich Tooltip Example"
              description="This tooltip supports rich content including titles, descriptions, and actions."
              actions={
                <div className="flex space-x-2">
                  <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Action</button>
                  <button className="px-2 py-1 text-xs bg-gray-600 text-white rounded">Cancel</button>
                </div>
              }
              position="right"
            >
              <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark() ? 'bg-purple-900 hover:bg-purple-800 text-purple-200' : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
              }`}>
                Rich Tooltip Demo
              </button>
            </RichTooltip>
          </div>
        </motion.div>

        {/* Interactive Components */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl shadow-lg ${isDark() ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Interactive Components
          </h2>
          
          <div className="space-y-4">
            {/* Modal Demo */}
            <div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Modal Demo
              </button>
            </div>
            
            {/* Select Demos */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                Single Select (Frameworks)
              </label>
              <Select
                options={selectOptions}
                value={selectedValue}
                onChange={setSelectedValue}
                placeholder="Select a framework..."
                searchable
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                Multi Select (Multiple Frameworks)
              </label>
              <Select
                options={selectOptions}
                value={multiSelectValue}
                onChange={setMultiSelectValue}
                placeholder="Select multiple frameworks..."
                multiple
                searchable
              />
            </div>
            
            {/* Dropdown Demo */}
            <div>
              <Dropdown
                trigger={
                  <button className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark() ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    Dropdown Menu
                  </button>
                }
                position="bottom-start"
              >
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Preferences
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </button>
                </div>
              </Dropdown>
            </div>
          </div>
        </motion.div>

        {/* Alert Components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl shadow-lg ${isDark() ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alert Components
          </h2>
          
          <div className="space-y-4">
            <Alert type="info" title="Information Alert">
              This is an informational alert with additional context and details.
            </Alert>
            
            <Alert type="success" title="Success Alert">
              Operation completed successfully! Your changes have been saved.
            </Alert>
            
            <Alert type="warning" title="Warning Alert">
              Please review your settings before proceeding with this action.
            </Alert>
            
            {alertVisible && (
              <Alert 
                type="error" 
                title="Error Alert"
                onClose={() => setAlertVisible(false)}
              >
                An error occurred while processing your request. Please try again.
              </Alert>
            )}
          </div>
        </motion.div>

        {/* Loading & Status Components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl shadow-lg ${isDark() ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Loading & Status
          </h2>
          
          <div className="space-y-6">
            {/* Loading Spinners */}
            <div>
              <h3 className="text-sm font-medium mb-3">Loading Spinners</h3>
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" color="blue" />
                <LoadingSpinner size="md" color="green" />
                <LoadingSpinner size="lg" color="red" />
                <LoadingSpinner size="xl" color={isDark() ? 'white' : 'gray'} />
              </div>
            </div>
            
            {/* Status Indicators */}
            <div>
              <h3 className="text-sm font-medium mb-3">Status Indicators</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Inactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Processing</span>
                </div>
              </div>
            </div>
            
            {/* Progress Indicators */}
            <div>
              <h3 className="text-sm font-medium mb-3">Progress Indicators</h3>
              <div className="space-y-2">
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark() ? 'bg-gray-700' : ''}`}>
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark() ? 'bg-gray-700' : ''}`}>
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark() ? 'bg-gray-700' : ''}`}>
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Interactive Modal Demo"
        size="lg"
      >
        <div className="p-6 space-y-6">
          <Alert type="info" title="Modal Features">
            This modal demonstrates theme support, RTL compatibility, and responsive design.
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language Selection
              </label>
              <Select
                options={languageOptions}
                value={language}
                onChange={changeLanguage}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework Selection
              </label>
              <Select
                options={selectOptions}
                value={selectedValue}
                onChange={setSelectedValue}
                searchable
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Component Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Full i18n support with Arabic and English
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                RTL (Right-to-Left) layout support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Dark and light theme support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Accessible tooltips with multiple variants
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Interactive components with animations
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Responsive design for all screen sizes
              </li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                // You could add a toast notification here
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModernComponentsDemo;
