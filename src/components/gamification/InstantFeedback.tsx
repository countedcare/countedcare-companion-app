
import React, { useEffect, useState } from 'react';
import { X, Star, Trophy, Zap } from 'lucide-react';

interface InstantFeedbackProps {
  show: boolean;
  message: string;
  type: 'expense' | 'receipt' | 'badge' | 'streak' | 'mission';
  onClose: () => void;
}

const InstantFeedback = ({ show, message, type, onClose }: InstantFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'expense': return <Zap className="h-6 w-6 text-yellow-400" />;
      case 'receipt': return <Star className="h-6 w-6 text-blue-400" />;
      case 'badge': return <Trophy className="h-6 w-6 text-purple-400" />;
      case 'streak': return <span className="text-2xl">🔥</span>;
      case 'mission': return <Star className="h-6 w-6 text-green-400" />;
      default: return <Star className="h-6 w-6 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'expense': return 'from-yellow-400 to-orange-500';
      case 'receipt': return 'from-blue-400 to-purple-500';
      case 'badge': return 'from-purple-400 to-pink-500';
      case 'streak': return 'from-orange-400 to-red-500';
      case 'mission': return 'from-green-400 to-teal-500';
      default: return 'from-blue-400 to-purple-500';
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
        {/* Popup */}
        <div 
          className={`
            bg-gradient-to-r ${getBackgroundColor()} 
            text-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center
            transform transition-all duration-300 ease-out
            ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}
        >
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white/20 rounded-full p-3">
              {getIcon()}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-lg">🎉 Awesome!</h3>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      {type === 'badge' && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {i % 3 === 0 ? '🌟' : i % 3 === 1 ? '✨' : '🎉'}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default InstantFeedback;
