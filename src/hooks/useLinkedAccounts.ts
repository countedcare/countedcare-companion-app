
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { LinkedAccount } from '@/types/FinancialAccount';
import useLocalStorage from '@/hooks/useLocalStorage';

export const useLinkedAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use local storage for data persistence
  const [localAccounts, setLocalAccounts] = useLocalStorage<LinkedAccount[]>('countedcare-linked-accounts', []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Always use local storage since authentication is removed
      setAccounts(localAccounts);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      // Fallback to local storage on error
      setAccounts(localAccounts);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<LinkedAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Always use local storage since authentication is removed
      const newAccount: LinkedAccount = {
        id: crypto.randomUUID(),
        user_id: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...accountData
      };

      const updatedAccounts = [newAccount, ...localAccounts];
      setLocalAccounts(updatedAccounts);
      setAccounts(updatedAccounts);
      
      toast({
        title: "Account Added",
        description: `${accountData.account_name} has been linked successfully`
      });

      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to link account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      // Always use local storage since authentication is removed
      const updatedAccounts = localAccounts.filter(account => account.id !== accountId);
      setLocalAccounts(updatedAccounts);
      setAccounts(updatedAccounts);

      toast({
        title: "Account Removed",
        description: "Account has been unlinked successfully"
      });
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [localAccounts]);

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
    refetch: fetchAccounts
  };
};
