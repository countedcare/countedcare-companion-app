
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/types/Gamification';
import { Clock, CheckCircle, Star } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
}

const ChallengeCard = ({ challenge, onAccept, onComplete }: ChallengeCardProps) => {
  const progress = (challenge.criteria.current / challenge.criteria.target) * 100;
  const isCompleted = challenge.completedAt;
  const isActive = challenge.active && !isCompleted;
  
  const getDaysRemaining = () => {
    if (!challenge.startDate) return challenge.duration;
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(startDate.getTime() + challenge.duration * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remainingTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingTime / (24 * 60 * 60 * 1000)));
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'logging': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'review': return 'text-green-600 bg-green-50 border-green-200';
      case 'discovery': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'self-care': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium text-green-800 flex items-center gap-2">
                <span>{challenge.emoji}</span>
                {challenge.title}
              </h3>
              <p className="text-sm text-green-700 mt-1">{challenge.reward.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${getTypeColor()} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">{challenge.emoji}</span>
          {challenge.title}
          {!isActive && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              New!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        
        {isActive && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {challenge.criteria.current}/{challenge.criteria.target}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getDaysRemaining()} day{getDaysRemaining() !== 1 ? 's' : ''} left
              </div>
              {progress >= 100 && (
                <Button 
                  size="sm" 
                  onClick={() => onComplete?.(challenge.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Claim Reward!
                </Button>
              )}
            </div>
          </>
        )}
        
        {!isActive && (
          <Button 
            onClick={() => onAccept?.(challenge.id)}
            className="w-full"
          >
            Start Challenge
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
