import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, PenTool, Car, Stethoscope } from 'lucide-react';
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
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-300',
      onClick: onOpenReceiptModal
    },
    {
      icon: PenTool,
      title: 'Manual Entry',
      description: 'Add expense form',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200 hover:border-purple-300',
      onClick: () => navigate('/expenses/new')
    },
    {
      icon: Car,
      title: 'Track Mileage',
      description: 'Travel expenses',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200 hover:border-emerald-300',
      onClick: () => navigate('/mileage/new')
    },
    {
      icon: Stethoscope,
      title: 'Medical Visit',
      description: 'Prescriptions & visits',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200 hover:border-pink-300',
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
                  key={action.title}
                  variant="ghost"
                  className={`h-28 flex flex-col items-center justify-center space-y-3 p-4 rounded-xl border-2 ${action.borderColor} hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group`}
                  onClick={action.onClick}
                >
                  <div className={`p-3 rounded-full ${action.bgColor} transition-colors duration-300 shadow-sm`}>
                    <IconComponent className={`h-7 w-7 ${action.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-sm mb-1">{action.title}</div>
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