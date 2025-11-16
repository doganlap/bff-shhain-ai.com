import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Loader, CheckCircle, Rocket, Sparkles } from 'lucide-react'
import { quickAccessSandbox, createSandboxSession } from '../services/sandboxService'

const TryDemoButton = ({ variant = 'primary', size = 'large', className = '' }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleTryDemo = async () => {
    setIsCreating(true)
    setError(null)
    
    try {
      const session = await quickAccessSandbox()
      
      // Show success briefly
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setIsCreating(false)
      }, 2000)
      
    } catch (err) {
      console.error('Try demo error:', err)
      setError('Unable to start demo. Please try again.')
      setIsCreating(false)
      setTimeout(() => setError(null), 5000)
    }
  }

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }

  const variants = {
    primary: 'bg-gradient-to-r from-brand-accent to-brand-gold text-white hover:shadow-2xl hover:scale-105',
    secondary: 'bg-white text-brand-accent border-2 border-brand-accent hover:bg-brand-accent hover:text-white',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-brand-accent'
  }

  return (
    <div className="relative inline-block">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`${sizes[size]} ${variants[variant]} rounded-xl font-arabic font-bold transition-all flex items-center gap-3 ${className}`}
          >
            <CheckCircle className="w-6 h-6" />
            <span>تم فتح العرض!</span>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={handleTryDemo}
            disabled={isCreating}
            className={`${sizes[size]} ${variants[variant]} rounded-xl font-arabic font-bold transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            whileHover={{ scale: isCreating ? 1 : 1.05 }}
            whileTap={{ scale: isCreating ? 1 : 0.95 }}
          >
            {isCreating ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>جاري التحضير...</span>
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6" />
                <span>جرّب الآن مجاناً</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-500 text-white text-sm rounded-lg shadow-lg font-arabic"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TryDemoButton
