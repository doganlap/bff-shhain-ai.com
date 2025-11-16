import React from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, Shield, Zap, BarChart3, FileText, Users, Globe, Lock,
  Smartphone, Clock, Layers, Settings
} from 'lucide-react'

const KeyFeatures = () => {
  const features = [
    {
      icon: Cpu,
      title: 'الذكاء الاصطناعي المتقدم',
      titleEn: 'Advanced AI',
      description: 'استخدم الذكاء الاصطناعي لتسريع التقييمات وجعل الامتثال أبسط',
      descriptionEn: 'Leverage AI to accelerate assessments and make compliance simpler',
      color: 'from-purple-500 to-pink-600',
      stats: '70% Faster'
    },
    {
      icon: Shield,
      title: 'ضوابط شاملة',
      titleEn: 'Comprehensive Controls',
      description: 'اكثر من 3,200 ضابط جاهز تغطي جميع الإطارات السائدة',
      descriptionEn: 'Over 3,200 pre-loaded controls covering all major frameworks',
      color: 'from-blue-500 to-cyan-600',
      stats: '3,200+'
    },
    {
      icon: Globe,
      title: 'دعم عربي كامل',
      titleEn: 'Full Arabic Support',
      description: 'واجهة بالكامل بالعربية مع دعم ثنائي اللغة في كل مكان',
      descriptionEn: 'Fully Arabic interface with bilingual support everywhere',
      color: 'from-green-500 to-emerald-600',
      stats: '100%'
    },
    {
      icon: BarChart3,
      title: 'لوحات معلومات ذكية',
      titleEn: 'Smart Dashboards',
      description: 'تتبع حالة الامتثال في الوقت الفعلي مع الرؤى القابلة للتنفيذ',
      descriptionEn: 'Track compliance status in real-time with actionable insights',
      color: 'from-amber-500 to-orange-600',
      stats: 'Real-Time'
    },
    {
      icon: Users,
      title: 'تعاون الفريق',
      titleEn: 'Team Collaboration',
      description: 'تعمل الفرق معاً بكفاءة أكبر بفضل أدوات التعاون المتقدمة',
      descriptionEn: 'Teams work together more efficiently with advanced collaboration tools',
      color: 'from-indigo-500 to-blue-600',
      stats: 'Unlimited'
    },
    {
      icon: FileText,
      title: 'تقارير تلقائية',
      titleEn: 'Automated Reports',
      description: 'انشئ تقارير احترافية تلقائياً في أي وقت تريده',
      descriptionEn: 'Generate professional reports automatically whenever you need',
      color: 'from-rose-500 to-red-600',
      stats: 'Auto-Gen'
    },
    {
      icon: Zap,
      title: 'بدء سريع',
      titleEn: 'Quick Start',
      description: 'ابدأ في دقائق معدودة باستخدام القوالب الجاهزة',
      descriptionEn: 'Get started in minutes with pre-built templates',
      color: 'from-yellow-500 to-amber-600',
      stats: '< 5 Min'
    },
    {
      icon: Lock,
      title: 'أمان من الدرجة الأولى',
      titleEn: 'Enterprise Security',
      description: 'حماية البيانات بأعلى معايير الأمان العالمية',
      descriptionEn: 'Protect your data with world-class security standards',
      color: 'from-gray-700 to-gray-900',
      stats: 'ISO 27001'
    },
    {
      icon: Smartphone,
      title: 'دعم متعدد المنصات',
      titleEn: 'Cross-Platform',
      description: 'استخدم النظام على أي جهاز - سطح المكتب، الجهاز اللوحي، أو الهاتف',
      descriptionEn: 'Use the system on any device - desktop, tablet, or mobile',
      color: 'from-teal-500 to-cyan-600',
      stats: 'All Devices'
    },
    {
      icon: Clock,
      title: 'تحديثات مستمرة',
      titleEn: 'Continuous Updates',
      description: 'تحديثات تلقائية للضوابط والإطارات الجديدة',
      descriptionEn: 'Automatic updates for new controls and frameworks',
      color: 'from-violet-500 to-purple-600',
      stats: 'Always Fresh'
    },
    {
      icon: Layers,
      title: 'إطارات متعددة',
      titleEn: 'Multiple Frameworks',
      description: 'ادمج عدة إطارات في تقييم واحد متكامل',
      descriptionEn: 'Integrate multiple frameworks in one unified assessment',
      color: 'from-emerald-500 to-teal-600',
      stats: 'All-in-One'
    },
    {
      icon: Settings,
      title: 'قابل للتخصيص بالكامل',
      titleEn: 'Fully Customizable',
      description: 'خصص النظام وفقاً لاحتياجاتك الخاصة',
      descriptionEn: 'Customize the system according to your specific needs',
      color: 'from-slate-500 to-gray-600',
      stats: 'Flexible'
    }
  ]

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            الميزات الرئيسية
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            الميزات الرئيسية
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Key Features
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            منصة شاملة تجمع بين القوة والسهولة لتحقيق الحوكمة والامتثال المثالي
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            A comprehensive platform that combines power and simplicity for ideal governance and compliance
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/30 dark:border-gray-700/50 hover:border-brand-accent/50 transition-all shadow-xl hover:shadow-2xl group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
              }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <feature.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 mb-4">
                {feature.stats}
              </div>
              <h3 className="font-arabic font-bold text-xl text-gray-900 mb-2">
                {feature.title}
              </h3>
              <h4 className="font-english font-semibold text-sm text-gray-600 mb-4">
                {feature.titleEn}
              </h4>
              <p className="font-arabic text-sm text-gray-600 leading-relaxed mb-2">
                {feature.description}
              </p>
              <p className="font-english text-xs text-gray-500 leading-relaxed">
                {feature.descriptionEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KeyFeatures
