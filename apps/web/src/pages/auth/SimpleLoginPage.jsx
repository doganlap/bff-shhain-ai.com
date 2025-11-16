import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Shield, Mail, Lock, Globe, Loader2, AlertCircle, Crown, Key, Unlock } from 'lucide-react';

const SimpleLoginPage = () => {
  const navigate = useNavigate();
  const { actions } = useApp();
  const [formData, setFormData] = useState({
    email: 'admin@shahin-ai.com',
    password: 'SuperAdmin2025'
  });
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Super Admin Access - Direct Entry
    try {
      // Set admin user data
      const adminUser = {
        id: 'admin-001',
        email: formData.email,
        name: 'Super Administrator',
        role: 'SUPER_ADMIN',
        permissions: ['*'], // All permissions
        tenant: 'MASTER_TENANT',
        isVerified: true,
        lastLogin: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('app_user', JSON.stringify(adminUser));
      localStorage.setItem('app_token', 'SUPER_ADMIN_TOKEN_' + Date.now());
      localStorage.setItem('app_role', 'SUPER_ADMIN');
      localStorage.setItem('app_permissions', JSON.stringify(['*']));

      // Immediate access
      setTimeout(() => {
        navigate('/app');
        window.location.reload(); // Refresh to apply admin context
      }, 1000);

    } catch (error) {
      setError('Access configuration error');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = () => {
    setLoading(true);
    // Instant Super Admin Access
    const adminUser = {
      id: 'admin-direct',
      email: 'admin@shahin-ai.com',
      name: 'Direct Access Administrator',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      tenant: 'MASTER_TENANT',
      isVerified: true,
      directAccess: true
    };

    localStorage.setItem('app_user', JSON.stringify(adminUser));
    localStorage.setItem('app_token', 'DIRECT_ACCESS_TOKEN_' + Date.now());
    localStorage.setItem('app_role', 'SUPER_ADMIN');
    localStorage.setItem('app_permissions', JSON.stringify(['*']));

    navigate('/app');
    window.location.reload();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-12 h-12 text-yellow-400" />
              <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Shahin GRC</div>
              <div className="text-sm text-yellow-300 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Super Admin Portal
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/70" />
            <select
              value={language}
              onChange={onLanguageChange}
              className="bg-black/50 border border-white/30 text-white rounded-md px-3 py-2 text-sm backdrop-blur"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div className="mb-8 text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Master Access
          </div>
          <div className="text-white/80 mt-2">Unrestricted GRC Platform Entry</div>
        </div>

        {/* Direct Access Button */}
        <div className="mb-6">
          <button
            onClick={handleDirectAccess}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Unlock className="w-6 h-6" />
                INSTANT ACCESS
              </>
            )}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black/50 text-white/70 backdrop-blur">Or use credentials</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur">
            <AlertCircle className="inline w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/30 text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur placeholder-white/50"
                placeholder="admin@shahin-ai.com"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/30 text-white rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur placeholder-white/50"
                placeholder="SuperAdmin2025"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all duration-300 shadow-lg"
          >
            {loading ? <Loader2 className="mx-auto w-6 h-6 animate-spin" /> : 'ACCESS SYSTEM'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="text-white/60 text-sm">
            Super Administrator Portal - Full System Access
          </div>
          <div className="text-white/40 text-xs mt-1">
            v2.0 - Updated {new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;
