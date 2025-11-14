import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Demo Registration Form
 * Route: /demo/register
 * Creates tenant + user + provides instant access
 */
const DemoRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    sector: '',
    orgSize: '',
    useCases: [],
    notes: ''
  });

  const sectors = [
    'Healthcare', 'BFSI', 'Government', 'Manufacturing',
    'Education', 'Retail', 'Technology', 'Other'
  ];

  const orgSizes = [
    '1-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  const useCaseOptions = [
    { value: 'governance', label: 'الحوكمة' },
    { value: 'risk', label: 'إدارة المخاطر' },
    { value: 'compliance', label: 'الامتثال' },
    { value: 'audit', label: 'التدقيق' }
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
      const response = await fetch('/api/public/demo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create demo account');
      }

      const data = await response.json();

      // Store token
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
      }

      toast.success('تم إنشاء حساب التجربة بنجاح!');

      // Redirect to demo app
      setTimeout(() => {
        navigate('/demo/app');
      }, 1000);

    } catch (error) {
      console.error('Demo registration error:', error);
      toast.error('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              تسجيل للتجربة المجانية
            </h1>
            <p className="text-gray-600">
              املأ البيانات التالية للحصول على وصول فوري
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="example@company.com"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الشركة
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="اسم شركتك أو مؤسستك"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القطاع
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">اختر القطاع</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Organization Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حجم المؤسسة
              </label>
              <select
                value={formData.orgSize}
                onChange={(e) => setFormData({ ...formData, orgSize: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">اختر الحجم</option>
                {orgSizes.map(size => (
                  <option key={size} value={size}>{size} موظف</option>
                ))}
              </select>
            </div>

            {/* Use Cases */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                حالات الاستخدام المهتم بها
              </label>
              <div className="grid grid-cols-2 gap-3">
                {useCaseOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.useCases.includes(option.value)}
                      onChange={() => handleUseCaseToggle(option.value)}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="أي متطلبات أو ملاحظات خاصة..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جارٍ إنشاء الحساب...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  إنشاء حساب التجربة
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/demo')}
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

export default DemoRegister;
