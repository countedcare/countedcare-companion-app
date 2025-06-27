import React from 'react';
import { Heart, LightbulbIcon, Sparkles, MapPin, DollarSign } from 'lucide-react';
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

  // Calculate tax deduction threshold based on income (7.5% of AGI for medical expenses)
  const getTaxThreshold = () => {
    if (user.householdAGI) {
      return Math.round(user.householdAGI * 0.075);
    }
    return null;
  };

  const taxThreshold = getTaxThreshold();

  return (
    <div className="w-full mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-accent-light rounded-lg p-4 sm:p-6 animate-fade-in">
      <div className="flex items-start">
        <div className="bg-white p-2 sm:p-3 rounded-full mr-3 sm:mr-4 shadow-sm flex-shrink-0">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-800 mb-1 leading-tight">
            {greeting}, {user.name || 'amazing caregiver'}! 🌟
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3">
            Today is {formattedDate} • You're doing something beautiful
          </p>
          
          {/* Show personalized info based on onboarding data */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-3 text-xs sm:text-sm">
            {user.state && user.zipCode && (
              <div className="flex items-center space-x-1 text-gray-600">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{user.state}, {user.zipCode}</span>
              </div>
            )}
            
            {user.numberOfDependents && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Caring for {user.numberOfDependents} {user.numberOfDependents === 1 ? 'person' : 'people'}</span>
              </div>
            )}
            
            {taxThreshold && (
              <div className="flex items-center space-x-1 text-gray-600">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Tax threshold: ${taxThreshold.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Inspirational Quote Card */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 flex items-start shadow-sm border-l-4 border-primary">
        <div className="text-amber-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-primary mb-1">
            Daily Reminder
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{todaysQuote}</p>
        </div>
      </div>
      
      {/* Personalized insights based on profile completion */}
      {user.primaryCaregivingExpenses && user.primaryCaregivingExpenses.length > 0 && (
        <div className="bg-green-50 rounded-lg p-3 mt-3 border border-green-200">
          <p className="text-xs sm:text-sm text-green-800">
            <span className="font-medium">Tracking focus:</span> We'll help you track {user.primaryCaregivingExpenses.length} types of expenses you selected during setup.
          </p>
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
