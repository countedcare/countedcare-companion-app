
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, BookOpen, User } from 'lucide-react';
import FloatingActionButton from './FloatingActionButton';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, text: 'Home', path: '/home', tourId: 'home-link' },
    { icon: TrendingUp, text: 'Expenses', path: '/expenses', tourId: 'expenses-link' },
    { icon: BookOpen, text: 'Resources', path: '/resources', tourId: 'resources-link' },
    { icon: User, text: 'Profile', path: '/profile', tourId: 'profile-link' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-neutral-200">
      <div className="flex items-center justify-between px-4 relative">
        {/* Left side nav items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(0, 2).map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-2 ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
                }`
              }
              data-tour={item.tourId || undefined}
            >
              {React.createElement(item.icon, { size: 20 })}
              <span className="text-xs mt-1">{item.text}</span>
            </NavLink>
          ))}
        </div>

        {/* Center floating action button */}
        <div className="flex justify-center">
          <FloatingActionButton />
        </div>

        {/* Right side nav items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(2, 4).map((item, index) => (
            <NavLink
              key={index + 2}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-2 ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
                }`
              }
              data-tour={item.tourId || undefined}
            >
              {React.createElement(item.icon, { size: 20 })}
              <span className="text-xs mt-1">{item.text}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
