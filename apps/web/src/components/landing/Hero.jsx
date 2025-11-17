import React from 'react'
import { motion } from 'framer-motion'
import UnifiedLogo from './UnifiedLogo'

const Hero = () => {
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-blue-700 to-brand-secondary pt-20">
      {/* Warm Professional Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,.08) 60px, rgba(255,255,255,.08) 61px),
          repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,.08) 60px, rgba(255,255,255,.08) 61px)`
        }}></div>
        
        {/* Warm Golden Glow */}
        <div className="absolute inset-0" 
             style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(217, 119, 6, 0.15) 0%, transparent 60%)'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Unified Logo - Large Centered */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center mb-10"
            >
              <UnifiedLogo size="large" variant="unified-card" />
            </motion.div>

        {/* Arabic-First Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="font-arabic font-bold text-5xl sm:text-6xl lg:text-8xl text-white mb-6 leading-tight tracking-wide">
            الحوكمة الاستثنائية
          </h1>
          
          <h2 className="font-english font-light text-2xl sm:text-3xl lg:text-4xl text-brand-accent mb-6 tracking-[0.3em] uppercase">
            EXCEPTIONAL GOVERNANCE
          </h2>
        </motion.div>

        {/* Arabic-First Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8"
        >
          <p className="font-arabic font-semibold text-2xl sm:text-3xl text-white mb-3 leading-relaxed">
            من المملكة إلى العالم
          </p>
          <p className="font-english font-light text-base sm:text-lg text-white/70 tracking-[0.2em] uppercase">
            From the Kingdom to the World
          </p>
        </motion.div>

        {/* Warm Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-accent/70 to-brand-accent"></div>
          <div className="w-2 h-2 bg-brand-accent rounded-full"></div>
          <div className="h-px w-24 bg-gradient-to-r from-brand-accent via-brand-accent/70 to-transparent"></div>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mb-10 max-w-4xl mx-auto"
        >
          <p className="font-arabic text-lg sm:text-xl text-white/90 mb-2 leading-relaxed">
            نحو مستقبل مستدام من خلال الحوكمة المتميزة
          </p>
          <p className="font-english text-base sm:text-lg text-white/80 leading-relaxed">
            Toward a Sustainable Future Through Governance Excellence
          </p>
        </motion.div>

        {/* Arabic Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <span className="px-6 py-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-lg text-white font-arabic font-medium">
            الاستدامة أولاً
          </span>
          <span className="px-6 py-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-lg text-white font-arabic font-medium">
            جودة متميزة
          </span>
          <span className="px-6 py-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-lg text-white font-arabic font-medium">
            تأثير عالمي
          </span>
        </motion.div>


        {/* Ultra-Minimal Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3 text-white/40"
          >
            <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center p-1.5">
              <div className="w-0.5 h-1.5 bg-white/40 rounded-full"></div>
            </div>
            <span className="text-[10px] font-arabic tracking-[0.2em] uppercase">اسحب</span>
          </motion.div>
        </motion.div>
      </div>

      
    </section>
  )
}

export default Hero

