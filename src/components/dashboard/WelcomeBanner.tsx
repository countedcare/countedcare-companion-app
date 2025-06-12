
import React from 'react';
import { Heart, LightbulbIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/types/User';

interface WelcomeBannerProps {
  user: User;
}

const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");
  
  // Array of supportive quotes for caregivers
  const caregiverQuotes = [
    "You're making a bigger difference than you know. Every act of care matters. 💙",
    "Taking care of the details now helps you take better care of what matters most.",
    "Small steps today create big peace of mind tomorrow. You've got this! ✨",
    "Your love shows up in every expense you track. That's beautiful.",
    "Caring for someone is both the hardest and most meaningful work there is.",
    "Every dollar you document is a dollar working harder for your family's future.",
    "You're not just managing money—you're creating security and showing love."
  ];
  
  // Get a consistent quote based on the day (so it doesn't change on refresh)
  const quoteIndex = Math.floor(currentDate.getDate() % caregiverQuotes.length);
  const todaysQuote = caregiverQuotes[quoteIndex];

  // Dynamic greeting based on time of day
  const hour = currentDate.getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="w-full mb-6 bg-gradient-to-r from-blue-50 to-accent-light rounded-lg p-6 animate-fade-in">
      <div className="flex items-start">
        <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
          <Heart className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-semibold text-gray-800 mb-1">
            {greeting}, {user.name || 'amazing caregiver'}! 🌟
          </h1>
          <p className="text-gray-600 mb-3">
            Today is {formattedDate} • You're doing something beautiful
          </p>
        </div>
      </div>
      
      {/* Inspirational Quote Card */}
      <div className="bg-white rounded-lg p-4 mt-4 flex items-start shadow-sm border-l-4 border-primary">
        <div className="text-amber-500 mr-3 mt-1">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-gray-800 font-medium text-sm uppercase tracking-wide text-primary mb-1">
            Daily Reminder
          </p>
          <p className="text-gray-700 leading-relaxed">{todaysQuote}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
