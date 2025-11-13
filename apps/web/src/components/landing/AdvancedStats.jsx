import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, CheckCircle, Zap, Award, Globe, Shield, BarChart3 } from 'lucide-react'

const AdvancedStats = () => {
  const mainStats = [
    {
      icon: TrendingUp,
      number: '97%',
      label: 'رضا العملاء',
      labelEn: 'Customer Satisfaction',
      color: 'from-green-500 to-emerald-600',
      change: '+5% YoY'
    },
    {
      icon: Users,
      number: '500+',
      label: 'منظمة عالمية',
      labelEn: 'Global Organizations',
      color: 'from-blue-500 to-cyan-600',
      change: '+150 New'
    },
    {
      icon: Zap,
      number: '70%',
      label: 'توفير الوقت',
      labelEn: 'Time Saved',
      color: 'from-amber-500 to-orange-600',
      change: 'Avg Reduction'
    },
    {
      icon: Shield,
      number: '99.9%',
      label: 'موثوقية النظام',
      labelEn: 'System Uptime',
      color: 'from-purple-500 to-pink-600',
      change: 'Availability'
    },
    {
      icon: CheckCircle,
      number: '45+',
      label: 'دولة نشطة',
      labelEn: 'Active Countries',
      color: 'from-indigo-500 to-blue-600',
      change: 'Worldwide'
    },
    {
      icon: Award,
      number: '25+',
      label: 'جائزة دولية',
      labelEn: 'International Awards',
      color: 'from-rose-500 to-red-600',
      change: 'Recognition'
    }
  ]

  const detailedMetrics = [
    { label: 'تقييمات مكتملة', labelEn: 'Assessments Completed', value: '12,500+', trend: '+18%' },
    { label: 'ضوابط تم تقييمها', labelEn: 'Controls Assessed', value: '8.2M+', trend: '+25%' },
    { label: 'ساعة تدريب', labelEn: 'Training Hours', value: '50K+', trend: '+12%' },
    { label: 'شهادة ISO', labelEn: 'ISO Certifications', value: '450+', trend: '+30%' }
  ]

  return (
    <section id="advanced-stats" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            الإحصائيات المتقدمة
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            أرقام تتحدث عن نفسها
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Numbers That Speak for Themselves
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            نتائج ملموسة وحقيقية من عملائنا في جميع أنحاء العالم
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Real, tangible results from our clients worldwide
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mainStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/30 dark:border-gray-700/50 hover:border-brand-accent/50 transition-all shadow-xl hover:shadow-2xl group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
              }}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform relative z-10`}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <stat.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              
              <div className="relative z-10">
                <div className="text-5xl font-bold bg-gradient-to-r from-brand-accent to-brand-gold bg-clip-text text-transparent mb-3">
                  {stat.number}
                </div>
                <div className="font-arabic font-bold text-lg text-gray-900 mb-1">{stat.label}</div>
                <div className="font-english text-xs text-gray-500 mb-3">{stat.labelEn}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2} />
                  <span className="font-english text-xs text-green-700 font-semibold">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 rounded-3xl p-12 border-4 border-brand-accent/20"
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <BarChart3 className="w-8 h-8 text-brand-primary" strokeWidth={2} />
            <h3 className="font-arabic font-bold text-3xl text-gray-900">
              مقاييس إضافية للإنجازات
            </h3>
          </div>
          <h4 className="font-english font-semibold text-xl text-center text-gray-700 mb-12">
            Additional Performance Metrics
          </h4>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {detailedMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">{metric.value}</div>
                <div className="font-arabic font-semibold text-sm text-gray-900 mb-1">{metric.label}</div>
                <div className="font-english text-xs text-gray-500 mb-3">{metric.labelEn}</div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3" strokeWidth={2} />
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Impact Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
            <div className="text-5xl font-bold text-brand-accent mb-3">50M+</div>
            <div className="font-arabic font-bold text-gray-900 mb-1">ضابط تم مراجعته</div>
            <div className="font-english text-sm text-gray-500">Controls Reviewed</div>
          </div>
          
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
            <div className="text-5xl font-bold text-brand-primary mb-3">$2.5B+</div>
            <div className="font-arabic font-bold text-gray-900 mb-1">توفير في التكاليف</div>
            <div className="font-english text-sm text-gray-500">Cost Savings</div>
          </div>
          
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
            <div className="text-5xl font-bold text-purple-600 mb-3">1.2M+</div>
            <div className="font-arabic font-bold text-gray-900 mb-1">ساعة عمل محفوظة</div>
            <div className="font-english text-sm text-gray-500">Hours Saved</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AdvancedStats
