
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, CheckCircle, TrendingUp, Award, Calendar, LightbulbIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense, CareRecipient } from '@/types/User';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useLocalStorage<User>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!user.onboardingComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Get current date for welcome banner
  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);
  
  // Find the most recent expense date
  const lastTrackedDate = expenses.length > 0 
    ? new Date(Math.max(...expenses.map(e => new Date(e.date).getTime())))
    : null;
  
  const formattedLastTracked = lastTrackedDate 
    ? lastTrackedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "No expenses yet";
    
  // Calculate progress percentage (for demonstration - in real app this could be based on goals)
  const progressPercentage = 70;
  
  // Get caregiving quotes
  const quotes = [
    "Setting boundaries is essential for long-term caregiving",
    "Self-care isn't selfish, it's necessary for caregivers",
    "Take one day at a time and celebrate small victories",
    "Asking for help is a sign of strength, not weakness",
    "Every caregiver has a unique journey worth honoring"
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Get unique care recipients from expenses
  const uniqueRecipients = new Set(
    expenses
      .filter(expense => expense.careRecipientName)
      .map(expense => expense.careRecipientName)
  );
  
  // Get upcoming appointments (placeholder - in a real app, this would come from a calendar)
  const upcomingAppointment = {
    title: "Annual checkup",
    date: new Date(currentDate.getFullYear(), 5, 4), // June 4
    daysAway: 14
  };

  return (
    <Layout>
      <div className="container py-6">
        {/* Welcome Banner with Quote */}
        <Card className="mb-6 bg-blue-50 border-0">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center">
              <div className="bg-white p-4 rounded-full mr-4">
                <div className="text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-semibold">Welcome, {user.name || 'Caregiver'}!</h1>
                <p className="text-gray-600">Today is {formattedDate}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg flex items-start">
              <LightbulbIcon className="text-amber-500 mr-3 mt-1" />
              <p className="text-gray-800 italic text-lg">"{randomQuote}"</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tracking Progress Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-green-500 mr-2" />
                <h2 className="text-lg font-medium">Tracking Progress</h2>
              </div>
              <div className="mb-4">
                <span className="text-5xl font-bold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-gray-500">Last tracked: {formattedLastTracked}</p>
            </CardContent>
          </Card>
          
          {/* Total Tracked Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Total Tracked</h2>
              </div>
              <div className="mb-4">
                <span className="text-5xl font-bold">{formatCurrency(totalExpenses)}</span>
              </div>
              <p className="text-gray-500">
                Across {expenses.length} expenses for {uniqueRecipients.size} {uniqueRecipients.size === 1 ? 'person' : 'people'}
              </p>
            </CardContent>
          </Card>
          
          {/* Upcoming Appointments */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="text-purple-500 mr-2" />
                <h2 className="text-lg font-medium">Upcoming</h2>
              </div>
              <h3 className="text-xl font-semibold mb-2">{upcomingAppointment.title}</h3>
              <div className="flex items-center">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  June 4
                </span>
                <span className="ml-2 text-gray-500">{upcomingAppointment.daysAway} days away</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Achievement Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Award className="text-amber-500 mr-2" />
                <h2 className="text-lg font-medium">Achievement</h2>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dedicated Caregiver</h3>
              <p className="text-gray-500">
                You've been consistently tracking expenses for {uniqueRecipients.size} {uniqueRecipients.size === 1 ? 'person' : 'people'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Button 
          className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
          onClick={() => navigate('/resources')}
        >
          Get Personalized Caregiving Tips
        </Button>
      </div>
    </Layout>
  );
};

export default Dashboard;
