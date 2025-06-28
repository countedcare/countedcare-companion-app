
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
}

const StreakTracker = ({ currentStreak, longestStreak, lastActivity }: StreakTrackerProps) => {
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak === 1) return "Great start! Keep it going!";
    if (currentStreak < 7) return "You're building momentum!";
    if (currentStreak < 30) return "Amazing consistency!";
    return "You're a habit master!";
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return "text-gray-500";
    if (currentStreak < 3) return "text-orange-500";
    if (currentStreak < 7) return "text-yellow-500";
    if (currentStreak < 30) return "text-blue-500";
    return "text-purple-500";
  };

  const isActive = () => {
    if (!lastActivity) return false;
    const lastDate = new Date(lastActivity);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  return (
    <Card className={`${currentStreak > 0 ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className={`h-5 w-5 ${getStreakColor()}`} />
          Streak Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            {currentStreak > 0 && <Flame className={`h-8 w-8 ${getStreakColor()}`} />}
            <span className={`text-3xl font-bold ${getStreakColor()}`}>
              {currentStreak}
            </span>
            <span className="text-lg text-muted-foreground">
              day{currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
          
          <p className={`text-sm font-medium ${getStreakColor()}`}>
            {getStreakMessage()}
          </p>
        </div>

        {longestStreak > 0 && (
          <div className="pt-3 border-t border-muted">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Best streak: {longestStreak} days</span>
            </div>
          </div>
        )}

        {!isActive() && currentStreak === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-700">
              Log an expense today to start your streak! 🔥
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
