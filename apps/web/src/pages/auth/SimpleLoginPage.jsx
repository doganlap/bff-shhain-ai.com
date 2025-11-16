import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Shield, Mail, Lock, Globe, Loader2, AlertCircle } from 'lucide-react';

const SimpleLoginPage = () => {
  const navigate = useNavigate();
  const { actions } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await actions.login(formData);
      if (result.success) {
        navigate('/app');
      } else {
        setError(result.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    try {
      localStorage.setItem('app_language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            <div>
              <div className="text-xl font-bold text-gray-900">Shahin GRC</div>
              <div className="text-sm text-gray-600">app.shahin-ai.com</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <select value={language} onChange={onLanguageChange} className="border rounded-md px-2 py-1 text-sm">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-2xl font-semibold text-gray-900">Sign in</div>
          <div className="text-gray-600">Access your governance dashboard</div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle className="inline w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="mx-auto w-6 h-6 animate-spin" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimpleLoginPage;
