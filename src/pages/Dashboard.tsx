
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User, Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import ExpenseSummaryCard from '@/components/dashboard/ExpenseSummaryCard';
import ExpenseAccountsList from '@/components/dashboard/ExpenseAccountsList';
import QuickActions from '@/components/dashboard/QuickActions';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import LatestExpenses from '@/components/dashboard/LatestExpenses';
import GamificationSection from '@/components/dashboard/GamificationSection';

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
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  
  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!user.onboardingComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate total expenses for current period
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      if (timeFrame === 'month') {
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      } else {
        return expenseDate.getFullYear() === currentYear;
      }
    });
  }, [expenses, timeFrame, currentMonth, currentYear]);
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const yearlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);
  
  // Calculate tax threshold based on income
  const householdAGI = user.householdAGI || 100000; // Default 100k if not set
  const incomeThreshold = householdAGI * 0.075; // 7.5% of income
  const incomeProgressPercentage = Math.min((yearlyExpenses / incomeThreshold) * 100, 100);
  
  // Get the latest expenses
  const latestExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);
  
  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {};
    
    // Initialize all months/categories
    if (timeFrame === 'month') {
      EXPENSE_CATEGORIES.forEach(category => {
        data[category] = 0;
      });
      
      // Fill in actual data
      filteredExpenses.forEach(expense => {
        data[expense.category] += expense.amount;
      });
      
      return Object.entries(data).map(([name, amount]) => ({
        name,
        amount
      }));
    } else {
      // Initialize all months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthNames.forEach(month => {
        data[month] = 0;
      });
      
      // Fill in actual data
      expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      }).forEach(expense => {
        const expenseDate = new Date(expense.date);
        const monthName = monthNames[expenseDate.getMonth()];
        data[monthName] += expense.amount;
      });
      
      return Object.entries(data).map(([name, amount]) => ({
        name,
        amount
      }));
    }
  }, [filteredExpenses, timeFrame, EXPENSE_CATEGORIES, expenses, currentYear]);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const nextPayday = useMemo(() => {
    // Just a simple calculation - assuming payday is every 2 weeks on Friday
    const today = new Date();
    const friday = new Date();
    friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
    if ((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 7) {
      friday.setDate(friday.getDate() + 14);
    }
    const daysUntil = Math.ceil((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  }, []);

  return (
    <Layout>
      <div className="container-padding py-6">
        <WelcomeBanner user={user} />

        <ExpenseSummaryCard
          totalExpenses={totalExpenses}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          incomeThreshold={incomeThreshold}
          yearlyExpenses={yearlyExpenses}
          incomeProgressPercentage={incomeProgressPercentage}
          nextPayday={nextPayday}
          formatCurrency={formatCurrency}
        />

        <ExpenseAccountsList categoryTotals={categoryTotals} />

        <QuickActions />

        <GamificationSection expenses={expenses} />

        <ExpenseChart
          timeFrame={timeFrame}
          categoryTotals={categoryTotals}
          monthlyData={monthlyData}
          filteredExpenses={filteredExpenses}
        />

        <LatestExpenses latestExpenses={latestExpenses} />
      </div>
    </Layout>
  );
};

export default Dashboard;
