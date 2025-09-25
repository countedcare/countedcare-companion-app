import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenseData } from '@/hooks/useExpenseData';

interface EnhancedWelcomeHeaderProps {
  profile: any;
}

export function EnhancedWelcomeHeader({ profile }: EnhancedWelcomeHeaderProps) {
  const { stats, loading } = useExpenseData();
  const [currentInsight, setCurrentInsight] = useState(0);
  
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");
  
  // Dynamic greeting based on time of day
  const hour = currentDate.getHours();
  let greeting = "Hello";
  let timeEmoji = "👋";
  
  if (hour < 12) {
    greeting = "Good morning";
    timeEmoji = "🌅";
  } else if (hour < 17) {
    greeting = "Good afternoon";
    timeEmoji = "☀️";
  } else {
    greeting = "Good evening";
    timeEmoji = "🌙";
  }

  // Generate personalized insights based on user data
  const insights = [
    `You've tracked $${stats.thisMonthAmount.toLocaleString()} in caregiving expenses this month`,
    `${stats.deductible} of your expenses are potentially tax-deductible`,
    `You're making a difference with ${stats.total} tracked caregiving activities`,
    stats.thisYearAmount > 0 ? `$${stats.thisYearAmount.toLocaleString()} in potential tax savings this year` : "Ready to start tracking your caregiving journey",
    `${stats.reimbursed} expenses have been reimbursed - great job staying organized!`
  ].filter(Boolean);

  // Rotate insights every 4 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [insights.length]);

  // Achievement badges based on user activity
  const getAchievementBadge = () => {
    if (stats.total >= 50) return { icon: "🏆", text: "Tracking Champion" };
    if (stats.deductible >= 10) return { icon: "💰", text: "Tax Saver" };
    if (stats.thisMonth >= 5) return { icon: "🔥", text: "Active This Month" };
    if (stats.total >= 10) return { icon: "⭐", text: "Getting Started" };
    return { icon: "🚀", text: "Welcome!" };
  };

  const achievement = getAchievementBadge();

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="bg-white/70 p-3 rounded-full">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
              <div className="flex-1">
                <div className="h-8 bg-white/70 rounded-lg mb-2"></div>
                <div className="h-4 bg-white/50 rounded-lg mb-4 w-2/3"></div>
                <div className="h-10 bg-white/70 rounded-lg w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 rounded-2xl p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/50 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-full shadow-sm relative">
                <Heart className="h-6 w-6 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1 animate-fade-in">
                  {greeting}, {profile?.name?.split(' ')[0] || 'there'}! {timeEmoji}
                </h1>
                <p className="text-gray-600 mb-2">
                  {formattedDate} • You're doing amazing work
                </p>
              </div>
            </div>
            
            {/* Achievement Badge */}
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm hover-scale">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{achievement.icon}</span>
                <span className="text-sm font-medium text-gray-700">{achievement.text}</span>
              </div>
            </div>
          </div>
          
          {/* Dynamic Insights */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 relative">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-medium text-gray-700">Your Impact</span>
            </div>
            
            <div className="relative overflow-hidden h-6">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`absolute w-full transition-all duration-500 ease-in-out ${
                    index === currentInsight 
                      ? 'translate-y-0 opacity-100' 
                      : index < currentInsight 
                        ? '-translate-y-full opacity-0' 
                        : 'translate-y-full opacity-0'
                  }`}
                >
                  <p className="text-sm text-gray-700 font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress dots */}
            {insights.length > 1 && (
              <div className="flex justify-center space-x-1 mt-3">
                {insights.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentInsight ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center hover-scale">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-gray-600">This Month</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${stats.thisMonthAmount.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center hover-scale">
              <div className="flex items-center justify-center mb-1">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-gray-600">Deductible</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats.deductible}
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center hover-scale">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xs text-gray-600">Total</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}