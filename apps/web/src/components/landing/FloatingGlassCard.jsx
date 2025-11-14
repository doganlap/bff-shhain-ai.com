import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const FloatingGlassCard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    {
      icon: Shield,
      value: '200+',
      label: 'أطر تنظيمية',
      labelEn: 'Regulatory Frameworks',
      color: 'from-blue-500 via-cyan-500 to-blue-600',
      shadowColor: 'rgba(59, 130, 246, 0.5)'
    },
    {
      icon: TrendingUp,
      value: '85%',
      label: 'تحسين الامتثال',
      labelEn: 'Compliance Improvement',
      color: 'from-purple-500 via-pink-500 to-purple-600',
      shadowColor: 'rgba(168, 85, 247, 0.5)'
    },
    {
      icon: Zap,
      value: '10x',
      label: 'أسرع في التقييم',
      labelEn: 'Faster Assessment',
      color: 'from-green-500 via-emerald-500 to-green-600',
      shadowColor: 'rgba(34, 197, 94, 0.5)'
    },
    {
      icon: Sparkles,
      value: '24/7',
      label: 'ذكاء اصطناعي',
      labelEn: 'AI Powered',
      color: 'from-orange-500 via-red-500 to-orange-600',
      shadowColor: 'rgba(249, 115, 22, 0.5)'
    }
  ];

  useEffect(() => {
    // Show card after 3 seconds initially
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Toggle visibility every 20 seconds (show for 20s, hide for 20s)
    const toggleTimer = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 20000);

    // Rotate stats every 4 seconds
    const rotateTimer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(toggleTimer);
      clearInterval(rotateTimer);
    };
  }, [stats.length]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const currentStatData = stats[currentStat];
  const Icon = currentStatData.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 100 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20 
          }}
          className="fixed bottom-8 left-28 z-50"
        >
          {/* Glassmorphism Card */}
          <div 
            className="relative group"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
            }}
          >
            {/* Animated Background Glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute inset-0 bg-gradient-to-br ${currentStatData.color} rounded-3xl blur-2xl`}
            />

            {/* Glass Card - COMPACT VERSION */}
            <motion.div
              key={currentStat}
              initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                duration: 0.6 
              }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="relative bg-white/5 dark:bg-gray-900/5 backdrop-blur-3xl rounded-2xl border border-white/10 dark:border-gray-700/10 p-5 min-w-[240px] cursor-pointer"
              style={{
                backdropFilter: 'blur(30px) saturate(200%)',
                WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                boxShadow: `0 15px 40px 0 ${currentStatData.shadowColor}, 0 8px 32px 0 rgba(31, 38, 135, 0.3)`,
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/30 flex items-center justify-center transition-all group"
              >
                <X className="w-3 h-3 text-white dark:text-gray-300" />
              </button>

              {/* Icon with Gradient Background - COMPACT */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStatData.color} flex items-center justify-center mb-4 shadow-xl relative overflow-hidden`}
                style={{
                  boxShadow: `0 8px 30px ${currentStatData.shadowColor}`
                }}
              >
                {/* Animated shine on icon */}
                <motion.div
                  animate={{
                    x: [-100, 100],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  style={{ transform: 'skewX(-20deg)' }}
                />
                <Icon className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
              </motion.div>

              {/* Value - COMPACT */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 10,
                  delay: 0.2 
                }}
                className="mb-2"
              >
                <motion.h3 
                  animate={{
                    textShadow: [
                      `0 0 15px ${currentStatData.shadowColor}`,
                      `0 0 30px ${currentStatData.shadowColor}`,
                      `0 0 15px ${currentStatData.shadowColor}`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl font-black text-white dark:text-white mb-1 tracking-tight"
                >
                  {currentStatData.value}
                </motion.h3>
              </motion.div>

              {/* Labels - COMPACT */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  type: 'spring',
                  delay: 0.3 
                }}
              >
                <p className="text-white font-bold text-sm mb-1 tracking-wide">
                  {currentStatData.labelEn}
                </p>
                <p className="text-white/70 dark:text-gray-300 text-xs font-arabic font-semibold">
                  {currentStatData.label}
                </p>
              </motion.div>

              {/* Progress Dots - COMPACT */}
              <div className="flex gap-1.5 mt-4 justify-center">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: index === currentStat ? 1.8 : 1,
                      opacity: index === currentStat ? 1 : 0.4,
                    }}
                    whileHover={{ scale: 1.5 }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentStat
                        ? `bg-gradient-to-r ${stat.color} shadow-lg`
                        : 'bg-white/40'
                    }`}
                    style={{
                      boxShadow: index === currentStat ? `0 0 10px ${stat.shadowColor}` : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Shine Effect */}
              <motion.div
                animate={{
                  x: [-100, 300],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-3xl pointer-events-none"
                style={{
                  transform: 'skewX(-20deg)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingGlassCard;
