
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-neutral-200">
      <div className="container-padding py-3 flex items-center justify-between">
        <Logo size="md" />
        
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Link to="/help">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Help</span>
            </Link>
          </Button>
          
          <button className="p-2 rounded-full hover:bg-neutral-100">
            <Bell size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
