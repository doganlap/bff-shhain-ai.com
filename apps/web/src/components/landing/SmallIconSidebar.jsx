import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Play, FlaskConical, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SmallIconSidebar = () => {
  const navigate = useNavigate();
  const [showPOCModal, setShowPOCModal] = useState(false);

  const icons = [
    {
      id: 'login',
      icon: LogIn,
      label: 'تسجيل دخول الشركاء',
      labelEn: 'Partner Login',
      color: 'from-emerald-500 to-teal-500',
      action: () => {
        navigate('/login');
      }
    },
    {
      id: 'demo',
      icon: Play,
      label: 'تجربة العرض التوضيحي',
      labelEn: 'Try Demo',
      color: 'from-purple-500 to-indigo-500',
      action: () => {
        navigate('/demo-access');
      }
    },
    {
      id: 'poc',
      icon: FlaskConical,
      label: 'طلب إثبات المفهوم',
      labelEn: 'Request POC',
      color: 'from-blue-500 to-cyan-500',
      action: () => {
        setShowPOCModal(true);
      }
    }
  ];

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="fixed right-6 bottom-24 z-40"
    >
      <div className="flex flex-col gap-3">
          {icons.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={item.action}
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white transition-all relative overflow-hidden`}
                  style={{
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                    transform: 'translateZ(0)',
                  }}
                  title={item.labelEn}
                  aria-label={item.label}
                >
                  {/* 3D Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
                  <Icon className="w-5 h-5 relative z-10" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                </button>

                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-gray-900/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                    <div className="text-[11px] font-semibold">{item.labelEn}</div>
                    <div className="text-[9px] text-gray-300 font-arabic">{item.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* POC Modal - Ultra Transparent & Compact Glass */}
      <AnimatePresence>
        {showPOCModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowPOCModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/40 dark:border-gray-700/40 p-3 w-48 mx-4"
              style={{
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              }}
            >
              <button
                onClick={() => setShowPOCModal(false)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white/40 hover:bg-white/60 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 backdrop-blur-xl flex items-center justify-center transition-all shadow-lg"
              >
                <X className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" strokeWidth={3} />
              </button>
              
              <div className="text-center">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <FlaskConical className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  POC Request
                </h3>
                <p className="text-[10px] text-gray-700 dark:text-gray-200 mb-0.5 font-medium">
                  Coming Soon!
                </p>
                <p className="text-[9px] text-gray-600 dark:text-gray-300 font-arabic">
                  طلب إثبات المفهوم - قريباً!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmallIconSidebar;
