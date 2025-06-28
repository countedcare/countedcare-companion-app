
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WeeklyMission } from '@/types/Gamification';
import { CheckCircle, Circle, Calendar } from 'lucide-react';

interface WeeklyMissionsProps {
  missions: WeeklyMission[];
  onMissionUpdate?: (missionId: string, progress: number) => void;
}

const WeeklyMissions = ({ missions, onMissionUpdate }: WeeklyMissionsProps) => {
  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Weekly Missions ({completedMissions}/{totalMissions})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map(mission => {
          const progress = (mission.current / mission.target) * 100;
          
          return (
            <div key={mission.id} className="space-y-2">
              <div className="flex items-center gap-3">
                {mission.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mission.emoji}</span>
                    <h4 className={`font-medium ${mission.completed ? 'text-green-700 line-through' : ''}`}>
                      {mission.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {mission.description}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {mission.current}/{mission.target}
                </div>
              </div>
              
              {!mission.completed && (
                <Progress value={progress} className="h-2" />
              )}
              
              {mission.completed && (
                <div className="bg-green-50 border border-green-200 rounded-md p-2">
                  <p className="text-sm text-green-700 font-medium">
                    ✨ {mission.reward}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {missions.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              New weekly missions coming soon! 🌟
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyMissions;
