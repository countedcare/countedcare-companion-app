
import React from 'react';
import Logo from './Logo';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-neutral-200">
      <div className="container-padding py-3 flex items-center justify-between">
        <Logo size="md" />
        <button className="p-2 rounded-full hover:bg-neutral-100">
          <Bell size={20} className="text-primary" />
        </button>
      </div>
    </header>
  );
};

export default Header;
