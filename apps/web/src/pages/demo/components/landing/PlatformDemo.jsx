import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, CheckCircle, FileText, Upload, BarChart3, Shield, Zap, Cpu, BookOpen, AlertTriangle, Users, Settings, Monitor } from 'lucide-react'

const PlatformDemo = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const demos = [
    { 
      id: 1,
      title: 'Assessment Creation', 
      ar: 'إنشاء التقييم',
      icon: FileText,
      description: 'Create new compliance assessment in seconds',
      descriptionAr: 'إنشاء تقييم امتثال جديد في ثوانٍ',
      steps: [
        { step: 1, ar: 'اختر الإطار', en: 'Select Framework', action: 'NCA ECC v2.0' },
        { step: 2, ar: 'حدد النطاق', en: 'Define Scope', action: '114 Controls' },
        { step: 3, ar: 'عيّن الفريق', en: 'Assign Team', action: '3 Members' },
        { step: 4, ar: 'ابدأ التقييم', en: 'Start Assessment', action: 'Ready' }
      ],
      color: 'from-blue-500 to-blue-700'
    },
    { 
      id: 2,
      title: 'AI-Powered Assessment', 
      ar: 'التقييم بالذكاء الاصطناعي',
      icon: Shield,
      description: 'Answer questions with AI assistance',
      descriptionAr: 'إجابة الأسئلة بمساعدة الذكاء الاصطناعي',
      steps: [
        { step: 1, ar: 'اقرأ السؤال', en: 'Read Question', action: 'Control A.8.1' },
        { step: 2, ar: 'استعن بالذكاء الاصطناعي', en: 'Ask AI', action: 'AI Suggests Answer' },
        { step: 3, ar: 'راجع الإجابة', en: 'Review Answer', action: 'Compliant' },
        { step: 4, ar: 'احفظ وانتقل', en: 'Save & Next', action: 'Automated' }
      ],
      color: 'from-purple-500 to-purple-700'
    },
    { 
      id: 3,
      title: 'Evidence Upload', 
      ar: 'رفع الأدلة',
      icon: Upload,
      description: 'Upload evidence documents automatically',
      descriptionAr: 'رفع مستندات الأدلة تلقائياً',
      steps: [
        { step: 1, ar: 'اسحب المستند', en: 'Drag Document', action: 'PDF, DOCX' },
        { step: 2, ar: 'تصنيف تلقائي', en: 'Auto-Classify', action: 'AI Tags' },
        { step: 3, ar: 'ربط بالضوابط', en: 'Link to Controls', action: 'Auto-Match' },
        { step: 4, ar: 'حفظ ومزامنة', en: 'Save & Sync', action: 'Cloud Storage' }
      ],
      color: 'from-emerald-500 to-emerald-700'
    },
    { 
      id: 4,
      title: 'Reports & Analytics', 
      ar: 'التقارير والتحليلات',
      icon: BarChart3,
      description: 'Generate compliance reports instantly',
      descriptionAr: 'إنشاء تقارير الامتثال فوراً',
      steps: [
        { step: 1, ar: 'اختر نوع التقرير', en: 'Select Report Type', action: 'Executive Summary' },
        { step: 2, ar: 'حدد الفترة', en: 'Select Period', action: 'Q4 2025' },
        { step: 3, ar: 'إنشاء تلقائي', en: 'Auto-Generate', action: 'AI Creates Report' },
        { step: 4, ar: 'تصدير ومشاركة', en: 'Export & Share', action: 'PDF, Excel, PPT' }
      ],
      color: 'from-amber-500 to-amber-700'
    },
    { 
      id: 5,
      title: 'Risk Management', 
      ar: 'إدارة المخاطر',
      icon: AlertTriangle,
      description: 'Identify and manage compliance risks',
      descriptionAr: 'تحديد وإدارة مخاطر الامتثال',
      steps: [
        { step: 1, ar: 'تحليل التقييم', en: 'Analyze Assessment', action: 'Risk Detection' },
        { step: 2, ar: 'تصنيف المخاطر', en: 'Categorize Risks', action: 'High/Medium/Low' },
        { step: 3, ar: 'وضع خطة العلاج', en: 'Create Mitigation', action: 'Action Items' },
        { step: 4, ar: 'مراقبة مستمرة', en: 'Monitor Progress', action: 'Real-time Tracking' }
      ],
      color: 'from-red-500 to-orange-700'
    },
    { 
      id: 6,
      title: 'Frameworks Library', 
      ar: 'مكتبة الأطر',
      icon: BookOpen,
      description: 'Access comprehensive compliance frameworks',
      descriptionAr: 'الوصول إلى أطر الامتثال الشاملة',
      steps: [
        { step: 1, ar: 'تصفح المكتبة', en: 'Browse Library', action: 'NCA, SAMA, PDPL' },
        { step: 2, ar: 'اختر الإطار', en: 'Select Framework', action: '114 Controls' },
        { step: 3, ar: 'استيراد تلقائي', en: 'Auto-Import', action: 'Pre-built Templates' },
        { step: 4, ar: 'تخصيص حسب الحاجة', en: 'Customize', action: 'Tailored Setup' }
      ],
      color: 'from-indigo-500 to-purple-700'
    },
    { 
      id: 7,
      title: 'Team Collaboration', 
      ar: 'التعاون مع الفريق',
      icon: Users,
      description: 'Work together seamlessly on assessments',
      descriptionAr: 'العمل معاً بسلاسة على التقييمات',
      steps: [
        { step: 1, ar: 'إضافة أعضاء', en: 'Add Members', action: 'Assign Roles' },
        { step: 2, ar: 'توزيع المهام', en: 'Distribute Tasks', action: 'Auto-Assignment' },
        { step: 3, ar: 'تتبع التقدم', en: 'Track Progress', action: 'Real-time Updates' },
        { step: 4, ar: 'مراجعة مشتركة', en: 'Collaborative Review', action: 'Team Approval' }
      ],
      color: 'from-cyan-500 to-blue-700'
    },
    { 
      id: 8,
      title: 'Dashboard & Monitoring', 
      ar: 'لوحة التحكم والمراقبة',
      icon: Monitor,
      description: 'Real-time insights and analytics',
      descriptionAr: 'رؤى وتحليلات في الوقت الفعلي',
      steps: [
        { step: 1, ar: 'مراقبة شاملة', en: 'Full Visibility', action: 'KPIs & Metrics' },
        { step: 2, ar: 'تنبيهات فورية', en: 'Instant Alerts', action: 'Auto Notifications' },
        { step: 3, ar: 'تقارير تلقائية', en: 'Auto Reports', action: 'Scheduled Updates' },
        { step: 4, ar: 'تحليلات متقدمة', en: 'Advanced Analytics', action: 'AI Insights' }
      ],
      color: 'from-teal-500 to-green-700'
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demos.length)
    setIsPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demos.length) % demos.length)
    setIsPlaying(false)
  }

  const currentDemo = demos[currentSlide]

  return (
    <section id="platform-demo" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Digital Visual Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          {/* Connection Arrow from Transformation Story */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 w-1 h-16 bg-gradient-to-t from-purple-500 to-blue-500"
          />
          
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
            جولة تفاعلية - بعد رحلة التحول
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            شاهد منصة شاهين في العمل
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-4">
            See Shahin GRC in Action
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            بعد أن رأيت كيف يتحول الفوضى إلى نظام - شاهد كيف تعمل المنصة فعلياً في 8 صفحات تفاعلية
          </p>
          <p className="font-english text-sm text-gray-500 mt-2">
            After seeing the transformation - See how the platform actually works in 8 interactive pages
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Interactive Demo Viewer */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 relative">
            {/* Floating Icons Around Demo */}
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-xl animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl animate-pulse animation-delay-1000">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-xl animate-pulse animation-delay-2000">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            {/* Demo Header */}
            <div className={`bg-gradient-to-r ${currentDemo.color} text-white px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <currentDemo.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-arabic font-bold text-2xl mb-1">{currentDemo.ar}</h4>
                    <p className="font-english text-sm opacity-90">{currentDemo.title}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {currentSlide + 1}/{demos.length}
                </div>
              </div>
            </div>

            {/* Demo Content - Step-by-Step Process */}
            <div className="p-8">
              <div className="mb-6">
                <p className="font-arabic text-gray-700 mb-2 leading-relaxed">{currentDemo.descriptionAr}</p>
                <p className="font-english text-sm text-gray-500">{currentDemo.description}</p>
              </div>

              {/* Process Steps */}
              <div className="space-y-4">
                {currentDemo.steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentDemo.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-arabic font-bold text-base text-gray-900 mb-1">
                        {step.ar}
                      </div>
                      <div className="font-english text-sm text-gray-600">
                        {step.en}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-english text-sm font-semibold px-4 py-2 bg-gradient-to-r ${currentDemo.color} text-white rounded-lg`}>
                        {step.action}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cycle Complete Badge */}
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="font-arabic font-bold text-lg text-emerald-900 mb-2">
                  دورة كاملة للامتثال في دقائق
                </p>
                <p className="font-english text-sm text-emerald-700">
                  Complete Compliance Cycle in Minutes
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="bg-gray-50 px-8 py-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevSlide}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-brand-primary transition-all shadow-md"
                >
                  <ChevronRight className="w-5 h-5 text-brand-primary" />
                  <span className="font-arabic font-semibold text-sm">السابق</span>
                </button>

                {/* Slide Indicators with Labels */}
                <div className="flex gap-3">
                  {demos.map((demo, index) => (
                    <button
                      key={index}
                      onClick={() => { setCurrentSlide(index); setIsPlaying(false); }}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                        index === currentSlide
                          ? 'bg-gradient-to-r ' + currentDemo.color + ' text-white scale-110'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <demo.icon className="w-5 h-5" strokeWidth={2} />
                      <span className="text-[10px] font-arabic font-semibold">{demo.ar.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-brand-primary transition-all shadow-md"
                >
                  <span className="font-arabic font-semibold text-sm">التالي</span>
                  <ChevronLeft className="w-5 h-5 text-brand-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Full Cycle Summary */}
          <div className="mt-8 text-center">
            <p className="font-arabic text-gray-700 mb-2">
              <strong className="text-brand-primary">8 صفحات رئيسية</strong> تمثل النظام الكامل للحوكمة والامتثال من الألف إلى الياء
            </p>
            <p className="font-english text-sm text-gray-500">
              8 Major Pages Representing the Complete GRC System from Start to Finish
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlatformDemo

