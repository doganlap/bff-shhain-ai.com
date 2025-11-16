import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Globe, Phone, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const DemoAccessForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    jobTitle: '',
    country: 'Saudi Arabia',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
    'Egypt', 'Jordan', 'Lebanon', 'Other'
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store visitor info in session storage
    sessionStorage.setItem('demoVisitor', JSON.stringify({
      ...formData,
      accessTime: new Date().toISOString(),
      sessionId: `demo_${Date.now()}`
    }));

    // Simulate brief loading
    setTimeout(() => {
      navigate('/demo-kit');
    }, 1000);
  };

  const isFormValid = formData.fullName && formData.email && formData.company;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-purple-500/20 backdrop-blur-xl rounded-full border border-purple-500/30 px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-semibold">وصول فوري للعرض التوضيحي | Instant Demo Access</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ابدأ رحلتك التجريبية
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Start Your Demo Journey
            </p>
            <p className="text-gray-400">
              املأ البيانات أدناه للوصول الفوري إلى جميع ميزات المنصة
            </p>
            <p className="text-gray-400 text-sm">
              Fill in your details below for instant access to all platform features
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-white font-semibold mb-2 text-right">
                  الاسم الكامل | Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="أحمد محمد | Ahmed Mohammed"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2 text-right">
                  البريد الإلكتروني | Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="ahmed@company.com"
                    required
                  />
                </div>
              </div>

              {/* Company & Job Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-right">
                    الشركة | Company *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 text-right">
                    المسمى الوظيفي | Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="Job Title"
                  />
                </div>
              </div>

              {/* Country & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-right">
                    الدولة | Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    >
                      {countries.map(country => (
                        <option key={country} value={country} className="bg-gray-800">
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 text-right">
                    رقم الهاتف | Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      placeholder="+966 5X XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* What You'll Get */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 text-right">
                  ما ستحصل عليه | What You&apos;ll Get:
                </h3>
                <ul className="space-y-3">
                  {[
                    { ar: 'وصول كامل لجميع الميزات', en: 'Full access to all features' },
                    { ar: 'سيناريوهات تفاعلية متقدمة', en: 'Advanced interactive scenarios' },
                    { ar: 'بيانات تجريبية واقعية', en: 'Realistic demo data' },
                    { ar: 'تجربة الذكاء الاصطناعي', en: 'AI-powered experience' }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center text-white">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 ml-3 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="block text-right">{item.ar}</span>
                        <span className="block text-left text-sm text-gray-300">{item.en}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <span>ابدأ العرض التوضيحي الآن</span>
                    <ArrowRight className="w-6 h-6" />
                    <span>Start Demo Now</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/paths')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← العودة للخيارات | Back to Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAccessForm;
