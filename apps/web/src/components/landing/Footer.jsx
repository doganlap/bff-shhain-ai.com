import React from 'react'
import { ExternalLink } from 'lucide-react'
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
        <div className="border-t border-gray-800/50 dark:border-gray-700/50 pt-8 flex items-center justify-center gap-3">
          <p className="font-arabic text-sm text-gray-600 dark:text-gray-400">
            {new Date().getFullYear()} شاهين للحوكمة. جميع الحقوق محفوظة.
          </p>
          <span className="text-gray-400">•</span>
          <p className="font-english text-sm text-gray-500 dark:text-gray-500">
            Shahin GRC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

