import React from 'react'
import { motion } from 'framer-motion'

/**
 * GlassCard - Reusable glassmorphism card component
 */
const GlassCard = ({ 
  children, 
  className = '', 
  hover = false,
  blur = 'xl',
  opacity = '90',
  darkOpacity = '80',
  border = true,
  ...props 
}) => {
  const blurClass = `backdrop-blur-${blur}`
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`
        bg-white/${opacity} dark:bg-gray-900/${darkOpacity}
        ${blurClass}
        ${border ? 'border border-white/20 dark:border-gray-700/50' : ''}
        rounded-2xl
        shadow-xl
        ${hover ? 'transition-all duration-300' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * GlassIcon - Icon with glass container
 */
export const GlassIcon = ({ 
  icon: Icon, 
  size = 'md',
  gradient = 'from-brand-primary to-brand-secondary',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-2xl
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl
        bg-white/20 dark:bg-white/10
        border border-white/30 dark:border-gray-700/50
        flex items-center justify-center
        shadow-lg
        ${className}
      `}
      style={{
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      {...props}
    >
      <Icon className={`${size === 'xl' ? 'w-12 h-12' : size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} strokeWidth={2} />
    </div>
  )
}

/**
 * GlassButton - Button with glass effect
 */
export const GlassButton = ({ 
  children, 
  className = '',
  variant = 'primary',
  ...props 
}) => {
  const variants = {
    primary: 'bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 text-white hover:bg-white/30',
    secondary: 'bg-brand-primary/20 dark:bg-brand-primary/10 border-brand-primary/30 text-brand-primary dark:text-blue-300',
    accent: 'bg-brand-accent/20 dark:bg-brand-accent/10 border-brand-accent/30 text-brand-accent dark:text-orange-300'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${variants[variant]}
        backdrop-blur-xl
        border-2
        px-6 py-3
        rounded-xl
        font-arabic font-semibold
        transition-all duration-300
        shadow-lg
        ${className}
      `}
      style={{
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GlassCard

