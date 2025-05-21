
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import ResourcesChatDrawer from './ResourcesChatDrawer';

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
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-1 pb-16">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
      
      {/* Show chat bot on all pages */}
      <ResourcesChatDrawer />
    </div>
  );
};

export default Layout;
