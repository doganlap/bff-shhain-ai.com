import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Globe, Shield, Users, Zap, Target, Award } from 'lucide-react'

const Vision = () => {
  const visions = [
    {
      icon: Globe,
      title: 'النطاق العالمي',
      titleEn: 'Global Reach',
      description: 'نحن نسعى لجعل الحوكمة والامتثال متاحاً وسهل الاستخدام لجميع المنظمات في جميع أنحاء العالم',
      descriptionEn: 'We strive to make governance and compliance accessible and easy-to-use for all organizations worldwide',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Shield,
      title: 'الأمان والثقة',
      titleEn: 'Security & Trust',
      description: 'بناء نظام يمكن الوثوق به لحماية بياناتك وسرية عملك',
      descriptionEn: 'Building a system you can trust to protect your data and business confidentiality',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'تعاون فعال',
      titleEn: 'Effective Collaboration',
      description: 'تمكين الفرق من العمل معاً بكفاءة أكبر لتحقيق أهداف الامتثال',
      descriptionEn: 'Empowering teams to work together more efficiently to achieve compliance goals',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'الابتكار المستمر',
      titleEn: 'Continuous Innovation',
      description: 'استخدام الذكاء الاصطناعي والتقنيات الحديثة لتبسيط الحوكمة',
      descriptionEn: 'Using AI and cutting-edge technology to simplify governance',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Target,
      title: 'التركيز على النتائج',
      titleEn: 'Results-Focused',
      description: 'تقديم حلول قابلة للقياس تؤدي إلى نتائج ملموسة ومستدامة',
      descriptionEn: 'Delivering measurable solutions that lead to tangible, sustainable results',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'التميز في الخدمة',
      titleEn: 'Service Excellence',
      description: 'الالتزام بتقديم أفضل تجربة مستخدم ودعم عملاء استثنائي',
      descriptionEn: 'Committed to delivering the best user experience and exceptional customer support',
      gradient: 'from-rose-500 to-red-600'
    }
  ]

  const principles = [
    {
      title: 'الاستدامة أولاً',
      titleEn: 'Sustainability First',
      description: 'نؤمن بنهج متوازن يربط بين الحوكمة الفعالة والنمو المستدام'
    },
    {
      title: 'جودة متميزة',
      titleEn: 'Excellence in Quality',
      description: 'التركيز على الجودة في كل جانب من جوانب عملنا'
    },
    {
      title: 'تأثير عالمي',
      titleEn: 'Global Impact',
      description: 'إحداث فرق إيجابي في جميع أنحاء العالم من خلال التقنيات المبتكرة'
    }
  ]

  return (
    <section id="vision" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>رؤيتنا</span>
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            رؤيتنا وتطلعاتنا
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Our Vision & Aspirations
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نسعى لتصبح الحل المفضل عالمياً لإدارة الحوكمة والمخاطر والامتثال، 
            محاصرين على التميز والابتكار في كل ما نقوم به
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            We strive to become the global preferred solution for Governance, Risk, 
            and Compliance management, with an uncompromising focus on excellence and innovation
          </p>
        </motion.div>

        {/* Vision Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {visions.map((vision, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-brand-accent/50 transition-all shadow-lg hover:shadow-2xl group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${vision.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <vision.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-arabic font-bold text-xl text-gray-900 mb-2">
                {vision.title}
              </h3>
              <h4 className="font-english font-semibold text-sm text-gray-600 mb-4">
                {vision.titleEn}
              </h4>
              <p className="font-arabic text-sm text-gray-600 leading-relaxed mb-2">
                {vision.description}
              </p>
              <p className="font-english text-xs text-gray-500 leading-relaxed">
                {vision.descriptionEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Core Principles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 rounded-3xl p-12 border-4 border-brand-accent/20"
        >
          <h3 className="font-arabic font-bold text-3xl text-center text-gray-900 mb-4">
            مبادئنا الأساسية
          </h3>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Our Core Principles
          </h4>
          
          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-accent to-brand-gold flex items-center justify-center shadow-xl">
                  <span className="text-4xl font-bold text-white">{index + 1}</span>
                </div>
                <h5 className="font-arabic font-bold text-xl text-gray-900 mb-2">
                  {principle.title}
                </h5>
                <h6 className="font-english font-semibold text-sm text-gray-700 mb-3">
                  {principle.titleEn}
                </h6>
                <p className="font-arabic text-sm text-gray-600 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="font-arabic text-xl text-gray-900 mb-6">
            انضم إلى رحلتنا نحو مستقبل أفضل للحوكمة والامتثال
          </p>
          <p className="font-english text-lg text-gray-600 mb-8">
            Join us on our journey toward a better future for governance and compliance
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Vision

