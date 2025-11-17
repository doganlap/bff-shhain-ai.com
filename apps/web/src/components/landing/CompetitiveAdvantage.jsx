import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Award, TrendingUp, Cpu, Target } from 'lucide-react'

const CompetitiveAdvantage = () => {
  const advantages = [
    {
      icon: Globe,
      title: 'التخصص السعودي',
      titleEn: 'Saudi Expertise',
      description: 'مصممة خصيصاً للبيئة التنظيمية السعودية مع فهم عميق للمتطلبات المحلية',
      descriptionEn: 'Specifically designed for the Saudi regulatory environment with deep understanding of local requirements',
      benefit: 'فهم محلي عميق',
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: Shield,
      title: 'الأمان المتقدم',
      titleEn: 'Advanced Security',
      description: 'أعلى معايير الأمان مع تخزين محلي للبيانات وضمان الخصوصية الكاملة',
      descriptionEn: 'Highest security standards with local data storage and complete privacy assurance',
      benefit: 'حماية فائقة',
      color: 'from-green-500 to-emerald-700'
    },
    {
      icon: Zap,
      title: 'الأداء السريع',
      titleEn: 'Lightning Performance',
      description: 'سرعة استثنائية وتجربة مستخدم سلسة حتى مع البيانات الضخمة',
      descriptionEn: 'Exceptional speed and smooth user experience even with large data volumes',
      benefit: 'أداء فائق',
      color: 'from-amber-500 to-orange-700'
    },
    {
      icon: Cpu,
      title: 'الذكاء الاصطناعي المتقدم',
      titleEn: 'Advanced AI',
      description: 'تقنيات ذكاء اصطناعي متطورة لاتخاذ قرارات ذكية تلقائياً',
      descriptionEn: 'Advanced AI technologies for automatic intelligent decision-making',
      benefit: 'ذكاء متطور',
      color: 'from-purple-500 to-pink-700'
    },
    {
      icon: Award,
      title: 'الجودة المضمونة',
      titleEn: 'Guaranteed Quality',
      description: 'معايير جودة عالمية مع التزام بتقديم الأفضل دائماً',
      descriptionEn: 'Global quality standards with commitment to always deliver the best',
      benefit: 'جودة عالمية',
      color: 'from-indigo-500 to-blue-700'
    },
    {
      icon: TrendingUp,
      title: 'النمو المستدام',
      titleEn: 'Sustainable Growth',
      description: 'حلول قابلة للتوسع تنمو مع مؤسستك وتحافظ على الكفاءة',
      descriptionEn: 'Scalable solutions that grow with your organization and maintain efficiency',
      benefit: 'نماء مستمر',
      color: 'from-emerald-500 to-green-700'
    }
  ]

  const comparison = [
    { aspect: 'التغطية الشاملة', aspectEn: 'Comprehensive Coverage', shahin: '117+ إطار', competitors: '30-50 إطار' },
    { aspect: 'الدعم العربي', aspectEn: 'Arabic Support', shahin: '100% كامل', competitors: 'محدود' },
    { aspect: 'التكلفة', aspectEn: 'Cost', shahin: 'معقول', competitors: 'عالي جداً' },
    { aspect: 'التطبيق', aspectEn: 'Implementation', shahin: '2-4 أسابيع', competitors: '3-6 أشهر' },
    { aspect: 'الأمان', aspectEn: 'Security', shahin: 'ISO 27001', competitors: 'متفاوت' }
  ]

  return (
    <section id="competitive-advantage" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            الميزة التنافسية
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            لماذا تختار شاهين؟
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Why Choose Shahin?
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            المزايا التي تميزنا في السوق وتحقق لك قيمة حقيقية
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            The advantages that set us apart in the market and deliver real value to you
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-brand-accent/50 transition-all shadow-lg hover:shadow-2xl group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${advantage.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <advantage.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              <div className="inline-block px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-lg text-xs font-bold mb-4">
                {advantage.benefit}
              </div>
              
              <h3 className="font-arabic font-bold text-xl text-gray-900 mb-2">
                {advantage.title}
              </h3>
              <h4 className="font-english font-semibold text-sm text-gray-700 mb-4">
                {advantage.titleEn}
              </h4>
              
              <p className="font-arabic text-sm text-gray-600 leading-relaxed mb-2">
                {advantage.description}
              </p>
              <p className="font-english text-xs text-gray-500 leading-relaxed">
                {advantage.descriptionEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-12 border-2 border-brand-accent/20 shadow-xl"
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <Target className="w-8 h-8 text-brand-primary" strokeWidth={2} />
            <h3 className="font-arabic font-bold text-3xl text-gray-900">
              شاهين مقابل المنافسين
            </h3>
          </div>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Shahin vs Competitors
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right py-4 px-6 font-arabic font-bold text-gray-900">الجانب</th>
                  <th className="text-center py-4 px-6 font-english font-semibold text-gray-700">Aspect</th>
                  <th className="text-center py-4 px-6 font-arabic font-bold text-brand-primary">شاهين</th>
                  <th className="text-center py-4 px-6 font-arabic font-semibold text-gray-600">المنافسون</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr 
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-arabic font-semibold text-gray-900 text-right">
                      {item.aspect}
                    </td>
                    <td className="py-4 px-6 font-english text-sm text-gray-700 text-center">
                      {item.aspectEn}
                    </td>
                    <td className="py-4 px-6 font-arabic font-bold text-brand-primary text-center">
                      {item.shahin}
                    </td>
                    <td className="py-4 px-6 font-arabic text-sm text-gray-600 text-center">
                      {item.competitors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="font-arabic text-xl text-gray-900 mb-4">
            اختار الحل الأفضل لمؤسستك
          </p>
          <p className="font-english text-lg text-gray-600">
            Choose the best solution for your organization
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CompetitiveAdvantage
