import React, { useState, useRef, useEffect } from 'react'
import { Shield, Sparkles, LogIn, Bot, Menu, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import DemoBooking from './DemoBooking'
import LoginModal from './LoginModal'
import UnifiedLogo from './UnifiedLogo'
import ThemeToggle from './ThemeToggle'
import { useScrollSpy, useScrollProgress, useHeaderVisibility } from '../../hooks/useScrollSpy'

const Header = ({ onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [bookingType, setBookingType] = useState('demo')
  const dropdownRef = useRef(null)

  // All sections for navigation
  const allSections = [
    { id: 'hero', label: 'الرئيسية', labelEn: 'Home' },
    { id: 'trust', label: 'الثقة', labelEn: 'Trust' },
    { id: 'vision', label: 'الرؤية', labelEn: 'Vision' },
    { id: 'interactive-3d-cards', label: 'البطاقات التفاعلية', labelEn: '3D Cards' },
    { id: 'ai-team', label: 'فريق الذكاء الاصطناعي', labelEn: 'AI Team' },
    { id: 'competitive-advantage', label: 'الميزة التنافسية', labelEn: 'Advantage' },
    { id: 'target-sectors', label: 'القطاعات المستهدفة', labelEn: 'Sectors' },
    { id: 'dashboard', label: 'لوحة المعلومات', labelEn: 'Dashboard' },
    { id: 'transformation', label: 'التحول', labelEn: 'Transformation' },
    { id: 'platform-demo', label: 'عرض المنصة', labelEn: 'Demo' },
    { id: 'parallax', label: 'الخلفية المتحركة', labelEn: 'Parallax' },
    { id: 'pricing', label: 'الأسعار', labelEn: 'Pricing' },
    { id: 'faq', label: 'الأسئلة الشائعة', labelEn: 'FAQ' },
  ]

  // Advanced navigation hooks
  const sections = allSections.map(s => s.id)
  const activeSection = useScrollSpy(sections, 150)
  const scrollProgress = useScrollProgress()
  const isHeaderVisible = useHeaderVisibility()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const smoothScrollTo = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      setIsMenuOpen(false)
      setIsDropdownOpen(false)
    }
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/95 to-blue-800/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl border-b border-blue-700/30 dark:border-gray-700/30 transition-all duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 32px 0 rgba(31, 38, 135, 0.2)',
      }}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-brand-accent via-purple-600 to-brand-gold transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Unified Logo - Symmetrical & Centered */}
          <UnifiedLogo size="medium" variant="horizontal" />

          {/* Advanced Desktop Navigation with Active States */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative group">
              <motion.button 
                onClick={() => smoothScrollTo('vision')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center gap-2 font-arabic font-bold px-4 py-2 rounded-full transition-all ${
                  activeSection === 'vision' 
                    ? 'bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-label="انتقل إلى الرؤية"
                aria-current={activeSection === 'vision' ? 'page' : undefined}
              >
                <Sparkles className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                <span>الرؤية</span>
              </motion.button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  الرؤية
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.button 
                onClick={() => smoothScrollTo('features')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`font-arabic font-medium px-4 py-2 rounded-full transition-all ${
                  activeSection === 'features' 
                    ? 'text-yellow-300 font-bold scale-110 bg-white/10' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-label="انتقل إلى الميزات"
                aria-current={activeSection === 'features' ? 'page' : undefined}
              >
                الميزات
              </motion.button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  الميزات
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.button 
                onClick={() => smoothScrollTo('frameworks')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`font-arabic font-medium px-4 py-2 rounded-full transition-all ${
                  activeSection === 'frameworks' 
                    ? 'text-yellow-300 font-bold scale-110 bg-white/10' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-label="انتقل إلى الأطر"
                aria-current={activeSection === 'frameworks' ? 'page' : undefined}
              >
                الأطر
              </motion.button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  الأطر
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.button 
                onClick={() => smoothScrollTo('contact')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`font-arabic font-medium px-4 py-2 rounded-full transition-all ${
                  activeSection === 'contact' 
                    ? 'text-yellow-300 font-bold scale-110 bg-white/10' 
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-label="انتقل إلى اتصل بنا"
                aria-current={activeSection === 'contact' ? 'page' : undefined}
              >
                اتصل بنا
              </motion.button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  اتصل بنا
                </div>
              </div>
            </div>
            
            {/* All Sections Dropdown */}
            <div className="relative group" ref={dropdownRef}>
              <motion.button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-1 font-arabic font-medium px-4 py-2 rounded-full transition-all ${
                  isDropdownOpen
                    ? 'bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg'
                    : 'text-white/90 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-label="جميع الأقسام"
                aria-expanded={isDropdownOpen}
              >
                <Menu className="w-4 h-4" />
                <span>المزيد</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  جميع الأقسام
                </div>
              </div>
              
              {isDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-y-auto z-50"
                  style={{
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                      جميع الأقسام (21)
                    </div>
                    {allSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => smoothScrollTo(section.id)}
                        className={`w-full text-right px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                          activeSection === section.id ? 'bg-blue-100 dark:bg-gray-700 text-brand-primary dark:text-yellow-300 font-bold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        aria-label={`انتقل إلى ${section.label}`}
                      >
                        <span className="font-arabic">{section.label}</span>
                        {activeSection === section.id && (
                          <div className="w-2 h-2 bg-brand-gold rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          {/* Login Button */}
          <div className="relative group">
            <motion.button 
              onClick={onLoginClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative flex items-center gap-2 font-arabic font-bold px-4 py-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
              aria-label="دخول المنصة"
            >
              <LogIn className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span>دخول</span>
            </motion.button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                دخول منصة شاهين
              </div>
            </div>
          </div>

          <div className="relative group">
            <a
              href="https://partner.shahin-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-2 font-arabic font-bold px-4 py-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              aria-label="بوابة الشركاء"
            >
              بوابة الشركاء
            </a>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                الانتقال إلى بوابة الشركاء
              </div>
            </div>
          </div>

            {/* Theme Toggle */}
            <div className="relative group">
              <ThemeToggle className="text-white/90 hover:text-yellow-300 hover:bg-white/10 rounded-full p-2" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  تبديل المظهر
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="lg:hidden p-2 rounded-full text-white/90 hover:text-yellow-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="القائمة"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>

        {/* Arabic Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-700/30 dark:border-gray-700/30 bg-gradient-to-r from-blue-600/95 to-blue-800/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl" role="menu">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => smoothScrollTo('vision')}
                className={`flex items-center gap-2 font-arabic font-bold text-right ${
                  activeSection === 'vision' ? 'text-brand-gold' : 'text-brand-accent hover:text-brand-gold'
                }`}
                aria-label="انتقل إلى الرؤية"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                <span>الرؤية</span>
                {activeSection === 'vision' && <span className="mr-auto text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('features')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'features' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الميزات"
              >
                الميزات {activeSection === 'features' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('frameworks')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'frameworks' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الأطر"
              >
                الأطر {activeSection === 'frameworks' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('pricing')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'pricing' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الأسعار"
              >
                الأسعار {activeSection === 'pricing' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('contact')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'contact' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى اتصل بنا"
              >
                اتصل بنا {activeSection === 'contact' && <span className="mr-2 text-xs">●</span>}
              </button>

              {/* Mobile Login Button */}
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 font-arabic font-bold text-right bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg"
                aria-label="دخول المنصة"
              >
                <LogIn className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                <span>دخول المنصة</span>
              </button>
              
              {/* Mobile: All Sections */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 px-2">جميع الأقسام</div>
                <div className="max-h-64 overflow-y-auto">
                  {allSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => smoothScrollTo(section.id)}
                      className={`w-full text-right px-4 py-2 text-sm font-arabic ${
                        activeSection === section.id 
                          ? 'text-brand-primary dark:text-yellow-300 font-bold bg-blue-50 dark:bg-gray-800' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-yellow-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      aria-label={`انتقل إلى ${section.label}`}
                    >
                      {section.label}
                      {activeSection === section.id && <span className="mr-2 text-xs">●</span>}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">المظهر:</span>
                <ThemeToggle className="text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Demo Booking Modal */}
      <DemoBooking 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)}
        bookingType={bookingType}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
      />
    </header>
  )
}

export default Header
