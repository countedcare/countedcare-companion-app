import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useAllTransactions, TransactionFilters } from '@/hooks/useAllTransactions';
import { RefreshCw, Filter, TrendingUp, Clock, CheckCircle, XCircle, Stethoscope } from 'lucide-react';

const Transactions = () => {
  const [filters, setFilters] = useState<TransactionFilters>({
    filter: 'all',
    limit: 20,
    offset: 0
  });

  const {
    transactions,
    loading,
    hasMore,
    updateTriageDecision,
    editAsExpense,
    loadMore,
    fetchTransactions
  } = useAllTransactions(filters);

  const handleFilterChange = (newFilter: TransactionFilters['filter']) => {
    setFilters(prev => ({
      ...prev,
      filter: newFilter,
      offset: 0
    }));
  };

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  const getFilterStats = () => {
    const total = transactions.length;
    const pending = transactions.filter(t => !t.triage_decision).length;
    const kept = transactions.filter(t => t.triage_decision === 'keep').length;
    const skipped = transactions.filter(t => t.triage_decision === 'skip').length;
    const expenses = transactions.filter(t => t.expense_id).length;
    const medical = transactions.filter(t => t.is_potential_medical || t.is_confirmed_medical).length;
    
    return { total, pending, kept, skipped, expenses, medical };
  };

  const stats = getFilterStats();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage your bank transactions
            </p>
          </div>
          
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Kept</p>
                <p className="font-bold">{stats.kept}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Skipped</p>
                <p className="font-bold">{stats.skipped}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Medical</p>
                <p className="font-bold">{stats.medical}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="font-bold">{stats.expenses}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.filter}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="pending">Needs Review</SelectItem>
                  <SelectItem value="kept">Kept</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="medical">Medical Related</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Showing: {filters.filter === 'all' ? 'All transactions' : 
                           filters.filter === 'pending' ? 'Transactions needing review' :
                           filters.filter === 'kept' ? 'Kept transactions' :
                           filters.filter === 'skipped' ? 'Skipped transactions' :
                           'Medical-related transactions'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onUpdateDecision={updateTriageDecision}
          onEditAsExpense={editAsExpense}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />

        {/* Help Text */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">💡 How to use this page:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Keep:</strong> Mark transactions you want to save as expenses</li>
              <li>• <strong>Skip:</strong> Hide transactions that aren't relevant for caregiving</li>
              <li>• <strong>Create Expense:</strong> Convert any transaction into a detailed expense entry</li>
              <li>• <strong>Edit Expense:</strong> Modify existing expenses created from transactions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;