import React from 'react';

const SaudiLandmarks = ({ landmark, className = "" }) => {
  const landmarks = {
    "kingdom-tower": (
      <svg className={`${className} hover:scale-105 transition-transform duration-300`} viewBox="0 0 100 120" fill="none">
        <defs>
          <linearGradient id="tower-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        <g className="animate-pulse">
          {/* Kingdom Tower Base */}
          <rect x="30" y="80" width="40" height="40" fill="url(#tower-gradient)" rx="2" />
          {/* Tower Body */}
          <rect x="35" y="40" width="30" height="40" fill="url(#tower-gradient)" rx="1" />
          {/* Tower Top */}
          <rect x="40" y="20" width="20" height="20" fill="url(#tower-gradient)" rx="1" />
          {/* Spire */}
          <rect x="48" y="5" width="4" height="15" fill="url(#tower-gradient)" />
          {/* Architectural Details */}
          <rect x="32" y="85" width="36" height="2" fill="rgba(255,255,255,0.4)" />
          <rect x="37" y="45" width="26" height="2" fill="rgba(255,255,255,0.4)" />
          <rect x="42" y="25" width="16" height="2" fill="rgba(255,255,255,0.4)" />
        </g>
      </svg>
    ),
    
    "masjid-nabawi": (
      <svg className={`${className} hover:scale-105 transition-transform duration-300`} viewBox="0 0 120 100" fill="none">
        <defs>
          <linearGradient id="mosque-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        <g className="animate-pulse">
          {/* Main Dome */}
          <ellipse cx="60" cy="40" rx="25" ry="15" fill="url(#mosque-gradient)" />
          {/* Minarets */}
          <rect x="20" y="20" width="8" height="60" fill="url(#mosque-gradient)" rx="4" />
          <rect x="92" y="20" width="8" height="60" fill="url(#mosque-gradient)" rx="4" />
          {/* Minaret Tops */}
          <ellipse cx="24" cy="20" rx="6" ry="4" fill="url(#mosque-gradient)" />
          <ellipse cx="96" cy="20" rx="6" ry="4" fill="url(#mosque-gradient)" />
          {/* Main Building */}
          <rect x="35" y="55" width="50" height="25" fill="url(#mosque-gradient)" rx="2" />
          {/* Arches */}
          <path d="M40 70 Q50 60 60 70 Q70 60 80 70" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        </g>
      </svg>
    ),
    
    "kaaba": (
      <svg className={`${className} hover:scale-105 transition-transform duration-300`} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="kaaba-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <g className="animate-pulse">
          {/* Kaaba Structure */}
          <rect x="35" y="35" width="30" height="30" fill="url(#kaaba-gradient)" rx="2" />
          {/* Kiswah Pattern */}
          <rect x="37" y="37" width="26" height="4" fill="rgba(255,255,255,0.3)" />
          <rect x="37" y="45" width="26" height="2" fill="rgba(255,255,255,0.2)" />
          <rect x="37" y="53" width="26" height="2" fill="rgba(255,255,255,0.2)" />
          <rect x="37" y="61" width="26" height="4" fill="rgba(255,255,255,0.3)" />
          {/* Surrounding Circle */}
          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="35" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
        </g>
      </svg>
    ),
    
    "neom-city": (
      <svg className={`${className} hover:scale-105 transition-transform duration-300`} viewBox="0 0 120 80" fill="none">
        <defs>
          <linearGradient id="neom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        <g className="animate-pulse">
          {/* Futuristic Buildings */}
          <rect x="10" y="40" width="15" height="40" fill="url(#neom-gradient)" rx="7" />
          <rect x="30" y="30" width="20" height="50" fill="url(#neom-gradient)" rx="10" />
          <rect x="55" y="35" width="18" height="45" fill="url(#neom-gradient)" rx="9" />
          <rect x="78" y="25" width="22" height="55" fill="url(#neom-gradient)" rx="11" />
          <rect x="105" y="45" width="12" height="35" fill="url(#neom-gradient)" rx="6" />
          {/* Connecting Lines (Smart City) */}
          <path d="M17 50 Q40 20 40 40 Q60 15 65 45 Q85 10 89 35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
        </g>
      </svg>
    ),
    
    "red-sea": (
      <svg className={`${className} hover:scale-105 transition-transform duration-300`} viewBox="0 0 120 80" fill="none">
        <defs>
          <linearGradient id="sea-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>
        <g className="animate-pulse">
          {/* Water Waves */}
          <path d="M0 60 Q30 50 60 60 Q90 70 120 60 L120 80 L0 80 Z" fill="url(#sea-gradient)" />
          <path d="M0 65 Q30 55 60 65 Q90 75 120 65" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          {/* Islands/Coral */}
          <ellipse cx="25" cy="55" rx="8" ry="4" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="70" cy="50" rx="12" ry="6" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="95" cy="58" rx="6" ry="3" fill="rgba(255,255,255,0.15)" />
          {/* Resort Structures */}
          <rect x="65" y="35" width="20" height="15" fill="url(#sea-gradient)" rx="2" />
          <rect x="20" y="40" width="15" height="15" fill="url(#sea-gradient)" rx="2" />
        </g>
      </svg>
    )
  };

  return landmarks[landmark] || null;
};

export default SaudiLandmarks;
