
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
      <img
        src="/lovable-uploads/a15212de-e863-4e80-8ede-92c2ccff9aaf.png"
        alt="CountedCare Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
    </Link>
  );
};

export default Logo;
