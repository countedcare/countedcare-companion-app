import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Receipt, Calendar, MapPin, DollarSign, Star, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExpenseData } from '@/hooks/useExpenseData';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import ExpenseDetailsModal from '@/components/expenses/ExpenseDetailsModal';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { Expense } from '@/types/User';

export function EnhancedRecentActivity() {
  const navigate = useNavigate();
  const { getRecentExpenses, loading, stats, reloadExpenses } = useExpenseData();
  const { recipients } = useSupabaseCareRecipients();
  const [hoveredExpense, setHoveredExpense] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recentExpenses = getRecentExpenses(5);

  const getRecipientName = (recipientId: string | undefined) => {
    if (!recipientId) return null;
    const recipient = recipients.find(r => r.id === recipientId);
    return recipient?.name;
  };

  const getRecipientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Medical': 'bg-blue-100 text-blue-700 border-blue-200',
      'Transportation & Travel': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Home Care': 'bg-purple-100 text-purple-700 border-purple-200',
      'Equipment & Supplies': 'bg-orange-100 text-orange-700 border-orange-200',
      'Insurance & Premiums': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      default: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors.default;
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff <= 7) return `${daysDiff} days ago`;
    
    return format(date, 'MMM d');
  };

  const getExpenseIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Medical': Receipt,
      'Transportation & Travel': MapPin,
      'Home Care': Star,
      'Equipment & Supplies': DollarSign,
      'Insurance & Premiums': TrendingUp,
      default: Receipt
    };
    return icons[category] || icons.default;
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleExpenseUpdated = () => {
    reloadExpenses(); // Refresh the expense data
  };

  // Enhanced loading skeleton
  if (loading) {
    return (
      <div className="px-4">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                      <div className="flex space-x-2">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-gray-900">
              <Receipt className="h-5 w-5 mr-2 text-gray-600" />
              Recent Activity
              {stats.thisMonth > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  {stats.thisMonth} this month
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/expenses')}
              className="text-primary hover:text-primary/80 hover-scale"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-6">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Receipt className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to track your first expense?</h3>
              <p className="text-gray-500 mb-4">Start building your caregiving expense record today!</p>
              <Button 
                onClick={() => navigate('/expenses/form')}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense, index) => {
                const IconComponent = getExpenseIcon(expense.category);
                return (
                  <div
                    key={expense.id}
                    className={`group flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      hoveredExpense === expense.id 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 shadow-md transform scale-[1.02]' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleExpenseClick(expense)}
                    onMouseEnter={() => setHoveredExpense(expense.id)}
                    onMouseLeave={() => setHoveredExpense(null)}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${
                      hoveredExpense === expense.id ? 'bg-white shadow-md' : 'bg-white'
                    }`}>
                      <IconComponent className={`h-5 w-5 transition-colors duration-300 ${
                        hoveredExpense === expense.id ? 'text-primary' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                            {expense.vendor || expense.description || 'Expense'}
                            {expense.is_tax_deductible && (
                              <Star className="inline h-3 w-3 ml-1 text-yellow-500 fill-current" />
                            )}
                          </h4>
                          {getRecipientName(expense.care_recipient_id) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                                  {getRecipientInitials(getRecipientName(expense.care_recipient_id)!)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-primary">
                                {getRecipientName(expense.care_recipient_id)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`font-semibold transition-all duration-300 ml-2 ${
                          hoveredExpense === expense.id ? 'text-primary text-lg' : 'text-gray-900'
                        }`}>
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs border ${getCategoryColor(expense.category)}`}
                        >
                          {expense.category}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatRelativeDate(expense.date)}
                        </div>
                        {expense.receipt_url && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            Receipt ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <ArrowRight className={`h-4 w-4 text-gray-400 transition-all duration-300 ${
                      hoveredExpense === expense.id ? 'text-primary transform translate-x-1' : ''
                    }`} />
                  </div>
                );
              })}

              {/* Summary footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {stats.total} total expenses • {stats.deductible} potentially deductible
                  </span>
                  <span className="font-medium text-primary">
                    ${stats.totalAmount.toLocaleString()} tracked
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        expense={selectedExpense}
        recipients={recipients}
      />
    </div>
  );
}