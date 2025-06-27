
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickAddModal from '@/components/QuickAddModal';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg border-4 border-white relative -mt-7 transition-all duration-200 hover:scale-105"
          aria-label="Quick add expense"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      <QuickAddModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default FloatingActionButton;
