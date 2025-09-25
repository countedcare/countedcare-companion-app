import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, User, CreditCard, Users, DollarSign, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useExpenseData } from '@/hooks/useExpenseData';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: {
    label: string;
    path: string;
  };
}

interface GettingStartedChecklistProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ 
  onClose, 
  showCloseButton = true 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useSupabaseProfile();
  const { recipients } = useSupabaseCareRecipients();
  const { expenses } = useExpenseData();
  const { accounts } = useLinkedAccounts();

  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const checklistItems: ChecklistItem[] = [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your name, email, and caregiving details',
        icon: <User className="h-5 w-5" />,
        completed: !!(profile?.name && profile?.email && profile?.household_agi),
        action: {
          label: 'Update Profile',
          path: '/profile'
        }
      },
      {
        id: 'recipients',
        title: 'Add Care Recipients',
        description: 'Set up profiles for family members you care for',
        icon: <Users className="h-5 w-5" />,
        completed: recipients.length > 0,
        action: {
          label: 'Add Recipients',
          path: '/care-recipients/new'
        }
      },
      {
        id: 'bank-account',
        title: 'Link Bank Account (Optional)',
        description: 'Connect your bank to automatically import medical transactions',
        icon: <CreditCard className="h-5 w-5" />,
        completed: accounts.length > 0,
        action: {
          label: 'Link Account',
          path: '/profile' // Will scroll to linked accounts section
        }
      },
      {
        id: 'first-expense',
        title: 'Track Your First Expense',
        description: 'Add a caregiving expense to get started',
        icon: <DollarSign className="h-5 w-5" />,
        completed: expenses.length > 0,
        action: {
          label: 'Add Expense',
          path: '/expenses/new'
        }
      },
      {
        id: 'tax-settings',
        title: 'Set Tax Information',
        description: 'Configure your household AGI for tax deduction tracking',
        icon: <FileText className="h-5 w-5" />,
        completed: !!(profile?.household_agi && profile?.household_agi > 0),
        action: {
          label: 'Set AGI',
          path: '/profile'
        }
      }
    ];

    setItems(checklistItems);
  }, [profile, recipients, expenses, accounts]);

  const completedCount = items.filter(item => item.completed).length;
  const progressPercent = (completedCount / items.length) * 100;

  const handleItemClick = (item: ChecklistItem) => {
    if (item.action && !item.completed) {
      navigate(item.action.path);
    }
  };

  if (completedCount === items.length) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">All Set!</h3>
                <p className="text-sm text-green-600">
                  You've completed all the getting started tasks.
                </p>
              </div>
            </div>
            {showCloseButton && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Getting Started</CardTitle>
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {items.length} completed</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="relative">
          <Carousel className="w-full" opts={{ align: "start", loop: false }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {items.map((item) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors h-20 ${
                      item.completed 
                        ? 'bg-green-50 border border-green-200' 
                        : item.action 
                          ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200' 
                          : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {item.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm leading-tight ${
                        item.completed ? 'text-green-800' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-xs leading-tight ${
                        item.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>

                    {!item.completed && item.action && (
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {completedCount > 0 && completedCount < items.length && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Great progress!</strong> Complete the remaining {items.length - completedCount} step{items.length - completedCount !== 1 ? 's' : ''} to unlock the full power of CountedCare.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GettingStartedChecklist;