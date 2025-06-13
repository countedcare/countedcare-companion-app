
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, FileText, Calculator } from 'lucide-react';
import { Expense, CareRecipient } from '@/types/User';

interface ExpenseRecommendationsProps {
  expenses: Expense[];
  recipients: CareRecipient[];
}

const ExpenseRecommendations: React.FC<ExpenseRecommendationsProps> = ({ expenses, recipients }) => {
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Tax deductibility insight
    const deductibleExpenses = expenses.filter(expense => expense.is_tax_deductible);
    const deductiblePercentage = expenses.length > 0 ? (deductibleExpenses.length / expenses.length) * 100 : 0;
    
    if (deductiblePercentage < 30 && expenses.length > 5) {
      recommendations.push({
        icon: Calculator,
        title: "Maximize Tax Benefits",
        description: "Only " + Math.round(deductiblePercentage) + "% of your expenses are marked as tax deductible. Review medical expenses and transportation costs—many caregiving expenses qualify for deductions.",
        action: "Review Tax Options",
        type: "tax"
      });
    }
    
    // Receipt tracking
    const expensesWithoutReceipts = expenses.filter(expense => !expense.receiptUrl && expense.amount > 50);
    if (expensesWithoutReceipts.length > 3) {
      recommendations.push({
        icon: FileText,
        title: "Keep Better Records",
        description: `${expensesWithoutReceipts.length} expenses over $50 are missing receipts. Digital receipts make tax filing easier and protect you during audits.`,
        action: "Add Receipts",
        type: "documentation"
      });
    }
    
    // Spending pattern insight
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, Object.keys(categoryTotals)[0]
    );
    
    if (topCategory === 'Transportation' && categoryTotals[topCategory] > 500) {
      recommendations.push({
        icon: TrendingUp,
        title: "Transportation Savings",
        description: `Transportation is your highest expense category at $${categoryTotals[topCategory].toLocaleString()}. Consider carpooling options or public transit discounts for caregivers.`,
        action: "Explore Options",
        type: "savings"
      });
    }
    
    // General encouragement if doing well
    if (deductiblePercentage > 70 && recommendations.length === 0) {
      recommendations.push({
        icon: Lightbulb,
        title: "Great Job Tracking!",
        description: "You're doing excellent work documenting your caregiving expenses. Your organized records will make tax season much smoother.",
        action: "Keep It Up",
        type: "encouragement"
      });
    }
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-primary" />
          Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
            <rec.icon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{rec.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {rec.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec.description}
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                {rec.action}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExpenseRecommendations;
