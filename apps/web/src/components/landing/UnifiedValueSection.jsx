import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Target, Award, TrendingUp } from 'lucide-react'

const UnifiedValueSection = () => {
  const values = [
    {
      icon: Sparkles,
      title: 'الابتكار المستمر',
      titleEn: 'Continuous Innovation',
      description: 'نواصل تطوير حلولنا باستخدام أحدث التقنيات لضمان بقائك في المقدمة',
      descriptionEn: 'We continuously develop our solutions using the latest technologies to keep you ahead',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Target,
      title: 'التركيز على العميل',
      titleEn: 'Customer Focus',
      description: 'احتياجاتك أولاً - نبني الحلول التي تحتاجها حقاً لتحقيق أهدافك',
      descriptionEn: 'Your needs first - we build the solutions you truly need to achieve your goals',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Award,
      title: 'التميز في الجودة',
      titleEn: 'Quality Excellence',
      description: 'لنا التزام لا يقبل المساومة بالجودة في كل جانب من جوانب عملنا',
      descriptionEn: 'We have an uncompromising commitment to quality in every aspect of our work',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      title: 'القيمة طويلة الأمد',
      titleEn: 'Long-term Value',
      description: 'نحن نؤمن بالشراكات طويلة الأمد التي تحقق قيمة مستدامة لك ومؤسستك',
      descriptionEn: 'We believe in long-term partnerships that deliver sustainable value to you and your organization',
      gradient: 'from-green-500 to-emerald-600'
    }
  ]

  return (
    <section id="unified-value" className="py-20 bg-gradient-to-b from-white via-brand-accent/5 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            قيمنا الأساسية
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            تقديرنا وقيمنا
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Our Values & Principles
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            ما نؤمن به وما نطوره من أجلك
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            What we believe in and what we develop for you
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-brand-accent/50 transition-all shadow-lg group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <value.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              <h3 className="font-arabic font-bold text-2xl text-gray-900 mb-2">
                {value.title}
              </h3>
              <h4 className="font-english font-semibold text-base text-gray-700 mb-4">
                {value.titleEn}
              </h4>
              
              <p className="font-arabic text-sm text-gray-600 leading-relaxed mb-2">
                {value.description}
              </p>
              <p className="font-english text-xs text-gray-500 leading-relaxed">
                {value.descriptionEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Commitment Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 rounded-3xl p-12 border-4 border-brand-accent/20 text-center">
            <h3 className="font-arabic font-bold text-3xl text-gray-900 mb-6">
              التزامنا تجاهك
            </h3>
            <p className="font-english font-semibold text-xl text-gray-700 mb-8">
              Our Commitment to You
            </p>
            <p className="font-arabic text-lg text-gray-700 leading-relaxed mb-4">
              في شاهين، نحن ملتزمون بتقديم قيمة حقيقية ودائمة لعملائنا. نجاحك هو نجاحنا، 
              ونحن هنا لدعمك في كل خطوة على الطريق
            </p>
            <p className="font-english text-base text-gray-600 leading-relaxed">
              At Shahin, we are committed to delivering real, lasting value to our clients. 
              Your success is our success, and we're here to support you every step of the way
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default UnifiedValueSection
