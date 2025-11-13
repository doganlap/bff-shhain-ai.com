import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Cpu, BarChart3, Users, FileCheck, Zap, Globe, Lock } from 'lucide-react'

const Interactive3DCards = () => {
  const [hoveredCard, setHoveredCard] = useState(null)

  const cards = [
    {
      icon: Shield,
      title: 'الأمان والامتثال',
      titleEn: 'Security & Compliance',
      description: 'ضمان الامتثال الكامل مع الأمان الفائق',
      descriptionEn: 'Full compliance assurance with superior security',
      gradient: 'from-blue-500 to-blue-700',
      features: ['معتمد بشهادة ISO 27001', 'تشفير شامل', 'عمليات تدقيق منتظمة']
    },
    {
      icon: Cpu,
      title: 'الذكاء الاصطناعي',
      titleEn: 'Artificial Intelligence',
      description: 'ذكاء اصطناعي متقدم لتسريع القرارات',
      descriptionEn: 'Advanced AI to accelerate decisions',
      gradient: 'from-purple-500 to-purple-700',
      features: ['تقييمات تلقائية', 'توصيات ذكية', 'تحليلات تنبؤية']
    },
    {
      icon: BarChart3,
      title: 'التحليلات الذكية',
      titleEn: 'Smart Analytics',
      description: 'رؤى قابلة للتنفيذ من البيانات',
      descriptionEn: 'Actionable insights from data',
      gradient: 'from-amber-500 to-orange-700',
      features: ['لوحات معلومات فورية', 'تقارير مخصصة', 'تصور البيانات']
    },
    {
      icon: Users,
      title: 'التعاون الفعال',
      titleEn: 'Effective Collaboration',
      description: 'فرق تعمل معاً بكفاءة',
      descriptionEn: 'Teams working together efficiently',
      gradient: 'from-green-500 to-emerald-700',
      features: ['مساحات عمل للفريق', 'إدارة الأدوار', 'نظام الإشعارات']
    },
    {
      icon: FileCheck,
      title: 'الإدارة الموحدة',
      titleEn: 'Unified Management',
      description: 'جميع الأطر في مكان واحد',
      descriptionEn: 'All frameworks in one place',
      gradient: 'from-indigo-500 to-indigo-700',
      features: ['+117 إطار عمل', '+3,200 ضابط تحكم', 'لوحة تحكم مركزية']
    },
    {
      icon: Zap,
      title: 'الأتمتة الكاملة',
      titleEn: 'Full Automation',
      description: 'قل وداعاً للمهام اليدوية المتكررة',
      descriptionEn: 'Say goodbye to repetitive manual tasks',
      gradient: 'from-pink-500 to-rose-700',
      features: ['جدولة تلقائية', 'سير عمل ذكي', 'إجراءات بنقرة واحدة']
    },
    {
      icon: Globe,
      title: 'متعدد اللغات',
      titleEn: 'Multilingual',
      description: 'دعم كامل للعربية والإنجليزية',
      descriptionEn: 'Full Arabic & English support',
      gradient: 'from-teal-500 to-cyan-700',
      features: ['واجهة عربية 100%', 'محتوى ثنائي اللغة', 'دعم RTL']
    },
    {
      icon: Lock,
      title: 'الخصوصية والسرية',
      titleEn: 'Privacy & Confidentiality',
      description: 'بياناتك محمية ومضمونة',
      descriptionEn: 'Your data protected and secure',
      gradient: 'from-red-500 to-red-700',
      features: ['متوافق مع GDPR', 'استضافة محلية', 'سيادة البيانات']
    }
  ]

  return (
    <section id="interactive-3d-cards" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            الحلول التفاعلية
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            اكتشف قوة شاهين
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Discover the Power of Shahin
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            حلول شاملة ومتقدمة في منصة واحدة
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Comprehensive and advanced solutions in one platform
          </p>
        </motion.div>

        {/* 3D Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/30 dark:border-gray-700/50 hover:border-brand-accent/50 transition-all cursor-pointer h-full"
              style={{
                transform: hoveredCard === index ? 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateZ(20px)' : 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: hoveredCard === index ? '0 20px 40px rgba(31, 38, 135, 0.3)' : '0 8px 32px rgba(31, 38, 135, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 shadow-lg`}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <card.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              
              <h3 className="font-arabic font-bold text-xl text-gray-900 mb-2">
                {card.title}
              </h3>
              <h4 className="font-english font-semibold text-sm text-gray-700 mb-4">
                {card.titleEn}
              </h4>
              
              <p className="font-arabic text-sm text-gray-600 mb-4 leading-relaxed">
                {card.description}
              </p>
              <p className="font-english text-xs text-gray-500 mb-6 leading-relaxed">
                {card.descriptionEn}
              </p>
              
              <div className="space-y-2">
                {card.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                    <span className="font-english text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Hover Effect Background */}
              {hoveredCard === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl pointer-events-none"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Interactive3DCards
