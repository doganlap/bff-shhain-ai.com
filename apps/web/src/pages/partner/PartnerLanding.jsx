import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, TrendingUp, Award } from 'lucide-react';

/**
 * Partner Landing Page - Entry point for partner access
 * Route: /partner
 */
const PartnerLanding = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Shield,
      title: 'منصة آمنة وموثوقة',
      description: 'بنية تحتية متقدمة مع أعلى معايير الأمان'
    },
    {
      icon: Users,
      title: 'إدارة عملاء متعددين',
      description: 'تدير جميع عملائك من لوحة تحكم واحدة'
    },
    {
      icon: TrendingUp,
      title: 'نمو مشترك',
      description: 'نماذج دخل متنوعة ودعم مستمر'
    },
    {
      icon: Award,
      title: 'دعم متخصص',
      description: 'فريق مخصص لدعم نجاح شراكتك'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700/30 border border-blue-500/50 rounded-full text-blue-200 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>منصة الشركاء</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            انضم لشبكة شركاء شاهين
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            كن جزءًا من منظومة رائدة في مجال الحوكمة والامتثال، ووفر حلولنا المتطورة لعملائك
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-blue-200 text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
          <h2 className="text-3xl font-bold mb-4">
            لديك حساب شريك بالفعل؟
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            سجل دخولك لإدارة عملائك والوصول إلى لوحة التحكم الخاصة بك
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/partner/login')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              تواصل معنا للشراكة
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerLanding;
