
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserProgress } from '@/types/Gamification';
import { Badge, Flame, Star, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  userProgress: UserProgress;
}

const ProgressTracker = ({ userProgress }: ProgressTrackerProps) => {
  // Calculate level progress (every 100 XP = new level)
  const currentLevelXP = userProgress.experiencePoints % 100;
  const nextLevelXP = 100;
  const levelProgress = (currentLevelXP / nextLevelXP) * 100;

  const getStreakMessage = () => {
    if (userProgress.currentStreak === 0) {
      return "Ready to start a new streak? You've got this! 🌱";
    }
    if (userProgress.currentStreak < 3) {
      return `${userProgress.currentStreak} day${userProgress.currentStreak > 1 ? 's' : ''} strong! Keep the momentum going! 💪`;
    }
    if (userProgress.currentStreak < 7) {
      return `${userProgress.currentStreak} days! You're building something beautiful! ✨`;
    }
    return `${userProgress.currentStreak} days! You're absolutely crushing it! 🔥`;
  };

  const getXPMessage = () => {
    if (currentLevelXP < 25) {
      return "Every small action counts! You're doing great! 🌟";
    }
    if (currentLevelXP < 75) {
      return "Look at you go! Progress feels good, doesn't it? 😊";
    }
    return "So close to your next level! You're unstoppable! 🚀";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Your Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Badge className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Level {userProgress.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {currentLevelXP}/{nextLevelXP} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2 bg-white" />
          <p className="text-xs text-muted-foreground mt-1">{getXPMessage()}</p>
        </div>

        {/* Current Streak */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">Current Streak</span>
            </div>
            <span className="font-bold text-lg text-orange-600">
              {userProgress.currentStreak}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{getStreakMessage()}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <div className="font-bold text-lg text-green-600">{userProgress.expenseCount}</div>
            <div className="text-xs text-muted-foreground">Expenses Tracked</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Badge className="h-4 w-4 text-purple-500 mx-auto mb-1" />
            <div className="font-bold text-lg text-purple-600">{userProgress.badgesEarned.length}</div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
