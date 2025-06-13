
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import { Expense } from '@/types/User';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import ProgressTracker from '@/components/gamification/ProgressTracker';
import ChallengeCard from '@/components/gamification/ChallengeCard';
import { Confetti, SurpriseQuote, SURPRISE_QUOTES } from '@/components/gamification/DelightElements';
import { Gift, Trophy, Target } from 'lucide-react';

interface GamificationSectionProps {
  expenses: Expense[];
}

const GamificationSection = ({ expenses }: GamificationSectionProps) => {
  const {
    userProgress,
    badges,
    activeChallenges,
    availableChallenges,
    newBadges,
    showConfetti,
    acceptChallenge,
    completeChallenge,
    setShowConfetti
  } = useGamification(expenses);

  const recentBadges = badges.filter(b => b.unlocked).slice(-3);
  const activeChallenge = activeChallenges[0]; // Show one active challenge
  const nextChallenge = availableChallenges[0]; // Show one available challenge

  return (
    <div className="space-y-6">
      {/* Confetti and Surprise Elements */}
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <SurpriseQuote quotes={SURPRISE_QUOTES} interval={45} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <ProgressTracker userProgress={userProgress} />

        {/* Recent Badges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBadges.length > 0 ? (
              <div className="flex gap-4 justify-center">
                {recentBadges.map(badge => (
                  <BadgeDisplay 
                    key={badge.id} 
                    badge={badge} 
                    size="lg" 
                    showDescription 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Your first badge is waiting! Log an expense to get started. 🌟
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Challenge */}
      {(activeChallenge || nextChallenge) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              {activeChallenge ? 'Active Challenge' : 'New Challenge Available'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChallengeCard
              challenge={activeChallenge || nextChallenge}
              onAccept={acceptChallenge}
              onComplete={completeChallenge}
            />
          </CardContent>
        </Card>
      )}

      {/* New Badge Celebration */}
      {newBadges.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center gap-4 mb-4">
              {newBadges.map(badge => (
                <BadgeDisplay key={badge.id} badge={badge} size="lg" />
              ))}
            </div>
            <h3 className="font-bold text-xl text-yellow-800 mb-2">
              🎉 Amazing! You earned {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}!
            </h3>
            <p className="text-yellow-700 mb-4">
              {newBadges[0]?.description}
            </p>
            <Button 
              onClick={() => setNewBadges([])}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Continue Your Journey! ✨
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationSection;
