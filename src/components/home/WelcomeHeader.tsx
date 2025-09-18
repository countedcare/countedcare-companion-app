import React from 'react';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';

interface WelcomeHeaderProps {
  profile: any;
}

export function WelcomeHeader({ profile }: WelcomeHeaderProps) {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");
  
  // Dynamic greeting based on time of day
  const hour = currentDate.getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="px-4 pt-6">
      <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <Heart className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Hi {profile?.name?.split(' ')[0] || 'there'}, let's make caregiving count today 👋
            </h1>
            <p className="text-gray-600 mb-4">
              {formattedDate} • You're doing amazing work
            </p>
            
            {/* Snapshot placeholder - this would be calculated from expenses */}
            <div className="bg-white/70 rounded-lg px-4 py-2 inline-block">
              <p className="text-sm text-gray-700">
                You've tracked <span className="font-semibold text-primary">$2,485</span> in caregiving expenses this month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}