
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6DAAE2', '#A0D5D8', '#7FC7D9', '#5F9EA0', '#87CEEB', '#B0C4DE'];

interface CategoryTotal {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  amount: number;
}

interface ExpenseChartProps {
  timeFrame: 'month' | 'year';
  categoryTotals: CategoryTotal[];
  monthlyData: MonthlyData[];
  filteredExpenses: any[];
}

const ExpenseChart = ({ timeFrame, categoryTotals, monthlyData, filteredExpenses }: ExpenseChartProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 justify-between items-center">
          <h3 className="font-medium">
            {timeFrame === 'month' ? 'By Category' : 'Monthly Spending'}
          </h3>
        </div>
        
        <div className="h-[250px]">
          {timeFrame === 'month' ? (
            // Pie Chart for category breakdown
            filteredExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartTooltip formatter={(value) => `$${value}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No expense data to display
              </div>
            )
          ) : (
            // Bar Chart for monthly spending
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="amount" fill="#6DAAE2" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;
