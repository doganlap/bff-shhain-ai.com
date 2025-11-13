import React from 'react'
import { Shield, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import UnifiedLogo from './UnifiedLogo'

const Footer = () => {
  return (
    <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Professional Brand */}
          <div>
            <div className="mb-4 flex justify-start">
              <div className="scale-90">
                <UnifiedLogo size="small" variant="stacked" />
              </div>
            </div>
            <p className="font-arabic text-sm text-gray-600 dark:text-gray-400 mb-4">
              الحوكمة الاستثنائية، من المملكة إلى العالم
            </p>
            <p className="font-english text-xs text-gray-500 dark:text-gray-500 mb-4">
              Exceptional Governance, From the Kingdom to the World
            </p>
            
            {/* Developed By */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="font-arabic text-xs text-gray-500 mb-2">طُوّر بواسطة</p>
              <a 
                href="https://doganconsult.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-english font-bold text-brand-accent hover:text-brand-gold transition-colors group"
              >
                <span>DoganConsult</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-arabic font-bold mb-4">المنتج</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">الميزات</a></li>
              <li><a href="#frameworks" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">الأطر</a></li>
              <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">الأسعار</a></li>
              <li><a href="#final-cta" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">العروض التوضيحية</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-arabic font-bold mb-4">الشركة</h4>
            <ul className="space-y-2">
              <li><a href="#vision" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">من نحن</a></li>
              <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">اتصل بنا</a></li>
              <li><a href="mailto:info@shahingrc.sa" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">وظائف</a></li>
              <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">شركاؤنا</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-arabic font-bold mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">مركز المساعدة</a></li>
              <li><a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">الأسئلة الشائعة</a></li>
              <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">الدعم التقني</a></li>
              <li><a href="mailto:support@shahingrc.sa" className="text-gray-600 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-gold transition-colors font-arabic text-sm">اتصل بالدعم</a></li>
            </ul>
          </div>
        </div>

        {/* Professional Social & Copyright */}
        <div className="border-t border-gray-800/50 dark:border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <div className="relative group">
              <motion.a 
                href="https://twitter.com/shahingrc" 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-brand-accent hover:to-brand-gold hover:text-white shadow-lg transition-all"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </motion.a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  تويتر
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.a 
                href="https://linkedin.com/company/shahingrc" 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-brand-accent hover:to-brand-gold hover:text-white shadow-lg transition-all"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </motion.a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  لينكد إن
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.a 
                href="https://youtube.com/@shahingrc" 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-brand-accent hover:to-brand-gold hover:text-white shadow-lg transition-all"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </motion.a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  يوتيوب
                </div>
              </div>
            </div>
            <div className="relative group">
              <motion.a 
                href="https://github.com/shahingrc" 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-brand-accent hover:to-brand-gold hover:text-white shadow-lg transition-all"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </motion.a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  جيت هب
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
            <div>
              <p className="font-arabic text-sm text-gray-600 dark:text-gray-400 mb-1">
                © {new Date().getFullYear()} شاهين للحوكمة. جميع الحقوق محفوظة.
              </p>
              <p className="font-english text-xs text-gray-500 dark:text-gray-500">
                Shahin GRC. All rights reserved.
              </p>
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700" />
            <div className="relative group">
              <div>
                <p className="font-arabic text-xs text-gray-500 dark:text-gray-500 mb-1">تطوير وتصميم:</p>
                <a 
                  href="https://doganconsult.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-english font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-accent dark:hover:text-brand-gold transition-colors text-sm"
                >
                  <span>DoganConsult</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-arabic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  زيارة الموقع
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

