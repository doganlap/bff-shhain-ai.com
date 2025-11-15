import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, User, Lock, Eye, EyeOff, Shield, Mail } from 'lucide-react'

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState('email') // 'email' or 'demo'

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (loginType === 'demo') {
        // Redirect to demo platform
        window.open('https://demo.shahin-ai.com', '_blank')
      } else {
        // Redirect to main platform (GRC app)
        window.open('https://grc.shahin-ai.com/app', '_blank')
      }
      
      onClose()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoginType('demo')
    handleLogin({ preventDefault: () => {} })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-brand-primary to-brand-secondary p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-arabic font-bold">دخول شاهين</h2>
                  <p className="text-sm text-white/80">Shahin GRC Login</p>
                </div>
              </div>
              <p className="text-sm text-white/90">
                ادخل إلى منصة الذكاء الاصطناعي للحوكمة والمخاطر والامتثال
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Login Type Toggle */}
              <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setLoginType('email')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    loginType === 'email'
                      ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-brand-primary'
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  حساب مستخدم
                </button>
                <button
                  onClick={() => setLoginType('demo')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    loginType === 'demo'
                      ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-brand-primary'
                  }`}
                >
                  <LogIn className="w-4 h-4 inline-block mr-2" />
                  تجربة سريعة
                </button>
              </div>

              {loginType === 'email' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                        placeholder="admin@company.com"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pr-12 pl-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                        placeholder="••••••••"
                        required
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary dark:focus:ring-brand-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">تذكرني</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-brand-primary hover:text-brand-secondary font-medium"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        جاري الدخول...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        دخول المنصة
                      </div>
                    )}
                  </motion.button>
                </form>
              ) : (
                /* Demo Login */
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-arabic font-bold text-gray-900 dark:text-white mb-2">
                    تجربة سريعة
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                    استكشف منصة شاهين للحوكمة والمخاطر والامتثال مع البيانات التوضيحية. 
                    لا حاجة لإنشاء حساب.
                  </p>

                  <motion.button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        جاري التحميل...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        بدء التجربة المجانية
                      </div>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ✨ بيانات توضيحية • 🔒 آمن تماماً • ⏱️ فوري
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                بالدخول، أنت توافق على 
                <button className="text-brand-primary hover:underline mx-1">شروط الخدمة</button>
                و
                <button className="text-brand-primary hover:underline mx-1">سياسة الخصوصية</button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LoginModal