
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, BookOpen, User } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, text: 'Home', path: '/dashboard' },
    { icon: Activity, text: 'Track', path: '/expenses' },
    { icon: BookOpen, text: 'Resources', path: '/resources' },
    { icon: User, text: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-neutral-200">
      <div className="flex items-center justify-around relative">
        {/* First two nav items */}
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.text}</span>
          </NavLink>
        ))}
        
        {/* Floating Action Button in the center */}
        <div className="flex flex-col items-center py-2 px-4">
          <FloatingActionButton />
          <span className="text-xs mt-1 text-transparent">Quick</span> {/* Invisible text for spacing */}
        </div>
        
        {/* Last two nav items */}
        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.text}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
