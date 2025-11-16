import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Heart, Landmark, Code, Zap, GraduationCap, ShoppingCart, Factory } from 'lucide-react'

const TargetSectors = () => {
  const sectors = [
    { 
      icon: Building2, 
      name: 'Financial Services', 
      ar: 'الخدمات المالية', 
      color: 'from-blue-500 to-blue-700',
      bgColor: '#3B82F6',
      frameworks: ['SAMA', 'CMA', 'NCA ECC', 'PDPL'],
      controls: 846,
      description: 'البنوك، التأمين، الاستثمار',
      badge: 'قطاع حيوي'
    },
    { 
      icon: Heart, 
      name: 'Healthcare', 
      ar: 'الرعاية الصحية', 
      color: 'from-red-500 to-red-700',
      bgColor: '#EF4444',
      frameworks: ['MOH', 'SFDA', 'CBAHI', 'PDPL'],
      controls: 678,
      description: 'المستشفيات، العيادات، المختبرات',
      badge: 'قطاع حساس'
    },
    { 
      icon: Landmark, 
      name: 'Government', 
      ar: 'القطاع الحكومي', 
      color: 'from-purple-500 to-purple-700',
      bgColor: '#8B5CF6',
      frameworks: ['NCA ECC', 'SDAIA', 'NDMO', 'Yesser'],
      controls: 924,
      description: 'الوزارات، الهيئات، البلديات',
      badge: 'أولوية عليا'
    },
    { 
      icon: Code, 
      name: 'Technology', 
      ar: 'التكنولوجيا', 
      color: 'from-green-500 to-green-700',
      bgColor: '#10B981',
      frameworks: ['NCA CCC', 'CST', 'ISO 27001', 'PDPL'],
      controls: 734,
      description: 'تقنية المعلومات، السحابة، البرمجيات',
      badge: 'نمو سريع'
    },
    { 
      icon: Zap, 
      name: 'Energy', 
      ar: 'الطاقة والمرافق', 
      color: 'from-amber-500 to-amber-700',
      bgColor: '#F59E0B',
      frameworks: ['NCA OTCC', 'ECRA', 'ISO 27001'],
      controls: 562,
      description: 'الكهرباء، النفط، الطاقة المتجددة',
      badge: 'بنية تحتية'
    },
    { 
      icon: Factory, 
      name: 'Manufacturing', 
      ar: 'التصنيع والإنتاج', 
      color: 'from-gray-500 to-gray-700',
      bgColor: '#6B7280',
      frameworks: ['ISO 9001', 'SASO', 'NCA ECC'],
      controls: 445,
      description: 'المصانع، الإنتاج، التوريد',
      badge: 'صناعي'
    },
    { 
      icon: ShoppingCart, 
      name: 'E-Commerce', 
      ar: 'التجارة الإلكترونية', 
      color: 'from-emerald-500 to-emerald-700',
      bgColor: '#10B981',
      frameworks: ['MOCI', 'PDPL', 'NCA ECC', 'PCI DSS'],
      controls: 512,
      description: 'التجزئة، التوصيل، المدفوعات',
      badge: 'رقمي'
    },
    { 
      icon: GraduationCap, 
      name: 'Education', 
      ar: 'التعليم والتدريب', 
      color: 'from-violet-500 to-violet-700',
      bgColor: '#8B5CF6',
      frameworks: ['MOE', 'ETEC', 'PDPL', 'NCAAA'],
      controls: 398,
      description: 'الجامعات، المدارس، التدريب',
      badge: 'معرفي'
    },
  ]

  return (
    <section id="target-sectors" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            تغطية شاملة لجميع القطاعات
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            من نخدم - جميع القطاعات السعودية
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Who We Serve - All Saudi Sectors
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectors.map((sector, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-400 transition-all shadow-lg hover:shadow-2xl cursor-pointer relative overflow-hidden"
            >
              {/* Sector Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-brand-accent to-brand-gold text-white text-xs font-bold rounded-full">
                  {sector.badge}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${sector.color} flex items-center justify-center mb-4 shadow-lg mt-8`}>
                <sector.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h4 className="font-arabic font-bold text-xl text-gray-900 mb-1">
                {sector.ar}
              </h4>
              <h5 className="font-english font-medium text-sm text-gray-500 mb-3">
                {sector.name}
              </h5>

              {/* Description */}
              <p className="font-arabic text-sm text-gray-600 mb-4 leading-relaxed">
                {sector.description}
              </p>

              {/* Controls Count */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-xs text-gray-600">عدد الضوابط:</span>
                  <span className="font-bold text-2xl" style={{ color: sector.bgColor }}>
                    {sector.controls.toLocaleString()}
                  </span>
                </div>
                <div className="font-english text-xs text-gray-400 mt-1">
                  Pre-loaded Controls
                </div>
              </div>

              {/* Frameworks */}
              <div className="space-y-2">
                <div className="font-arabic text-xs text-gray-700 font-semibold mb-2">
                  الأطر التنظيمية:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sector.frameworks.map((fw, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-english font-medium text-gray-700"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TargetSectors

