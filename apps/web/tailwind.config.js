/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: {
    relative: true,
    files: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
      // Explicitly exclude node_modules
      "!./node_modules/**",
      "!./www.shahin.com/node_modules/**",
    ],
  },
  theme: {
    extend: {
      // ============================================
      // DESIGN TOKENS - Single Source of Truth
      // ============================================
      colors: {
        // Primary (Shahin-green inspired)
        primary: {
          DEFAULT: '#0E7C66',
          50: '#E6F5F2',
          100: '#CCE9E5',
          200: '#99D4CB',
          300: '#66BEB1',
          400: '#33A997',
          500: '#0E7C66',
          600: '#0B6957',
          700: '#095746',
          800: '#064435',
          900: '#043024',
        },
        
        // Surface colors
        surface: {
          dark: '#0B0F14',
          light: '#FFFFFF',
        },
        
        // Neutral colors
        muted: {
          DEFAULT: '#F3F5F7',
          foreground: '#6B7280',
        },
        
        border: '#E6E8EB',
        
        // Semantic colors
        danger: {
          DEFAULT: '#E5484D',
          50: '#FFEAEB',
          600: '#D63940',
        },
        warning: {
          DEFAULT: '#FFB224',
          50: '#FFF5E5',
          600: '#E69F1F',
        },
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          600: '#2563EB',
        },
        success: {
          DEFAULT: '#22C55E',
          50: '#ECFDF5',
          600: '#16A34A',
        },
      },
      
      // Border radius scale
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '16px',
        '2xl': '20px',
      },
      
      // Shadow system
      boxShadow: {
        card: '0 6px 20px rgba(2, 6, 23, 0.08)',
        'card-hover': '0 8px 24px rgba(2, 6, 23, 0.12)',
        focus: '0 0 0 3px rgba(14, 124, 102, 0.25)',
        modal: '0 20px 60px rgba(2, 6, 23, 0.2)',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
      
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
      },
      
      // Spacing scale (4px grid)
      spacing: {
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      
      // Animation durations
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      
      // Animation curves
      transitionTimingFunction: {
        'ease-out-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
