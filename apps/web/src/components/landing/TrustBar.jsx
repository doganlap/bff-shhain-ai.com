import React from 'react'
import { motion } from 'framer-motion'

const TrustBar = () => {
  const stats = [
    { number: '40+', label: 'Saudi Regulators', ar: 'جهة سعودية' },
    { number: '117', label: 'Total Frameworks', ar: 'إطار تنظيمي' },
    { number: '3,200+', label: 'Pre-loaded Controls', ar: 'ضابط جاهز' },
    { number: '100%', label: 'Arabic Support', ar: 'دعم عربي كامل' },
  ]

  return (
    <section id="trust" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-brand-accent to-brand-gold bg-clip-text text-transparent mb-3">
                {stat.number}
              </div>
              <div className="font-arabic font-bold text-lg text-gray-900 mb-1">{stat.ar}</div>
              <div className="font-english text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trusted By */}
        <div className="text-center">
          <p className="font-arabic font-bold text-gray-900 mb-2 text-xl">
            موثوق به من قبل المؤسسات الرائدة
          </p>
          <p className="font-english text-xs text-gray-500 mb-8">
            Trusted by Leading Organizations
          </p>
          
          {/* Customer Logos Placeholder */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            <div className="h-16 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs font-arabic">شعار 1</span>
            </div>
            <div className="h-16 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs font-arabic">شعار 2</span>
            </div>
            <div className="h-16 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs font-arabic">شعار 3</span>
            </div>
            <div className="h-16 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs font-arabic">شعار 4</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustBar

