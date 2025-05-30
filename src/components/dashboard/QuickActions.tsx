
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button 
        onClick={() => navigate('/expenses/new')} 
        className="flex-col h-24 bg-primary text-white"
      >
        <PlusCircle className="mb-1" size={24} />
        <span>Add Expense</span>
      </Button>
      <Button 
        onClick={() => navigate('/care-recipients/new')} 
        className="flex-col h-24 bg-accent text-accent-foreground"
      >
        <PlusCircle className="mb-1" size={24} />
        <span>Add Care Recipient</span>
      </Button>
    </div>
  );
};

export default QuickActions;
