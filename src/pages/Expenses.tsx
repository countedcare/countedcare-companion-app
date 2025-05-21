
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, Filter, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRecipient, setFilterRecipient] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !filterCategory || filterCategory === 'all-categories' || expense.category === filterCategory;
    const matchesRecipient = !filterRecipient || filterRecipient === 'all-recipients' || expense.careRecipientId === filterRecipient;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange && dateRange.from) {
      const expenseDate = new Date(expense.date);
      
      if (dateRange.to) {
        // Filter for range
        matchesDateRange = expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      } else {
        // Filter for single day
        matchesDateRange = expenseDate.toDateString() === dateRange.from.toDateString();
      }
    }
    
    return matchesSearch && matchesCategory && matchesRecipient && matchesDateRange;
  });
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading">Expenses</h1>
          <Button onClick={() => navigate('/expenses/new')} className="bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search expenses..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterRecipient} onValueChange={setFilterRecipient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-recipients">All Recipients</SelectItem>
                <SelectItem value="self">Self</SelectItem>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>{recipient.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={(value) => value && setDateRange(value)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              <div className="p-3 border-t border-border flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateRange(undefined)}
                >
                  Clear
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange({
                        from: firstDay,
                        to: today
                      });
                    }}
                  >
                    This Month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const today = new Date();
                      const thirtyDaysAgo = new Date(today);
                      thirtyDaysAgo.setDate(today.getDate() - 30);
                      setDateRange({
                        from: thirtyDaysAgo,
                        to: today
                      });
                    }}
                  >
                    Last 30 Days
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Expense List */}
        {sortedExpenses.length > 0 ? (
          <div className="space-y-4">
            {sortedExpenses.map((expense) => {
              const recipient = recipients.find(r => r.id === expense.careRecipientId);
              const recipientName = expense.careRecipientId === 'self' ? 'Self' : recipient?.name;
              
              return (
                <Card key={expense.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/expenses/${expense.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{expense.description || expense.category}</h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>
                            {new Date(expense.date).toLocaleDateString()}
                            {recipientName && ` • ${recipientName}`}
                          </div>
                          <div className="inline-block bg-neutral px-2 py-0.5 rounded text-xs">
                            {expense.category}
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold">${expense.amount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No expenses found</div>
            <Button onClick={() => navigate('/expenses/new')} className="bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Expense
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;
