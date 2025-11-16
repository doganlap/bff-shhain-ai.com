import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, FlaskConical, LogIn, ArrowRight, CheckCircle2, Clock, Shield } from 'lucide-react';

const PathSelection = () => {
  const navigate = useNavigate();

  const paths = [
    {
      id: 'demo',
      title: 'تجربة العرض التوضيحي',
      titleEn: 'Try Interactive Demo',
      description: 'استكشف المنصة بالكامل مع بيانات تجريبية - وصول فوري بدون الحاجة لموافقة',
      descriptionEn: 'Explore the platform with demo data - Instant access, no approval needed',
      icon: Play,
      color: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-500/20 via-indigo-500/20 to-purple-500/20',
      features: [
        { ar: 'وصول فوري ومجاني', en: 'Instant free access' },
        { ar: 'جميع الميزات التفاعلية', en: 'All interactive features' },
        { ar: 'بيانات تجريبية كاملة', en: 'Complete demo data' },
        { ar: 'لا يتطلب موافقة', en: 'No approval required' }
      ],
      badge: { ar: 'مجاني', en: 'FREE', color: 'bg-green-500' },
      action: () => navigate('/demo-access'),
      buttonText: { ar: 'ابدأ العرض التوضيحي', en: 'Start Demo' }
    },
    {
      id: 'poc',
      title: 'بيئة إثبات المفهوم',
      titleEn: 'POC Environment',
      description: 'بيئة كاملة مع بياناتك التجريبية - يتطلب تقديم طلب وموافقة',
      descriptionEn: 'Full environment with your test data - Requires application and approval',
      icon: FlaskConical,
      color: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
      features: [
        { ar: 'بيئة كاملة مخصصة', en: 'Full dedicated environment' },
        { ar: 'بيانات تجريبية مخصصة', en: 'Custom test data' },
        { ar: 'دعم فني مباشر', en: 'Direct technical support' },
        { ar: 'يتطلب موافقة', en: 'Requires approval' }
      ],
      badge: { ar: 'يتطلب موافقة', en: 'APPROVAL REQUIRED', color: 'bg-orange-500' },
      action: () => navigate('/poc-request'),
      buttonText: { ar: 'تقديم طلب POC', en: 'Request POC' },
      disabled: true // Will implement later
    },
    {
      id: 'login',
      title: 'تسجيل الدخول',
      titleEn: 'Customer Login',
      description: 'للعملاء والشركاء الحاليين - الوصول إلى حسابك الفعلي',
      descriptionEn: 'For existing customers and partners - Access your real account',
      icon: LogIn,
      color: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
      features: [
        { ar: 'وصول كامل لحسابك', en: 'Full account access' },
        { ar: 'بياناتك الفعلية', en: 'Your real data' },
        { ar: 'جميع الميزات المدفوعة', en: 'All paid features' },
        { ar: 'دعم فني مخصص', en: 'Dedicated support' }
      ],
      badge: { ar: 'للعملاء', en: 'CUSTOMERS', color: 'bg-blue-600' },
      action: () => window.location.href = 'http://172.21.160.1:5174/login',
      buttonText: { ar: 'تسجيل الدخول', en: 'Sign In' }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            اختر طريقتك للبدء
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-2"
          >
            Choose Your Path to Get Started
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400"
          >
            اختر الخيار الأنسب لاحتياجاتك
          </motion.p>
        </div>

        {/* Path Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {paths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 ${
                path.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              }`}
              onClick={!path.disabled ? path.action : undefined}
            >
              {/* Badge */}
              <div className={`absolute top-6 right-6 ${path.badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {path.badge.ar}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${path.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <path.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2 text-right">
                {path.title}
              </h3>
              <p className="text-lg text-gray-300 mb-1 text-left">
                {path.titleEn}
              </p>

              {/* Description */}
              <p className="text-gray-300 mb-4 text-right text-sm leading-relaxed">
                {path.description}
              </p>
              <p className="text-gray-400 mb-6 text-left text-sm leading-relaxed">
                {path.descriptionEn}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {path.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 ml-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm block text-right">{feature.ar}</span>
                      <span className="text-xs text-gray-400 block text-left">{feature.en}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!path.disabled) path.action();
                }}
                disabled={path.disabled}
                className={`w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  path.disabled ? 'cursor-not-allowed opacity-50' : 'group-hover:gap-4'
                }`}
              >
                <span className="text-right flex-1">{path.buttonText.ar}</span>
                {path.disabled ? <Clock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>

              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${path.bgGradient} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity pointer-events-none`}></div>
            </motion.div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            ← العودة للصفحة الرئيسية | Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathSelection;
