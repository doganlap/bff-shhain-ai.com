import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useScrollSpy } from '../../hooks/useScrollSpy'

const QuickSectionNav = () => {
  const sections = [
    'hero',
    'trust',
    'vision',
    'interactive-3d-cards',
    'ai-team',
    'competitive-advantage',
    'target-sectors',
    'dashboard',
    'transformation',
    'platform-demo',
    'parallax',
    'pricing',
    'faq'
  ]

  const activeSection = useScrollSpy(sections, 150)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const index = sections.indexOf(activeSection)
    if (index !== -1) {
      setCurrentIndex(index)
    }
    
    // Show after scrolling past hero
    setIsVisible(window.scrollY > 300)
    
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const scrollToSection = (index) => {
    if (index >= 0 && index < sections.length) {
      const element = document.getElementById(sections[index])
      if (element) {
        const offset = 80
        const elementPosition = element.offsetTop - offset
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  const goToPreviousSection = () => {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1)
    }
  }

  const goToNextSection = () => {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
        >
          {/* Unified Slim Navigation Bar */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-2 py-4 flex flex-col items-center gap-1">
            {/* Up Button - Slim with Tooltip */}
            <div className="relative group">
              <motion.button
                onClick={goToPreviousSection}
                disabled={currentIndex === 0}
                whileHover={{ scale: currentIndex > 0 ? 1.2 : 1 }}
                whileTap={{ scale: currentIndex > 0 ? 0.9 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentIndex === 0
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-br from-brand-primary to-brand-secondary hover:shadow-lg cursor-pointer'
                }`}
              >
                <ChevronUp 
                  className={`w-5 h-5 ${currentIndex === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-white'}`} 
                  strokeWidth={2.5}
                />
              </motion.button>
              {currentIndex > 0 && (
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    السابق
                  </div>
                </div>
              )}
            </div>

            {/* Slim Divider */}
            <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 my-1" />

            {/* Section Dots - Slim Indicator */}
            <div className="flex flex-col gap-1.5 py-2">
              {sections.map((section, idx) => (
                <div key={idx} className="relative group">
                  <motion.button
                    onClick={() => scrollToSection(idx)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-gradient-to-br from-brand-accent to-brand-gold scale-150 shadow-lg'
                        : idx < currentIndex
                          ? 'bg-brand-primary hover:scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:scale-125'
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {getSectionNameArabic(section)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slim Counter */}
            <div className="text-[10px] font-bold text-brand-primary dark:text-yellow-300 mt-1">
              {currentIndex + 1}/{sections.length}
            </div>

            {/* Slim Divider */}
            <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 my-1" />

            {/* Down Button - Slim with Tooltip */}
            <div className="relative group">
              <motion.button
                onClick={goToNextSection}
                disabled={currentIndex === sections.length - 1}
                whileHover={{ scale: currentIndex < sections.length - 1 ? 1.2 : 1 }}
                whileTap={{ scale: currentIndex < sections.length - 1 ? 0.9 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentIndex === sections.length - 1
                    ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg hover:shadow-xl cursor-pointer'
                }`}
              >
                <ChevronDown 
                  className={`w-5 h-5 ${currentIndex === sections.length - 1 ? 'text-gray-400 dark:text-gray-500' : 'text-white'}`} 
                  strokeWidth={2.5}
                />
              </motion.button>
              {currentIndex < sections.length - 1 && (
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    التالي
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper function for Arabic section names
const getSectionNameArabic = (sectionId) => {
  const names = {
    'hero': 'الرئيسية',
    'trust': 'الثقة',
    'vision': 'الرؤية',
    'interactive-3d-cards': 'البطاقات التفاعلية',
    'ai-team': 'فريق الذكاء الاصطناعي',
    'competitive-advantage': 'الميزة التنافسية',
    'target-sectors': 'القطاعات المستهدفة',
    'dashboard': 'لوحة المعلومات',
    'transformation': 'التحول',
    'platform-demo': 'عرض المنصة',
    'parallax': 'الخلفية المتحركة',
    'pricing': 'الأسعار',
    'faq': 'الأسئلة الشائعة',
  }
  return names[sectionId] || sectionId
}

export default QuickSectionNav

