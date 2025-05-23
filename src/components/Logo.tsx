
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
          {/* Stylized S with dollar sign design matching the logo */}
          <path
            d="M25 70C25 78.284 31.716 85 40 85H60C68.284 85 75 78.284 75 70C75 61.716 68.284 55 60 55H40C31.716 55 25 48.284 25 40C25 31.716 31.716 25 40 25H60C68.284 25 75 31.716 75 40"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Dollar sign vertical lines */}
          <line x1="50" y1="15" x2="50" y2="30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="80" x2="50" y2="95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <span className="ml-2 font-heading font-semibold text-[#4A90E2] text-xl">CountedCare</span>
    </Link>
  );
};

export default Logo;
