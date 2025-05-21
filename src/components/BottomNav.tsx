
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, ShoppingBag, BookOpen, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, text: 'Home', path: '/dashboard' },
    { icon: Activity, text: 'Track', path: '/expenses' },
    { icon: ShoppingBag, text: 'Shop', path: '/shop' },
    { icon: BookOpen, text: 'Resources', path: '/resources' },
    { icon: User, text: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-neutral-200">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
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
