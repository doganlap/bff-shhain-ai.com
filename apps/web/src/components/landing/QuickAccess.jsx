import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles, Star, Shield, DollarSign, Mail, BarChart3, Award } from 'lucide-react'

const QuickAccess = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickLinks = [
    { id: 'vision', icon: Sparkles, label: 'الرؤية', labelEn: 'Vision', color: 'from-amber-500 to-gold-600' },
    { id: 'features', icon: Star, label: 'الميزات', labelEn: 'Features', color: 'from-blue-500 to-blue-600' },
    { id: 'frameworks', icon: Shield, label: 'الأطر', labelEn: 'Frameworks', color: 'from-emerald-500 to-emerald-600' },
    { id: 'transformation', icon: BarChart3, label: 'التحول', labelEn: 'Journey', color: 'from-purple-500 to-purple-600' },
    { id: 'platform-demo', icon: Award, label: 'العرض', labelEn: 'Demo', color: 'from-cyan-500 to-cyan-600' },
    { id: 'pricing', icon: DollarSign, label: 'الأسعار', labelEn: 'Pricing', color: 'from-pink-500 to-pink-600' },
    { id: 'contact', icon: Mail, label: 'اتصل', labelEn: 'Contact', color: 'from-indigo-500 to-indigo-600' },
  ]

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

  return (
    <div className="relative z-30 -mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Collapsible Quick Access Bar */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Toggle Header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all"
              aria-label="الانتقال السريع للأقسام"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-gold rounded-lg flex items-center justify-center">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-white" aria-hidden="true" /> : <ChevronDown className="w-5 h-5 text-white" aria-hidden="true" />}
                </div>
                <div className="text-right">
                  <div className="font-arabic font-bold text-lg text-gray-900">
                    الانتقال السريع للأقسام
                  </div>
                  <div className="font-english text-xs text-gray-500">
                    Quick Section Access
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-arabic text-sm text-gray-600">
                  {isExpanded ? 'إخفاء' : 'عرض'}
                </span>
                <div className="text-2xl text-brand-accent">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>
            </button>

            {/* Expandable Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {quickLinks.map((link, index) => (
                        <motion.button
                          key={link.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            smoothScrollTo(link.id)
                            setIsExpanded(false)
                          }}
                          className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
                          aria-label={`انتقل إلى ${link.label}`}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <link.icon className="w-6 h-6 text-white" strokeWidth={2} aria-hidden="true" />
                          </div>
                          <div className="text-center">
                            <div className="font-arabic font-bold text-xs text-gray-900 mb-1">
                              {link.label}
                            </div>
                            <div className="font-english text-[10px] text-gray-500">
                              {link.labelEn}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default QuickAccess

