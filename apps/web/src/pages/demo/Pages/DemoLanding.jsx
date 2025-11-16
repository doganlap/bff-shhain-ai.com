import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, Shield, Zap } from 'lucide-react';

/**
 * Demo Landing Page - Entry point for demo access
 * Route: /demo
 */
const DemoLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: 'تجربة فورية',
      description: 'احصل على وصول فوري خلال دقائق'
    },
    {
      icon: Shield,
      title: 'بيئة آمنة',
      description: 'بيانات تجريبية معزولة تمامًا'
    },
    {
      icon: Zap,
      title: 'كامل الميزات',
      description: 'تجربة جميع إمكانيات المنصة'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>تجربة مجانية - Demo</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            جرّب منصة شاهين مجانًا
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            احصل على وصول فوري لتجربة كاملة للمنصة مع بيانات تجريبية
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/demo/register')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-lg font-semibold text-lg hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            ابدأ التجربة المجانية
          </button>
          <p className="mt-4 text-sm text-gray-500">
            لا حاجة لبطاقة ائتمانية • وصول فوري • بيانات آمنة
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoLanding;
