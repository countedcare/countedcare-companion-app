import React, { useState, useEffect } from 'react';
import { X, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BetaBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('beta-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('beta-banner-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="container-padding flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <TestTube className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium">Beta Version</span>
          <span className="text-muted-foreground">
            You're using our beta version. Help us improve by sharing feedback!
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="text-primary hover:bg-primary/10 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default BetaBanner;