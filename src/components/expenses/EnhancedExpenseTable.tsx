import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Receipt, Calendar as CalendarIcon, CreditCard, PenTool, 
  CheckCircle, XCircle, Clock, Edit3, Check, X, 
  Trash2, Tag, DollarSign, MoreHorizontal, Star
} from 'lucide-react';
import { Expense, CareRecipient, EXPENSE_CATEGORIES } from '@/types/User';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EnhancedExpenseTableProps {
  expenses: Expense[];
  recipients: CareRecipient[];
  onExpenseClick: (expenseId: string) => void;
  onTriageAction?: (expenseId: string, action: 'keep' | 'skip') => void;
  onExpenseUpdate?: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  onBulkAction?: (expenseIds: string[], action: 'delete' | 'tax-deductible' | 'category', value?: any) => Promise<void>;
}

const EnhancedExpenseTable: React.FC<EnhancedExpenseTableProps> = ({ 
  expenses, 
  recipients, 
  onExpenseClick, 
  onTriageAction,
  onExpenseUpdate,
  onBulkAction
}) => {
  const { toast } = useToast();
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<{expenseId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    setShowBulkActions(selectedExpenses.length > 0);
  }, [selectedExpenses]);

  const getRecipientName = (careRecipientId: string) => {
    if (careRecipientId === 'self') return 'Self';
    const recipient = recipients.find(r => r.id === careRecipientId);
    return recipient?.name || 'Unknown';
  };

  const isAutoImported = (expense: Expense) => {
    return !!expense.synced_transaction_id;
  };

  const getTriageStatusBadge = (triageStatus?: string) => {
    switch (triageStatus) {
      case 'kept':
        return (
          <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Kept
          </Badge>
        );
      case 'skipped':
        return (
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
            <XCircle className="h-3 w-3 mr-1" />
            Skipped
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Needs Review
          </Badge>
        );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(expenses.map(e => e.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(id => id !== expenseId));
    }
  };

  const startEditing = (expenseId: string, field: string, currentValue: any) => {
    setEditingField({ expenseId, field });
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField || !onExpenseUpdate) return;

    try {
      await onExpenseUpdate(editingField.expenseId, {
        [editingField.field]: editValue
      });
      
      setEditingField(null);
      setEditValue('');
      
      toast({
        title: "Updated",
        description: "Expense updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense.",
        variant: "destructive"
      });
    }
  };

  const handleQuickToggle = async (expenseId: string, field: string, currentValue: boolean) => {
    if (!onExpenseUpdate) return;

    try {
      await onExpenseUpdate(expenseId, {
        [field]: !currentValue
      });
      
      toast({
        title: "Updated",
        description: `Expense ${field.replace('is_', '').replace('_', ' ')} status updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkAction) return;
    await onBulkAction(selectedExpenses, 'delete');
    setSelectedExpenses([]);
  };

  const handleBulkTaxDeductible = async () => {
    if (!onBulkAction) return;
    await onBulkAction(selectedExpenses, 'tax-deductible', true);
    setSelectedExpenses([]);
  };

  const handleBulkCategory = async (category: string) => {
    if (!onBulkAction) return;
    await onBulkAction(selectedExpenses, 'category', category);
    setSelectedExpenses([]);
  };

  const renderEditableField = (expense: Expense, field: string, currentValue: any, type: 'text' | 'number' | 'select' | 'date' = 'text') => {
    const isEditing = editingField?.expenseId === expense.id && editingField?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2 min-w-0">
          {type === 'select' && field === 'category' ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === 'date' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {editValue ? format(new Date(editValue), 'MMM d') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editValue ? new Date(editValue) : undefined}
                  onSelect={(date) => date && setEditValue(date.toISOString().split('T')[0])}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              className="h-8 text-xs w-full"
              autoFocus
            />
          )}
          <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0">
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 w-8 p-0">
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 group"
        onClick={() => startEditing(expense.id, field, currentValue)}
      >
        <span className="truncate">{
          field === 'amount' ? `$${currentValue.toLocaleString()}` :
          field === 'date' ? new Date(currentValue).toLocaleDateString() :
          currentValue || 'Click to edit'
        }</span>
        <Edit3 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={handleBulkTaxDeductible}>
                    <Star className="h-3 w-3 mr-1" />
                    Mark Tax Deductible
                  </Button>
                  <Select onValueChange={handleBulkCategory}>
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue placeholder="Set Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedExpenses([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[120px]">Category</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Recipient</TableHead>
                <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TableRow 
                    key={expense.id} 
                    className={cn(
                      "hover:bg-muted/50",
                      selectedExpenses.includes(expense.id) && "bg-orange-50 border-l-2 border-l-orange-500",
                      isAutoImported(expense) && !selectedExpenses.includes(expense.id) && "bg-blue-50/30 border-l-2 border-l-blue-500",
                      expense.triage_status === 'skipped' && "opacity-60"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedExpenses.includes(expense.id)}
                        onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div onClick={(e) => e.stopPropagation()}>
                        {renderEditableField(expense, 'date', expense.date, 'date')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] space-y-1">
                        <div onClick={(e) => e.stopPropagation()}>
                          {renderEditableField(expense, 'description', expense.description || expense.category)}
                        </div>
                        <div className="flex items-center space-x-1">
                          {isAutoImported(expense) ? (
                            <Badge variant="secondary" className="text-xs flex items-center">
                              <CreditCard className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Auto-imported</span>
                              <span className="sm:hidden">Auto</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs flex items-center">
                              <PenTool className="h-3 w-3 mr-1" />
                              Manual
                            </Badge>
                          )}
                        </div>
                        <div className="block sm:hidden">
                          <Badge variant="outline" className="text-xs mr-1">
                            {expense.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getRecipientName(expense.careRecipientId)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div onClick={(e) => e.stopPropagation()}>
                        {renderEditableField(expense, 'category', expense.category, 'select')}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {getRecipientName(expense.careRecipientId)}
                    </TableCell>
                    <TableCell className="font-semibold text-right">
                      <div onClick={(e) => e.stopPropagation()}>
                        {renderEditableField(expense, 'amount', expense.amount, 'number')}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 flex-wrap">
                          {getTriageStatusBadge(expense.triage_status)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickToggle(expense.id, 'is_tax_deductible', expense.is_tax_deductible || false);
                            }}
                            className={cn(
                              "text-xs px-2 py-1 rounded-full border transition-colors",
                              expense.is_tax_deductible 
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-yellow-50"
                            )}
                          >
                            <Star className={cn("h-3 w-3 mr-1 inline", expense.is_tax_deductible && "fill-current")} />
                            {expense.is_tax_deductible ? 'Tax Deductible' : 'Not Deductible'}
                          </button>
                          {expense.is_reimbursed && (
                            <Badge variant="default" className="text-xs">
                              Reimbursed
                            </Badge>
                          )}
                        </div>
                        {isAutoImported(expense) && (
                          <div className="text-xs text-blue-600 flex items-center">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Bank sync
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expense.receiptUrl && (
                          <Receipt className="h-4 w-4 text-primary" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExpenseClick(expense.id);
                          }}
                          className="h-8 px-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {/* Triage Actions */}
                        {expense.triage_status === 'pending' && onTriageAction && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTriageAction(expense.id, 'keep');
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Keep
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTriageAction(expense.id, 'skip');
                              }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Skip
                            </Button>
                          </div>
                        )}
                        
                        {/* Show status for already triaged items */}
                        {expense.triage_status !== 'pending' && (
                          <div className="text-xs text-muted-foreground">
                            {expense.triage_status === 'kept' ? 'Kept for tracking' : 'Skipped from tracking'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No expenses found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExpenseTable;