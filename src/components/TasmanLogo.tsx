import React from 'react';

interface TasmanLogoProps {
  size?: number;
  className?: string;
}

const TasmanLogo: React.FC<TasmanLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`tasman-logo ${className}`}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>
      
      {/* Main background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#bgGradient)"
        filter="url(#shadow)"
      />
      
      {/* Inner white circle for contrast */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="white"
        opacity="0.95"
      />
      
      {/* Three checkbox items representing a task list */}
      {/* First checkbox - completed */}
      <rect x="25" y="25" width="12" height="12" rx="2" fill="url(#checkGradient)" />
      <path
        d="M27 31 L30 34 L35 27"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="42" y="25" width="20" height="2" rx="1" fill="#10b981" opacity="0.6" />
      
      {/* Second checkbox - completed */}
      <rect x="25" y="42" width="12" height="12" rx="2" fill="url(#checkGradient)" />
      <path
        d="M27 48 L30 51 L35 44"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="42" y="42" width="25" height="2" rx="1" fill="#10b981" opacity="0.6" />
      
      {/* Third checkbox - pending */}
      <rect x="25" y="59" width="12" height="12" rx="2" fill="none" stroke="#d1d5db" strokeWidth="2" />
      <rect x="42" y="59" width="18" height="2" rx="1" fill="#9ca3af" />
      
      {/* Small accent dots for visual interest */}
      <circle cx="75" y="30" r="2" fill="#4f46e5" opacity="0.4" />
      <circle cx="78" y="45" r="1.5" fill="#7c3aed" opacity="0.4" />
      <circle cx="72" y="60" r="1" fill="#4f46e5" opacity="0.4" />
    </svg>
  );
};

export default TasmanLogo;