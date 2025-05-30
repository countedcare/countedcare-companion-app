
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
        src="/lovable-uploads/46762ee4-32a5-4530-a65f-2eb2a962ca4d.png"
        alt="CountedCare Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
    </Link>
  );
};

export default Logo;
