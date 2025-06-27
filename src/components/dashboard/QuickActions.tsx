
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Button 
        onClick={() => navigate('/expenses/new')} 
        className="flex-col h-20 sm:h-24 bg-primary text-white text-sm sm:text-base"
      >
        <PlusCircle className="mb-1 sm:mb-2" size={20} />
        <span>Add Expense</span>
      </Button>
      <Button 
        onClick={() => navigate('/care-recipients/new')} 
        className="flex-col h-20 sm:h-24 bg-accent text-accent-foreground text-sm sm:text-base"
      >
        <PlusCircle className="mb-1 sm:mb-2" size={20} />
        <span>Add Care Recipient</span>
      </Button>
    </div>
  );
};

export default QuickActions;
