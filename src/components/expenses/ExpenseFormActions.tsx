
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ExpenseFormActionsProps {
  isEditing: boolean;
  onDelete?: () => void;
}

const ExpenseFormActions: React.FC<ExpenseFormActionsProps> = ({
  isEditing,
  onDelete
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 space-y-3">
      <Button type="submit" className="w-full bg-primary">
        {isEditing ? 'Update' : 'Save'} Expense
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate('/expenses')} 
        className="w-full"
      >
        Cancel
      </Button>
      
      {isEditing && onDelete && (
        <Button 
          type="button" 
          variant="destructive" 
          onClick={onDelete} 
          className="w-full"
        >
          Delete Expense
        </Button>
      )}
    </div>
  );
};

export default ExpenseFormActions;
