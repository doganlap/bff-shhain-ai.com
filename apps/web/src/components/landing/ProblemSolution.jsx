import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Zap, Clock, DollarSign, FileText, Coffee, Moon, TrendingDown, TrendingUp, Target } from 'lucide-react'

const ProblemSolution = () => {
  const problems = [
    { icon: Clock, text: 'وقت طويل في التقييمات اليدوية', textEn: 'Time-consuming manual assessments', color: 'from-red-500 to-red-700' },
    { icon: DollarSign, text: 'تكاليف باهظة للمستشارين الخارجيين', textEn: 'High costs for external consultants', color: 'from-orange-500 to-orange-700' },
    { icon: FileText, text: 'كثرة الأوراق والمستندات المتناثرة', textEn: 'Piles of scattered papers and documents', color: 'from-yellow-500 to-yellow-700' },
    { icon: Coffee, text: 'ليالي وعطلات نهاية أسبوع ضائعة', textEn: 'Lost nights and weekends', color: 'from-purple-500 to-purple-700' },
    { icon: Moon, text: 'إرهاق لفريق الامتثال', textEn: 'Compliance team exhaustion', color: 'from-indigo-500 to-indigo-700' },
    { icon: TrendingDown, text: 'انخفاض الكفاءة والإنتاجية', textEn: 'Decreased efficiency and productivity', color: 'from-pink-500 to-pink-700' }
  ]

  const solutions = [
    { icon: Zap, text: 'تقييمات سريعة بالذكاء الاصطناعي', textEn: 'Fast AI-powered assessments', color: 'from-green-500 to-green-700', benefit: '70% وقت أقل' },
    { icon: DollarSign, text: 'توفير كبير في التكاليف', textEn: 'Significant cost savings', color: 'from-emerald-500 to-emerald-700', benefit: '50% توفير' },
    { icon: Target, text: 'نظام موحد ومنظم', textEn: 'Unified and organized system', color: 'from-blue-500 to-blue-700', benefit: '100% تنظيم' },
    { icon: CheckCircle, text: 'امتثال كامل وضمان', textEn: 'Full compliance guarantee', color: 'from-teal-500 to-teal-700', benefit: 'تأكيد 100%' },
    { icon: TrendingUp, text: 'زيادة الإنتاجية والكفاءة', textEn: 'Increased productivity and efficiency', color: 'from-cyan-500 to-cyan-700', benefit: '80% إنتاجية' },
    { icon: Clock, text: 'استعادة وقت القيمة', textEn: 'Reclaim valuable time', color: 'from-lime-500 to-lime-700', benefit: 'ليالي حرة' }
  ]

  return (
    <section id="problem-solution" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            التحدي والحل
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            المشكلة التي نواجهها والحل الذي نقدمه
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            The Problem We Face & The Solution We Provide
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            من التحديات اليومية إلى الحلول الاستثنائية
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            From daily challenges to exceptional solutions
          </p>
        </motion.div>

        {/* Problems Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2} />
            <h3 className="font-arabic font-bold text-3xl text-gray-900">
              المشاكل التقليدية
            </h3>
          </div>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Traditional Problems
          </h4>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-400 transition-all shadow-lg"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <problem.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <h5 className="font-arabic font-bold text-lg text-gray-900 mb-2">{problem.text}</h5>
                <p className="font-english text-sm text-gray-600">{problem.textEn}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="w-3 h-3 bg-brand-accent rounded-full"></div>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Solutions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <CheckCircle className="w-8 h-8 text-green-600" strokeWidth={2} />
            <h3 className="font-arabic font-bold text-3xl text-gray-900">
              الحلول الاستثنائية مع شاهين
            </h3>
          </div>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Exceptional Solutions with Shahin
          </h4>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all shadow-lg hover:shadow-xl group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <solution.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold mb-3">
                  {solution.benefit}
                </div>
                <h5 className="font-arabic font-bold text-lg text-gray-900 mb-2">{solution.text}</h5>
                <p className="font-english text-sm text-gray-600">{solution.textEn}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl p-12 text-white">
            <h3 className="font-arabic font-bold text-3xl mb-4">
              حان الوقت للتغيير
            </h3>
            <p className="font-english text-xl mb-8 opacity-90">
              It&apos;s Time for Change
            </p>
            <p className="font-arabic text-lg max-w-3xl mx-auto mb-8">
              انضم إلى مئات المنظمات التي حولت تحدياتها إلى نجاحات مع شاهين
            </p>
            <p className="font-english text-base max-w-3xl mx-auto mb-12 opacity-90">
              Join hundreds of organizations that transformed their challenges into successes with Shahin
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProblemSolution
