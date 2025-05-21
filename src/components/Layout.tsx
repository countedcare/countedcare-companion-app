
import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-1 pb-16">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
