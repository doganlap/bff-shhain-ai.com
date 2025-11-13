import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle, Shield, Zap } from 'lucide-react'
import DemoBooking from './DemoBooking'

const FinalCTA = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [isPOCOpen, setIsPOCOpen] = useState(false)

  const benefits = [
    'ابدأ في دقائق بدلاً من أسابيع',
    'وفر 70% من الوقت في التقييمات',
    'ضمان امتثال 100% لجميع الأطر',
    'دعم على مدار الساعة'
  ]

  return (
    <section id="final-cta" className="py-20 bg-gradient-to-br from-brand-primary via-blue-700 to-brand-secondary relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>ابدأ رحلتك الآن</span>
            </div>
            <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-white mb-4">
              هل أنت مستعد لتحويل الحوكمة والامتثال؟
            </h2>
            <h3 className="font-english font-semibold text-2xl lg:text-3xl text-white/90 mb-6">
              Ready to Transform Your Governance & Compliance?
            </h3>
            <p className="font-arabic text-xl text-white/90 max-w-3xl mx-auto mb-6">
              انضم إلى مئات المنظمات التي تثق بشاهين لإدارة حوكمتها وامتثالها بكفاءة وفعالية
            </p>
            <p className="font-english text-lg text-white/80 max-w-3xl mx-auto">
              Join hundreds of organizations that trust Shahin to manage their governance and compliance efficiently
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-4 mb-12"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="font-arabic font-semibold text-white">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Shield className="w-5 h-5 text-white" strokeWidth={2} />
              <span className="font-english text-white text-sm font-semibold">117+ Frameworks</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Zap className="w-5 h-5 text-white" strokeWidth={2} />
              <span className="font-english text-white text-sm font-semibold">70% Time Saved</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
              <span className="font-english text-white text-sm font-semibold">AI-Powered</span>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="font-english text-sm text-white/70 mb-4">
              Trusted by 500+ organizations worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-4 opacity-50">
              <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-xs font-bold">ISO 27001 Certified</div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-xs font-bold">Saudi Made</div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-xs font-bold">GDPR Compliant</div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-xs font-bold">Data Locally Stored</div>
            </div>
          </motion.div>

          {/* No Risk Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl mb-2">💯</div>
              <h4 className="font-arabic font-bold text-2xl text-white mb-2">
                ضمان استرجاع الأموال لمدة 30 يوم
              </h4>
              <p className="font-english text-lg text-white/90 mb-4">
                30-Day Money-Back Guarantee
              </p>
              <p className="font-arabic text-white/80 max-w-2xl">
                جرب شاهين بدون مخاطر. إذا لم تكن راضياً تماماً خلال أول 30 يوماً، سنعيد لك كامل المبلغ
              </p>
              <p className="font-english text-white/70 max-w-2xl text-sm mt-2">
                Try Shahin risk-free. If you're not completely satisfied in the first 30 days, we'll refund you in full
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo & POC Booking Modals */}
      <DemoBooking 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)}
        type="demo"
      />
      <DemoBooking 
        isOpen={isPOCOpen} 
        onClose={() => setIsPOCOpen(false)}
        type="poc"
      />
    </section>
  )
}

export default FinalCTA
