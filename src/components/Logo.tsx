
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative">
        <svg
          className={`${sizeClasses[size]} text-[#4A90E2]`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CountedCare logo - stylized S with dollar sign */}
          <path
            d="M30 75C30 81.627 35.373 87 42 87H58C64.627 87 70 81.627 70 75C70 68.373 64.627 63 58 63H42C35.373 63 30 57.627 30 51C30 44.373 35.373 39 42 39H58C64.627 39 70 44.373 70 51"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Dollar sign vertical lines */}
          <line x1="50" y1="28" x2="50" y2="39" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="87" x2="50" y2="98" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <span className="ml-2 font-heading font-semibold text-[#4A90E2] text-xl">CountedCare</span>
    </Link>
  );
};

export default Logo;
