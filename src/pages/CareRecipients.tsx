
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, User, ArrowUpRight } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CareRecipient, Expense } from '@/types/User';

const CareRecipients = () => {
  const navigate = useNavigate();
  const [recipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  
  // Get expense totals for each recipient
  const getRecipientTotal = (recipientId: string): number => {
    return expenses
      .filter(expense => expense.careRecipientId === recipientId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading">Care Recipients</h1>
          <Button onClick={() => navigate('/care-recipients/new')} className="bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recipient
          </Button>
        </div>
        
        {recipients.length > 0 ? (
          <div className="space-y-4">
            {recipients.map((recipient) => (
              <Card 
                key={recipient.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/care-recipients/${recipient.id}`)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-primary/10 rounded-full p-3 mr-4">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{recipient.name}</h3>
                      <p className="text-sm text-gray-500">{recipient.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <span className="block font-semibold text-gray-900">
                        ${getRecipientTotal(recipient.id).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">Total expenses</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No care recipients added yet</div>
            <Button onClick={() => navigate('/care-recipients/new')} className="bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Care Recipient
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CareRecipients;
