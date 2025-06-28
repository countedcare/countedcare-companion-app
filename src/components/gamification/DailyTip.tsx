
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DAILY_TIPS } from '@/types/Gamification';
import { Lightbulb, CheckCircle } from 'lucide-react';

interface DailyTipProps {
  tipsRead: string[];
  onTipRead: (tipId: string) => void;
}

const DailyTip = ({ tipsRead, onTipRead }: DailyTipProps) => {
  const [currentTip, setCurrentTip] = useState<string>('');
  const [tipId, setTipId] = useState<string>('');

  useEffect(() => {
    // Get today's date as a string to determine which tip to show
    const today = new Date().toDateString();
    const tipIndex = Math.abs(today.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % DAILY_TIPS.length;
    
    setCurrentTip(DAILY_TIPS[tipIndex]);
    setTipId(`tip-${today}`);
  }, []);

  const isRead = tipsRead.includes(tipId);

  const handleMarkAsRead = () => {
    if (!isRead) {
      onTipRead(tipId);
    }
  };

  return (
    <Card className={`${isRead ? 'bg-green-50 border-green-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className={`h-5 w-5 ${isRead ? 'text-green-600' : 'text-yellow-600'}`} />
          Daily Financial Tip
          {isRead && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`text-sm ${isRead ? 'text-green-800' : 'text-yellow-800'}`}>
          💡 {currentTip}
        </p>
        
        {!isRead && (
          <Button 
            onClick={handleMarkAsRead}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Mark as Read
          </Button>
        )}
        
        {isRead && (
          <div className="text-xs text-green-600 font-medium">
            ✅ Great job learning something new today!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTip;
