import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UnifiedLogo from './UnifiedLogo'
import { 
  CloudOff, FileText, Users, AlertTriangle, Clock, DollarSign,
  Zap, Cpu, Shield, CheckCircle, Sparkles, TrendingUp,
  Layers, Filter, MapPin, Leaf, Briefcase, UserCheck, Building2,
  Coffee, Moon, Frown, Smile, Target, Award
} from 'lucide-react'

const TransformationStory = () => {
  const [activeChapter, setActiveChapter] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  // Auto-play through chapters
  React.useEffect(() => {
    if (isAutoPlay) {
      const timer = setInterval(() => {
        setActiveChapter((prev) => (prev + 1) % 4)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [isAutoPlay])

  const story = [
    {
      chapter: 1,
      title: 'الواقع المؤلم',
      titleEn: 'The Painful Reality',
      subtitle: 'يوم عادي في المكتب قبل شاهين',
      subtitleEn: 'A Normal Day at the Office Before Shahin',
      icon: Frown,
      color: 'from-gray-600 to-gray-800',
      bgGradient: 'from-gray-100 to-gray-300',
      visualState: 'storm',
      problems: [
        { icon: Coffee, text: 'موظف الامتثال يشرب القهوة الخامسة - الساعة 11 مساءً', textEn: 'Compliance officer on 5th coffee - 11 PM' },
        { icon: FileText, text: 'مكتبك ممتلئ بالملفات والأوراق المتناثرة في كل مكان', textEn: 'Your desk buried in files and papers everywhere' },
        { icon: Moon, text: 'ليالي طويلة وعطلات نهاية أسبوع ضائعة', textEn: 'Long nights and lost weekends' },
        { icon: AlertTriangle, text: 'مديرك يسأل: متى سينتهي التقييم؟ أنت لا تعرف', textEn: 'Your manager asks: when will assessment finish? You don\'t know' },
        { icon: DollarSign, text: 'الاستشاري الخارجي يكلف نصف ميزانيتك السنوية', textEn: 'External consultant costs half your annual budget' }
      ]
    },
    {
      chapter: 2,
      title: 'اليوم الأول مع شاهين',
      titleEn: 'First Day with Shahin',
      subtitle: 'صباح جديد - حل جديد',
      subtitleEn: 'New Morning - New Solution',
      icon: Sparkles,
      color: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      visualState: 'arrival',
      features: [
        { icon: UserCheck, text: 'تسجيل دخولك الأول - المنصة تستقبلك بالعربية', textEn: 'Your first login - Platform welcomes you in Arabic' },
        { icon: Target, text: 'تختار قطاعك - شاهين يُظهر فقط ما يخصك', textEn: 'Select your sector - Shahin shows only what\'s relevant to you' },
        { icon: Layers, text: 'كل الأطر السعودية جاهزة - بنقرة واحدة', textEn: 'All Saudi frameworks ready - One click away' },
        { icon: Cpu, text: 'الذكاء الاصطناعي يفهم سؤالك ويجيب فوراً', textEn: 'AI understands your question and answers instantly' },
        { icon: Smile, text: 'ترى النتائج خلال دقائق - تبتسم أخيراً', textEn: 'See results in minutes - You finally smile' }
      ]
    },
    {
      chapter: 3,
      title: 'أسبوعك الأول',
      titleEn: 'Your First Week',
      subtitle: 'شاهين يرتب كل شيء لك',
      subtitleEn: 'Shahin Organizes Everything for You',
      icon: Briefcase,
      color: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      visualState: 'mapping',
      smartFeatures: [
        { 
          icon: UserCheck, 
          title: 'اليوم 1: فريقك يسجل دخوله',
          titleEn: 'Day 1: Your Team Logs In',
          desc: 'كل شخص يرى مهامه بالعربي - واضحة ومباشرة',
          descEn: 'Everyone sees their tasks in Arabic - Clear and direct'
        },
        { 
          icon: Target, 
          title: 'اليوم 2: الذكاء الاصطناعي يساعدك',
          titleEn: 'Day 2: AI Assists You',
          desc: 'بدلاً من البحث لساعات، الذكاء الاصطناعي يجيب فوراً',
          descEn: 'Instead of hours of research, AI answers instantly'
        },
        { 
          icon: CheckCircle, 
          title: 'اليوم 3: أول تقييم مكتمل',
          titleEn: 'Day 3: First Assessment Complete',
          desc: 'ما كان يأخذ شهوراً، اكتمل في 3 أيام',
          descEn: 'What used to take months, completed in 3 days'
        },
        { 
          icon: Award, 
          title: 'اليوم 7: تقريرك جاهز',
          titleEn: 'Day 7: Your Report Ready',
          desc: 'تقرير تنفيذي جاهز للعرض على الإدارة',
          descEn: 'Executive report ready for management presentation'
        }
      ]
    },
    {
      chapter: 4,
      title: 'حياتك الجديدة',
      titleEn: 'Your New Life',
      subtitle: 'بعد شاهين - راحة بال وإنجاز',
      subtitleEn: 'After Shahin - Peace of Mind & Achievement',
      icon: Smile,
      color: 'from-emerald-600 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      visualState: 'transformation',
      results: [
        { icon: Smile, metric: 'الساعة 5', label: 'تخرج من المكتب', labelEn: 'Leave Office at 5 PM', color: 'emerald', subtext: 'مو 11 مساءً' },
        { icon: Coffee, metric: 'قهوة واحدة', label: 'في اليوم', labelEn: 'Per Day', color: 'amber', subtext: 'مو 5' },
        { icon: Users, metric: 'فريقك', label: 'مبسوط ومرتاح', labelEn: 'Your Team Happy', color: 'blue', subtext: '95% رضا' },
        { icon: Award, metric: 'مديرك', label: 'راضي عن النتائج', labelEn: 'Manager Satisfied', color: 'purple', subtext: 'ترقية قريبة؟' },
        { icon: Building2, metric: 'مؤسستك', label: 'ملتزمة ومتميزة', labelEn: 'Compliant & Excellent', color: 'green', subtext: '87% امتثال' }
      ]
    }
  ]

  const currentChapter = story[activeChapter]

  return (
    <section id="transformation" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated Background with Digital Visual Content */}
      <div className="absolute inset-0 opacity-30 overflow-hidden">
        {/* Chapter 1: Storm Visual - Flying Papers */}
        {activeChapter === 0 && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 bg-gray-300 rounded opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -200, 200, 0],
                  x: [0, Math.random() * 100 - 50, 0],
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                <FileText className="w-full h-full text-gray-400" />
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-600 to-transparent"
            />
          </>
        )}

        {/* Chapter 2: Falcon Descending */}
        {activeChapter === 1 && (
          <>
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 2 }}
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl"
                >
                  🦅
                </motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-300 rounded-full blur-3xl -z-10"
                />
              </div>
            </motion.div>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{
                  left: `${50 + Math.random() * 40 - 20}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                animate={{
                  y: [0, -30],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </>
        )}

        {/* Chapter 3: Mapping Lines */}
        {activeChapter === 2 && (
          <>
            {[...Array(8)].map((_, i) => {
              const x1 = 20 + Math.random() * 60;
              const y1 = 20 + Math.random() * 60;
              const x2 = 20 + Math.random() * 60;
              const y2 = 20 + Math.random() * 60;
              return (
                <motion.svg
                  key={i}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  <motion.line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#9333ea"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.circle
                    cx={`${x1}%`}
                    cy={`${y1}%`}
                    r="4"
                    fill="#9333ea"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.circle
                    cx={`${x2}%`}
                    cy={`${y2}%`}
                    r="4"
                    fill="#9333ea"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  />
                </motion.svg>
              );
            })}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-64 h-64 border-4 border-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
          </>
        )}

        {/* Chapter 4: Growing Plants */}
        {activeChapter === 3 && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${60 + Math.floor(i / 4) * 20}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.8],
                  y: [20, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                🌱
              </motion.div>
            ))}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-b from-emerald-200 via-green-200 to-emerald-100"
            />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-block bg-gradient-to-r from-brand-accent via-purple-600 to-brand-gold text-white px-8 py-3 rounded-full text-base font-bold mb-6 shadow-2xl"
            animate={{ 
              boxShadow: [
                '0 10px 30px rgba(217, 119, 6, 0.3)',
                '0 10px 40px rgba(147, 51, 234, 0.4)',
                '0 10px 30px rgba(217, 119, 6, 0.3)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            قصة حقيقية - معرض تفاعلي
          </motion.div>
          <motion.h2 
            className="font-arabic font-bold text-5xl lg:text-7xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #9333ea 50%, #10b981 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            رحلة التحول
          </motion.h2>
          <h3 className="font-english font-semibold text-2xl lg:text-4xl text-gray-700 mb-4">
            Real Transformation Story
          </h3>
          <p className="font-arabic text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
            من ليالي طويلة وقهوة كثيرة إلى حياة متوازنة وإنجاز حقيقي
          </p>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-6 py-3 rounded-xl font-arabic font-bold transition-all ${
              isAutoPlay 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gradient-to-r from-brand-accent to-brand-gold text-white hover:shadow-xl'
            }`}
          >
            {isAutoPlay ? '⏸ إيقاف التشغيل التلقائي' : '▶ تشغيل تلقائي للقصة'}
          </button>
        </motion.div>

        {/* Chapter Selector */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {story.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setActiveChapter(index)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeChapter === index
                  ? `bg-gradient-to-r ${chapter.color} text-white shadow-lg scale-110`
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <chapter.icon className="w-5 h-5" strokeWidth={2} />
                <span className="font-arabic">{chapter.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Rotating Gallery - 3D Carousel Effect */}
        <div className="relative" style={{ perspective: '3000px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ 
                opacity: 0, 
                rotateY: 90,
                rotateX: -10,
                scale: 0.7,
                z: -500
              }}
              animate={{ 
                opacity: 1, 
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                z: 0
              }}
              exit={{ 
                opacity: 0, 
                rotateY: -90,
                rotateX: 10,
                scale: 0.7,
                z: -500
              }}
              transition={{ 
                duration: 1,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="max-w-5xl mx-auto"
              style={{ 
                transformStyle: 'preserve-3d',
              }}
            >
            <div 
              className={`bg-gradient-to-br ${currentChapter.bgGradient} rounded-3xl p-8 border-4 shadow-2xl`}
              style={{
                borderImage: `linear-gradient(135deg, ${
                  activeChapter === 0 ? '#9ca3af, #6b7280' :
                  activeChapter === 1 ? '#3b82f6, #9333ea' :
                  activeChapter === 2 ? '#9333ea, #6366f1' :
                  '#10b981, #059669'
                }) 1`,
                boxShadow: `0 20px 60px ${
                  activeChapter === 0 ? 'rgba(107, 114, 128, 0.4)' :
                  activeChapter === 1 ? 'rgba(59, 130, 246, 0.4)' :
                  activeChapter === 2 ? 'rgba(147, 51, 234, 0.4)' :
                  'rgba(16, 185, 129, 0.4)'
                }`
              }}
            >
              {/* Chapter Header with Cinematic Effect */}
              <div className="text-center mb-8 relative">
                {/* Animated Chapter Number */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-white to-gray-100 rounded-full border-4 border-brand-accent flex items-center justify-center text-2xl font-bold text-brand-accent shadow-xl"
                >
                  {activeChapter + 1}
                </motion.div>

                <motion.div 
                  className={`inline-block w-24 h-24 rounded-2xl bg-gradient-to-br ${currentChapter.color} flex items-center justify-center mb-6 shadow-2xl`}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <currentChapter.icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                </motion.div>

                <motion.h4 
                  className="font-arabic font-bold text-4xl text-gray-900 mb-2"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(0,0,0,0)',
                      '0 0 20px rgba(147,51,234,0.3)',
                      '0 0 20px rgba(0,0,0,0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentChapter.title}
                </motion.h4>
                <h5 className="font-english font-semibold text-2xl text-gray-700 mb-3">
                  {currentChapter.titleEn}
                </h5>
                <p className="font-arabic text-xl text-gray-800 mb-1 font-bold">{currentChapter.subtitle}</p>
                <p className="font-english text-base text-gray-600">{currentChapter.subtitleEn}</p>
                
                {/* Real Animation Scene */}
                <div className="relative h-48 my-8 bg-white/50 rounded-2xl overflow-hidden">
                  {/* Chapter 1 Animation: Office Chaos - Human Scene */}
                  {activeChapter === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                      {/* Desk with piles of papers */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-900 to-amber-800" />
                      
                      {/* Scattered papers on desk */}
                      {[...Array(25)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute bg-white shadow-md"
                          style={{
                            left: `${10 + Math.random() * 80}%`,
                            bottom: `${10 + Math.random() * 50}%`,
                            width: '40px',
                            height: '50px',
                            borderRadius: '4px'
                          }}
                          animate={{
                            rotate: [0, -5 + Math.random() * 10, 0],
                            y: [0, -3, 0]
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.05
                          }}
                        >
                          <div className="p-1">
                            <div className="w-full h-1 bg-gray-300 mb-1" />
                            <div className="w-3/4 h-1 bg-gray-200 mb-1" />
                            <div className="w-full h-1 bg-gray-300" />
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Coffee cup */}
                      <motion.div
                        className="absolute right-1/4 bottom-20"
                        animate={{
                          y: [0, -5, 0],
                          rotate: [0, 2, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Coffee className="w-12 h-12 text-amber-700" />
                      </motion.div>
                      
                      {/* Clock showing late time */}
                      <motion.div
                        className="absolute top-4 right-4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Clock className="w-10 h-10 text-red-600" />
                      </motion.div>
                    </div>
                  )}

                  {/* Chapter 2 Animation: Clean Office - Login Screen */}
                  {activeChapter === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      {/* Login Screen Mock */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-80 bg-white rounded-2xl shadow-2xl p-6 border-4 border-blue-500"
                      >
                        <div className="mb-6">
                          <UnifiedLogo size="small" variant="horizontal" />
                        </div>
                        
                        {/* Welcome Message */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-center mb-4"
                        >
                          <p className="font-arabic text-lg font-bold text-gray-800 mb-2">مرحباً بك</p>
                          <p className="font-arabic text-sm text-gray-600">منصتك جاهزة بالكامل</p>
                        </motion.div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <motion.div 
                            className="bg-blue-50 rounded-lg p-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 }}
                          >
                            <div className="text-xl font-bold text-blue-600">40+</div>
                            <div className="text-[8px] font-arabic text-gray-600">جهة</div>
                          </motion.div>
                          <motion.div 
                            className="bg-purple-50 rounded-lg p-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2 }}
                          >
                            <div className="text-xl font-bold text-purple-600">117</div>
                            <div className="text-[8px] font-arabic text-gray-600">إطار</div>
                          </motion.div>
                          <motion.div 
                            className="bg-emerald-50 rounded-lg p-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.4 }}
                          >
                            <div className="text-xl font-bold text-emerald-600">3.2K+</div>
                            <div className="text-[8px] font-arabic text-gray-600">ضابط</div>
                          </motion.div>
                        </div>
                      </motion.div>
                      
                      {/* Person silhouette at desk */}
                      <motion.div
                        className="absolute bottom-8 left-1/4"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Users className="w-16 h-16 text-blue-600/30" />
                      </motion.div>
                    </div>
                  )}

                  {/* Chapter 3 Animation: Network Mapping */}
                  {activeChapter === 2 && (
                    <svg className="absolute inset-0 w-full h-full">
                      {[...Array(12)].map((_, i) => {
                        const x = 20 + (i % 4) * 25;
                        const y = 30 + Math.floor(i / 4) * 35;
                        return (
                          <g key={i}>
                            <motion.circle
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="8"
                              fill="#9333ea"
                              initial={{ scale: 0 }}
                              animate={{ 
                                scale: [0, 1, 1.2, 1],
                                opacity: [0, 1, 1, 1]
                              }}
                              transition={{
                                duration: 0.5,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            />
                            {i < 11 && (
                              <motion.line
                                x1={`${x}%`}
                                y1={`${y}%`}
                                x2={`${20 + ((i + 1) % 4) * 25}%`}
                                y2={`${30 + Math.floor((i + 1) / 4) * 35}%`}
                                stroke="#9333ea"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: [0, 1] }}
                                transition={{
                                  duration: 1,
                                  delay: i * 0.1,
                                  repeat: Infinity,
                                  repeatDelay: 2
                                }}
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* Chapter 4 Animation: Happy Team at Office */}
                  {activeChapter === 3 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-100">
                      {/* Office building */}
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-3xl">
                        {/* Windows */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-8 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm"
                            style={{
                              left: `${10 + (i % 4) * 23}%`,
                              bottom: `${40 + Math.floor(i / 4) * 30}%`,
                            }}
                            animate={{
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.1
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Happy people leaving at 5 PM */}
                      <motion.div
                        className="absolute bottom-28 right-1/4"
                        animate={{
                          x: [0, 50],
                          opacity: [1, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <Users className="w-14 h-14 text-emerald-600" />
                      </motion.div>
                      
                      {/* Sun/Good mood indicator */}
                      <motion.div
                        className="absolute top-8 right-8"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Sparkles className="w-12 h-12 text-yellow-500" />
                      </motion.div>
                      
                      {/* Check marks floating */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${20 + Math.random() * 40}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                          }}
                        >
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Content */}
              <div className="bg-white rounded-2xl p-8">
                {/* Chapter 1: Problems */}
                {activeChapter === 0 && (
                  <div className="space-y-4">
                    {currentChapter.problems.map((problem, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                      >
                        <problem.icon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-arabic font-bold text-red-800 mb-1">{problem.text}</div>
                          <div className="font-english text-sm text-red-600">{problem.textEn}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Chapter 2: Shahin Arrives */}
                {activeChapter === 1 && (
                  <div className="space-y-4">
                    {currentChapter.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl"
                      >
                        <feature.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-arabic font-bold text-blue-900 mb-1">{feature.text}</div>
                          <div className="font-english text-sm text-blue-700">{feature.textEn}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Chapter 3: Smart Mapping */}
                {activeChapter === 2 && (
                  <div className="space-y-6">
                    {currentChapter.smartFeatures.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-2xl p-6"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <feature.icon className="w-6 h-6 text-white" strokeWidth={2} />
                          </div>
                          <div>
                            <h6 className="font-arabic font-bold text-lg text-purple-900">{feature.title}</h6>
                            <p className="font-english text-sm text-purple-700">{feature.titleEn}</p>
                          </div>
                        </div>
                        <p className="font-arabic text-gray-800 mb-2 leading-relaxed">{feature.desc}</p>
                        <p className="font-english text-sm text-gray-600">{feature.descEn}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Chapter 4: New Life - Human Results */}
                {activeChapter === 3 && (
                  <div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {currentChapter.results.map((result, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.15 }}
                          className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                        >
                          <result.icon className="w-10 h-10 text-emerald-600 mx-auto mb-3" strokeWidth={2} />
                          <div className="text-2xl font-bold text-gray-900 mb-1">{result.metric}</div>
                          <div className="font-arabic font-bold text-sm text-gray-800 mb-1">{result.label}</div>
                          <div className="font-english text-xs text-gray-600 mb-2">{result.labelEn}</div>
                          <div className="font-arabic text-xs text-brand-accent font-semibold">{result.subtext}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-400 rounded-2xl p-8 text-center">
                      <Smile className="w-16 h-16 text-emerald-600 mx-auto mb-4" strokeWidth={2} />
                      <p className="font-arabic font-bold text-2xl text-emerald-900 mb-3">
                        ارجع البيت الساعة 5 - عيش حياتك
                      </p>
                      <p className="font-english font-semibold text-lg text-emerald-700 mb-4">
                        Go Home at 5 PM - Live Your Life
                      </p>
                      <p className="font-arabic text-lg text-gray-800 leading-relaxed">
                        ما عاد فيه أوراق تتطاير. ما عاد فيه سهر لين الصباح. بس شغل منظم، وقت لعيلتك، ونتائج تفتخر فيها.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
            <div 
              className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r ${currentChapter.color} -translate-y-1/2 transition-all duration-500`}
              style={{ width: `${((activeChapter + 1) / story.length) * 100}%` }}
            ></div>
            {story.map((chapter, index) => (
              <button
                key={index}
                onClick={() => setActiveChapter(index)}
                className={`relative w-12 h-12 rounded-full border-4 transition-all ${
                  index <= activeChapter
                    ? `bg-gradient-to-br ${chapter.color} border-white shadow-lg`
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                <chapter.icon 
                  className={`w-6 h-6 mx-auto ${index <= activeChapter ? 'text-white' : 'text-gray-400'}`} 
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {story.map((chapter, index) => (
              <div key={index} className="text-center" style={{ width: '24%' }}>
                <p className="font-arabic text-xs text-gray-600 font-semibold">{chapter.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TransformationStory

