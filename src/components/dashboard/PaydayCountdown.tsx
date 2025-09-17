import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaydayCountdownProps {
  daysUntilPayday: number;
  nextPaydayDate?: Date;
}

export const PaydayCountdown: React.FC<PaydayCountdownProps> = ({
  daysUntilPayday,
  nextPaydayDate,
}) => {
  const formatPaydayMessage = () => {
    if (daysUntilPayday === 0) return 'Payday is today!';
    if (daysUntilPayday === 1) return 'Payday in 1 day';
    return `Payday in ${daysUntilPayday} days`;
  };

  return (
    <Card className="bg-white border-0 shadow-sm mx-4 mb-4">
      <CardContent className="p-4">
        <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium text-foreground">
              {formatPaydayMessage()}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
};