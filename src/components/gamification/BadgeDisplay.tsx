
import React from 'react';
import { Badge } from '@/types/Gamification';
import { Star, Trophy, Award, CalendarCheck, Heart, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

const BadgeDisplay = ({ badge, size = 'md', showDescription = false, className }: BadgeDisplayProps) => {
  const getIcon = () => {
    switch (badge.icon) {
      case 'star': return <Star className="h-full w-full" />;
      case 'trophy': return <Trophy className="h-full w-full" />;
      case 'award': return <Award className="h-full w-full" />;
      case 'calendar-check': return <CalendarCheck className="h-full w-full" />;
      case 'heart': return <Heart className="h-full w-full" />;
      case 'badge-check': return <BadgeCheck className="h-full w-full" />;
      default: return <Star className="h-full w-full" />;
    }
  };

  const getTierColors = () => {
    switch (badge.tier) {
      case 'bronze': return 'from-amber-600 to-amber-800 text-amber-100';
      case 'silver': return 'from-gray-400 to-gray-600 text-gray-100';
      case 'gold': return 'from-yellow-400 to-yellow-600 text-yellow-100';
      case 'platinum': return 'from-purple-400 to-purple-600 text-purple-100';
      default: return 'from-gray-400 to-gray-600 text-gray-100';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      default: return 'w-12 h-12';
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className={cn(
          "rounded-full bg-gradient-to-br flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110",
          getSizeClasses(),
          getTierColors(),
          badge.unlocked ? 'shadow-lg' : 'opacity-40 grayscale'
        )}
      >
        {getIcon()}
        {badge.unlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        )}
      </div>
      
      {showDescription && (
        <div className="mt-2 text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
            <span className="text-lg">{badge.emoji}</span>
            <h4 className="font-medium text-sm">{badge.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground max-w-[120px]">
            {badge.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
