import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';

/**
 * POC Request Form
 * Route: /poc/request
 * Submits POC request for manual approval
 */
const PocRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    sector: '',
    useCases: [],
    environmentPreference: 'azure-cloud',
    preferredStartDate: '',
    notes: ''
  });

  const sectors = [
    'BFSI', 'Healthcare', 'Government', 'Manufacturing',
    'Education', 'Retail', 'Technology', 'Energy', 'Other'
  ];

  const useCaseOptions = [
    { value: 'enterprise-grc', label: 'حوكمة مؤسسية شاملة' },
    { value: 'risk-register', label: 'سجل المخاطر' },
    { value: 'compliance-tracking', label: 'تتبع الامتثال' },
    { value: 'audit-management', label: 'إدارة التدقيق' },
    { value: 'regulators-reporting', label: 'التقارير التنظيمية' },
    { value: 'third-party-risk', label: 'مخاطر الطرف الثالث' }
  ];

  const environmentOptions = [
    { value: 'azure-cloud', label: 'Azure Cloud' },
    { value: 'aws-cloud', label: 'AWS Cloud' },
    { value: 'on-prem', label: 'On-Premises' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const handleUseCaseToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(value)
        ? prev.useCases.filter(v => v !== value)
        : [...prev.useCases, value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/public/poc/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit POC request');
      }

      const data = await response.json();
      setRequestId(data.requestId);
      setSubmitted(true);
      toast.success('تم إرسال طلب POC بنجاح!');

    } catch (error) {
      console.error('POC request error:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تم استلام طلبك بنجاح!
          </h1>
          <p className="text-gray-600 mb-2">
            رقم الطلب: <span className="font-mono text-purple-600">{requestId}</span>
          </p>
          <p className="text-gray-600 mb-8">
            سيقوم فريقنا بمراجعة طلبك والتواصل معك خلال 48 ساعة عمل
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              طلب إثبات المفهوم - POC
            </h1>
            <p className="text-gray-600">
              املأ التفاصيل أدناه وسنقوم بمراجعة طلبك والعودة إليك قريبًا
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="example@company.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الشركة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسم شركتك"
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القطاع <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">اختر القطاع</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                حالات الاستخدام المطلوبة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {useCaseOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.useCases.includes(option.value)}
                      onChange={() => handleUseCaseToggle(option.value)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Environment Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البيئة المفضلة
                </label>
                <select
                  value={formData.environmentPreference}
                  onChange={(e) => setFormData({ ...formData, environmentPreference: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {environmentOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Preferred Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ البدء المفضل
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.preferredStartDate}
                    onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات ومتطلبات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="أي متطلبات خاصة، سيناريوهات اختبار، أو أهداف محددة للـ POC..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || formData.useCases.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جارٍ إرسال الطلب...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال طلب POC
                </>
              )}
            </button>

            {formData.useCases.length === 0 && (
              <p className="text-sm text-red-500 text-center">
                يرجى اختيار حالة استخدام واحدة على الأقل
              </p>
            )}
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/poc')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← العودة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocRequest;
