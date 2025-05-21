
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
          className={`${sizeClasses[size]} text-primary`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* First C */}
          <path
            d="M70 35C70 52.6142 55.6142 67 38 67C34.5017 67 31.1262 66.4294 28 65.3654"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Second C with dollar sign */}
          <path
            d="M30 65C30 47.3858 44.3858 33 62 33C65.4983 33 68.8738 33.5706 72 34.6346"
            stroke="#A0D5D8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Dollar sign vertical line */}
          <line x1="50" y1="25" x2="50" y2="75" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <span className="ml-2 font-heading font-semibold text-primary text-xl">CountedCare</span>
    </Link>
  );
};

export default Logo;
