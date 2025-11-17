import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Sparkles, Star, Shield, DollarSign, Mail, ArrowUp, Monitor, Link2 } from 'lucide-react'
import { useScrollSpy } from '../../hooks/useScrollSpy'

const FloatingNav = () => {
  const sections = [
    { id: 'hero', icon: Home, label: 'الرئيسية', labelEn: 'Home' },
    { id: 'vision', icon: Sparkles, label: 'الرؤية', labelEn: 'Vision' },
    { id: 'features', icon: Star, label: 'الميزات', labelEn: 'Features' },
    { id: 'frameworks', icon: Shield, label: 'الأطر', labelEn: 'Frameworks' },
    { id: 'dashboard', icon: Monitor, label: 'لوحة المعلومات', labelEn: 'Dashboard' },
    { id: 'platform-demo', icon: Sparkles, label: 'عرض المنصة', labelEn: 'Demo' },
    { id: 'pricing', icon: DollarSign, label: 'الأسعار', labelEn: 'Pricing' },
    { id: 'faq', icon: Mail, label: 'الأسئلة الشائعة', labelEn: 'FAQ' },
    { id: 'contact', icon: Mail, label: 'اتصل بنا', labelEn: 'Contact' },
  ]

  const activeSection = useScrollSpy(sections.map(s => s.id), 150)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Ultra Slim Floating Glassmorphism Navigation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
        style={{
          filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.1))',
        }}
      >
        <div 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-1.5 py-2"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          <div className="flex flex-col gap-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <motion.div
                  key={section.id}
                  className="relative group"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.button
                    onClick={() => smoothScrollTo(section.id)}
                    className={`relative p-2 rounded-full transition-all duration-300 ease-out ${
                      isActive 
                        ? 'bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg' 
                        : 'hover:bg-white/40 dark:hover:bg-gray-700/40 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    whileHover={!isActive ? { backgroundColor: 'rgba(255, 255, 255, 0.5)' } : {}}
                    title={section.label}
                    aria-label={`انتقل إلى ${section.label}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1 : 0.95,
                        rotate: isActive ? 0 : 0
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <section.icon 
                        className="w-4 h-4" 
                        strokeWidth={isActive ? 2.5 : 2} 
                        aria-hidden="true" 
                      />
                    </motion.div>
                  </motion.button>
                  
                  {/* Smooth Tooltip */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50"
                  >
                    <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shadow-2xl border border-white/10">
                      <div className="font-arabic font-semibold">{section.label}</div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => window.open('https://partner.shahin-ai.com/', '_blank', 'noopener,noreferrer')}
        title="Partner Portal"
        aria-label="Open Partner Portal"
        className="fixed left-6 bottom-32 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform group"
      >
        <Link2 className="w-5 h-5" strokeWidth={2.5} />
      </motion.button>

      {/* Slim Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 left-6 w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-gold text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingNav
