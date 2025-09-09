
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Car, PenTool, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useSupabasePreferences } from '@/hooks/useSupabasePreferences';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { preferences, setPreference } = useSupabasePreferences();
  const lastUsedAction = preferences.preferences?.lastQuickAction || '';
  
  const quickActions = [
    {
      id: 'scan-receipt',
      title: 'Scan a Receipt',
      description: 'Capture or upload receipt photo',
      icon: Camera,
      action: () => {
        setPreference('lastQuickAction', 'scan-receipt');
        navigate('/expenses/new');
        onClose();
      }
    },
    {
      id: 'enter-mileage',
      title: 'Enter Mileage',
      description: 'Track car travel expenses',
      icon: Car,
      action: () => {
        setPreference('lastQuickAction', 'enter-mileage');
        // Navigate to expense form with mileage category pre-selected
        navigate('/expenses/new?category=transportation&subcategory=mileage');
        onClose();
      }
    },
    {
      id: 'manual-expense',
      title: 'Add Expense',
      description: 'Manual entry form',
      icon: PenTool,
      action: () => {
        setPreference('lastQuickAction', 'manual-expense');
        navigate('/expenses/new');
        onClose();
      }
    }
  ];

  // Sort actions to show most recently used first
  const sortedActions = [...quickActions].sort((a, b) => {
    if (a.id === lastUsedAction) return -1;
    if (b.id === lastUsedAction) return 1;
    return 0;
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl border-0 shadow-2xl">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="text-xl font-heading text-gray-800">
            How would you like to track today's caregiving cost?
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Choose your preferred way to add an expense
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-3 pb-6">
          {sortedActions.map((action, index) => {
            const Icon = action.icon;
            const isRecentlyUsed = action.id === lastUsedAction && lastUsedAction !== '';
            
            return (
              <Button
                key={action.id}
                onClick={action.action}
                variant="ghost"
                className={`w-full h-16 flex items-center justify-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                  isRecentlyUsed 
                    ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`p-3 rounded-xl ${
                  isRecentlyUsed ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isRecentlyUsed ? 'text-primary' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{action.title}</span>
                    {isRecentlyUsed && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Recent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-center pt-4 border-t">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickAddModal;
