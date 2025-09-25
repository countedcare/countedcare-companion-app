import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
}

interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
}

interface InteractiveTutorialProps {
  tutorialId?: string;
  onComplete?: () => void;
  onClose?: () => void;
}

const tutorials: TutorialConfig[] = [
  {
    id: 'home-overview',
    name: 'Home Dashboard Tour',
    description: 'Learn about your dashboard and quick actions',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to CountedCare!',
        content: 'This tour will show you around your dashboard and help you get started tracking caregiving expenses.',
        target: 'body',
        position: 'center'
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        content: 'Your recent expenses and transactions appear here. This gives you a quick overview of your latest caregiving costs.',
        target: '[data-tour="recent-activity"]',
        position: 'bottom'
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        content: 'Use these buttons to quickly add expenses, scan receipts, or access common features.',
        target: '[data-tour="quick-actions"]',
        position: 'top'
      },
      {
        id: 'navigation',
        title: 'Main Navigation',
        content: 'Navigate between different sections using the bottom menu (mobile) or header menu (desktop).',
        target: '[data-tour="navigation"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'expense-tracking',
    name: 'Expense Tracking',
    description: 'Learn how to add and manage expenses',
    steps: [
      {
        id: 'add-expense',
        title: 'Adding Expenses',
        content: 'Click this button to manually add a new caregiving expense. You can also upload receipt photos here.',
        target: '[data-tour="add-expense"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'expense-list',
        title: 'Your Expense List',
        content: 'All your tracked expenses appear here. You can filter, search, and organize them by category or date.',
        target: '[data-tour="expense-list"]',
        position: 'top'
      },
      {
        id: 'filters',
        title: 'Smart Filters',
        content: 'Use these filters to find specific expenses. Filter by category, date range, tax status, or care recipient.',
        target: '[data-tour="filters"]',
        position: 'bottom'
      }
    ]
  }
];

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ 
  tutorialId = 'home-overview',
  onComplete,
  onClose 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const tutorial = tutorials.find(t => t.id === tutorialId);
  if (!tutorial) return null;

  const currentStep = tutorial.steps[currentStepIndex];
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (currentStep.target !== 'body') {
      const element = document.querySelector(currentStep.target);
      setHighlightedElement(element);
      
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      setHighlightedElement(null);
    }

    // Add overlay class to body
    document.body.classList.add('tutorial-active');
    
    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsVisible(false);
    document.body.classList.remove('tutorial-active');
    onComplete?.();
  };

  const handleClose = () => {
    setIsCompleted(true);
    setIsVisible(false);
    document.body.classList.remove('tutorial-active');
    onClose?.();
  };

  const getTooltipPosition = () => {
    if (!highlightedElement || currentStep.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const margin = 16;

    let style: React.CSSProperties = {
      position: 'fixed' as const,
      zIndex: 9999,
      maxWidth: tooltipWidth
    };

    switch (currentStep.position) {
      case 'top':
        style.bottom = window.innerHeight - rect.top + margin;
        style.left = Math.max(margin, rect.left + (rect.width - tooltipWidth) / 2);
        break;
      case 'bottom':
        style.top = rect.bottom + margin;
        style.left = Math.max(margin, rect.left + (rect.width - tooltipWidth) / 2);
        break;
      case 'left':
        style.right = window.innerWidth - rect.left + margin;
        style.top = Math.max(margin, rect.top + (rect.height - tooltipHeight) / 2);
        break;
      case 'right':
        style.left = rect.right + margin;
        style.top = Math.max(margin, rect.top + (rect.height - tooltipHeight) / 2);
        break;
    }

    return style;
  };

  // Prevent rendering if completed or not visible
  if (!isVisible || isCompleted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />
      
      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed border-2 border-primary rounded-lg pointer-events-none z-[9998]"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)'
          }}
        />
      )}

      {/* Tutorial Tooltip */}
      <Card 
        className="w-full max-w-sm shadow-2xl border-primary/20"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Step {currentStepIndex + 1} of {tutorial.steps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{tutorial.name}</span>
              <span>{Math.round(((currentStepIndex + 1) / tutorial.steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / tutorial.steps.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style>{`
        .tutorial-active {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default InteractiveTutorial;