import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, Star } from 'lucide-react';

/**
 * POC Landing Page - Entry point for Proof of Concept requests
 * Route: /poc
 */
const PocLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: 'بيئة مخصصة',
      description: 'بيئة POC منفصلة بالكامل لاحتياجاتك'
    },
    {
      icon: CheckCircle2,
      title: 'دعم متخصص',
      description: 'فريق هندسي مخصص لنجاح POC'
    },
    {
      icon: Clock,
      title: 'مدة مرنة',
      description: 'اختر المدة المناسبة لمتطلباتك'
    },
    {
      icon: Star,
      title: 'تكامل كامل',
      description: 'اختبار التكامل مع أنظمتك الحالية'
    }
  ];

  const whatYouGet = [
    'بيئة POC مخصصة على Azure أو AWS',
    'تكوين مخصص حسب متطلبات مؤسستك',
    'بيانات تجريبية مصممة لحالات الاستخدام الخاصة بك',
    'دعم هندسي مباشر طوال فترة POC',
    'جلسات تدريب وتقييم متخصصة',
    'تقارير مفصلة عن نتائج POC'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700/30 border border-purple-500/50 rounded-full text-purple-200 text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            <span>إثبات المفهوم - POC</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            اطلب بيئة POC مخصصة
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            اختبر منصة شاهين في بيئة مخصصة تناسب احتياجات مؤسستك تمامًا قبل اتخاذ قرار الشراء
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-purple-200 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* What You Get Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            ماذا ستحصل عليه في POC؟
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {whatYouGet.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-300 flex-shrink-0 mt-1" />
                <span className="text-purple-100">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => navigate('/poc/request')}
            className="inline-flex items-center gap-2 px-10 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xl transition-colors shadow-2xl"
          >
            <Briefcase className="w-6 h-6" />
            اطلب POC الآن
          </button>
          <p className="mt-6 text-purple-200">
            سيقوم فريقنا بمراجعة طلبك والرد خلال 48 ساعة عمل
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-purple-200 hover:text-white text-sm transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default PocLanding;
