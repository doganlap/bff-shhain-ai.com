import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Building, Users, CheckCircle, FileText } from 'lucide-react'

const SaudiFrameworks = () => {
  const frameworkCategories = [
    {
      icon: Shield,
      title: 'الأمن السيبراني',
      titleEn: 'Cybersecurity',
      frameworks: [
        { name: 'NCA ECC v2.0', version: '2.0', controls: 114, mandatory: true },
        { name: 'NCA CCC', version: '2022', controls: 78, mandatory: true },
        { name: 'NCA OTCC', version: '2023', controls: 92, mandatory: true }
      ],
      color: 'from-blue-500 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      icon: Building,
      title: 'الخدمات المالية',
      titleEn: 'Financial Services',
      frameworks: [
        { name: 'SAMA Cybersecurity Framework', version: 'v2.1', controls: 96, mandatory: true },
        { name: 'CMA Governance', version: '2023', controls: 68, mandatory: true },
        { name: 'PDPL', version: '2022', controls: 47, mandatory: true }
      ],
      color: 'from-green-500 to-emerald-700',
      bgColor: 'from-green-50 to-emerald-100'
    },
    {
      icon: Users,
      title: 'القطاع الحكومي',
      titleEn: 'Government Sector',
      frameworks: [
        { name: 'NDMO Framework', version: '2024', controls: 82, mandatory: true },
        { name: 'SDAIA Data Governance', version: '2023', controls: 71, mandatory: false },
        { name: 'Yesser Digital Transformation', version: '2022', controls: 54, mandatory: false }
      ],
      color: 'from-purple-500 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      icon: FileText,
      title: 'الصحة والرعاية',
      titleEn: 'Healthcare',
      frameworks: [
        { name: 'MOH Cybersecurity', version: '2023', controls: 89, mandatory: true },
        { name: 'SFDA Data Protection', version: '2022', controls: 62, mandatory: true },
        { name: 'CBAHI Quality Standards', version: '2024', controls: 75, mandatory: false }
      ],
      color: 'from-red-500 to-red-700',
      bgColor: 'from-red-50 to-red-100'
    }
  ]

  const stats = [
    { number: '117', label: 'إطار تنظيمي', labelEn: 'Total Frameworks', icon: FileText },
    { number: '3,200+', label: 'ضابط جاهز', labelEn: 'Pre-loaded Controls', icon: CheckCircle },
    { number: '40+', label: 'جهة سعودية', labelEn: 'Saudi Regulators', icon: Building }
  ]

  return (
    <section id="frameworks" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            الأطر التنظيمية
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            دعم شامل لجميع الأطر السعودية والدولية
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Comprehensive Support for All Saudi & International Frameworks
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            تغطية كاملة لجميع الإطارات التنظيمية السائدة في المملكة وحول العالم
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Complete coverage of all major regulatory frameworks in Saudi Arabia and worldwide
          </p>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-brand-accent to-brand-gold bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="font-arabic font-bold text-sm text-gray-900 mb-1">{stat.label}</div>
              <div className="font-english text-xs text-gray-500">{stat.labelEn}</div>
            </motion.div>
          ))}
        </div>

        {/* Saudi Frameworks */}
        <div className="mb-16">
          <h3 className="font-arabic font-bold text-3xl text-center text-gray-900 mb-4">
            الأطر التنظيمية السعودية الرئيسية
          </h3>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Major Saudi Regulatory Frameworks
          </h4>

          <div className="grid md:grid-cols-2 gap-8">
            {frameworkCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${category.bgColor} rounded-2xl p-8 border-2 border-gray-200`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h5 className="font-arabic font-bold text-xl text-gray-900">{category.title}</h5>
                    <h6 className="font-english font-semibold text-sm text-gray-700">{category.titleEn}</h6>
                  </div>
                </div>

                <div className="space-y-4">
                  {category.frameworks.map((framework, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-5 h-5 ${framework.mandatory ? 'text-red-600' : 'text-gray-400'}`} strokeWidth={2} />
                          <span className="font-english font-bold text-gray-900">{framework.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${framework.mandatory ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {framework.mandatory ? 'إلزامي' : 'اختياري'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-english text-gray-600">v{framework.version}</span>
                        <span className="font-arabic text-gray-700">{framework.controls} ضابط</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="font-arabic text-xl text-gray-900 mb-6">
            استعد للامتثال الكامل مع جميع الأطر التنظيمية
          </p>
          <p className="font-english text-lg text-gray-600 mb-8">
            Get ready for complete compliance with all regulatory frameworks
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default SaudiFrameworks
