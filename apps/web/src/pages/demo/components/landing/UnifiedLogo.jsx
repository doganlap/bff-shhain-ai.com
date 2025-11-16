import React from 'react'
import { Shield } from 'lucide-react'

const UnifiedLogo = ({ size = 'medium', variant = 'horizontal' }) => {
  const sizes = {
    small: {
      container: 'h-16',
      icon: 'w-10 h-10',
      iconInner: 'w-5 h-5',
      arabicText: 'text-base',
      englishText: 'text-[10px]',
      gap: 'gap-2'
    },
    medium: {
      container: 'h-20',
      icon: 'w-14 h-14',
      iconInner: 'w-7 h-7',
      arabicText: 'text-xl',
      englishText: 'text-xs',
      gap: 'gap-3'
    },
    large: {
      container: 'h-28',
      icon: 'w-20 h-20',
      iconInner: 'w-10 h-10',
      arabicText: 'text-3xl',
      englishText: 'text-sm',
      gap: 'gap-4'
    }
  }

  const s = sizes[size]

  if (variant === 'stacked') {
    // Vertical stacked - both centered, symmetrical
    return (
      <div className="flex flex-col items-center justify-center" role="img" aria-label="شاهين للحوكمة Shahin GRC Logo">
        {/* Icon centered on top */}
        <div className={`${s.icon} rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg mb-3`}>
          <Shield className={`${s.iconInner} text-white`} strokeWidth={2} aria-hidden="true" />
        </div>
        
        {/* Both names stacked, centered */}
        <div className="flex flex-col items-center gap-1">
          <div className={`font-arabic font-bold ${s.arabicText} text-brand-primary text-center`}>
            شاهين للحوكمة
          </div>
          <div className={`font-english font-semibold ${s.englishText} text-gray-600 tracking-wide text-center uppercase`}>
            SHAHIN GRC
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'unified-card') {
    // Both names inside one card with icon
    return (
      <div className="relative inline-block" role="img" aria-label="شاهين للحوكمة Shahin GRC Logo">
        {/* Unified card background */}
        <div className="bg-gradient-to-br from-brand-primary via-blue-700 to-brand-secondary rounded-2xl p-6 shadow-2xl border-2 border-white/20">
          {/* Icon centered at top */}
          <div className="flex justify-center mb-4">
            <div className={`${s.icon} rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
              <Shield className={`${s.iconInner} text-white`} strokeWidth={2.5} aria-hidden="true" />
            </div>
          </div>
          
          {/* Both names centered, symmetrical */}
          <div className="text-center">
            <div className={`font-arabic font-bold ${s.arabicText} text-white mb-2 leading-tight`}>
              شاهين للحوكمة
            </div>
            <div className="h-px w-20 bg-white/40 mx-auto mb-2" aria-hidden="true" />
            <div className={`font-english font-semibold ${s.englishText} text-white/90 tracking-[0.2em] uppercase`}>
              SHAHIN GRC
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default: horizontal with icon on side
  return (
    <div className={`flex items-center ${s.gap}`} role="img" aria-label="شاهين للحوكمة Shahin GRC Logo">
      <div className={`${s.icon} rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md`}>
        <Shield className={`${s.iconInner} text-white`} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex flex-col justify-center">
        <div className={`font-arabic font-bold ${s.arabicText} text-white leading-tight`}>
          شاهين للحوكمة
        </div>
        <div className={`font-english font-light ${s.englishText} text-white/80 tracking-wide`}>
          Shahin GRC
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogo

