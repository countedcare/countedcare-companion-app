
import React from 'react';
import { Link } from 'react-router-dom';
import optimizedLogo from '@/assets/countedcare-logo-optimized.png';

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
      <img
        src={optimizedLogo}
        alt="CountedCare Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
    </Link>
  );
};

export default Logo;
