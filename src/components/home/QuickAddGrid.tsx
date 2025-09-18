import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, PenTool, Car, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAddGridProps {
  onOpenReceiptModal: () => void;
}

export function QuickAddGrid({ onOpenReceiptModal }: QuickAddGridProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Camera,
      title: 'Snap Receipt',
      description: 'Camera or upload',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      onClick: onOpenReceiptModal
    },
    {
      icon: PenTool,
      title: 'Manual Entry',
      description: 'Add expense form',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      onClick: () => navigate('/expenses/new')
    },
    {
      icon: Car,
      title: 'Track Mileage',
      description: 'Travel expenses',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      onClick: () => navigate('/expenses/new?category=transportation&subcategory=mileage')
    },
    {
      icon: Pill,
      title: 'Medical Visit',
      description: 'Prescriptions & visits',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      onClick: () => navigate('/expenses/new?category=medical')
    }
  ];

  return (
    <div className="px-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Add</CardTitle>
          <p className="text-sm text-gray-600">Choose how you'd like to track an expense</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-24 flex flex-col items-center justify-center space-y-2 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                  onClick={action.onClick}
                >
                  <div className={`p-3 rounded-xl ${action.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${action.textColor}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900 text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}