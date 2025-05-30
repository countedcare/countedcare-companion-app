
import React from 'react';
import { Heart, LightbulbIcon } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/types/User';

interface WelcomeBannerProps {
  user: User;
}

const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");
  const caregiverQuote = "Setting boundaries is essential for long-term caregiving";

  return (
    <div className="w-full mb-6 bg-blue-100 rounded-lg p-6">
      <div className="flex items-start">
        <div className="bg-white p-3 rounded-full mr-4">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-800">
            Welcome, {user.name || 'there'}!
          </h1>
          <p className="text-gray-600">Today is {formattedDate}</p>
        </div>
      </div>
      
      {/* Quote Card */}
      <div className="bg-white rounded-lg p-4 mt-4 flex items-start">
        <div className="text-amber-500 mr-3">
          <LightbulbIcon className="h-5 w-5" />
        </div>
        <p className="text-gray-800 italic">"{caregiverQuote}"</p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
