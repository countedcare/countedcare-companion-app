import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  navigateTo?: string; // Optional page to navigate to before showing this step
  delay?: number; // Optional delay in ms before showing the step after navigation
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
    id: 'complete-onboarding',
    name: 'Complete App Tour',
    description: 'Complete walkthrough of CountedCare features',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to CountedCare!',
        content: 'Let\'s take a complete tour of your caregiving companion. We\'ll show you how to set up your profile, add care recipients, and track expenses effectively.',
        target: 'body',
        position: 'center'
      },
      {
        id: 'profile-overview',
        title: 'Your Profile Dashboard',
        content: 'This is your home dashboard where you can see your recent activity, quick actions, and progress tracking.',
        target: '[data-tour="dashboard-content"]',
        position: 'center'
      },
      {
        id: 'profile-setup',
        title: 'Navigate to Profile',
        content: 'Click on the Profile tab in the bottom navigation to access your profile settings and manage your caregiving information.',
        target: '[data-tour="profile-link"]',
        position: 'top'
      },
      {
        id: 'profile-overview',
        title: 'Your Profile Overview',
        content: 'Here you can see your profile completion status and basic information. Complete your profile to get personalized insights.',
        target: '[data-tour="profile-overview"]',
        position: 'bottom',
        navigateTo: '/profile',
        delay: 1500
      },
      {
        id: 'care-recipients-section',
        title: 'Care Recipients',
        content: 'This section shows the people you care for. Adding care recipients helps organize your expenses and provides better tracking.',
        target: '[data-tour="care-recipients"]',
        position: 'top'
      },
      {
        id: 'add-care-recipient',
        title: 'Add Someone You Care For',
        content: 'Click this button to add a new care recipient. You can add their name, relationship, and optional medical conditions.',
        target: '[data-tour="add-care-recipient"]',
        position: 'bottom',
        navigateTo: '/care-recipients/new'
      },
      {
        id: 'care-recipient-form',
        title: 'Care Recipient Details',
        content: 'Fill out their basic information. Medical conditions are optional but help us provide more relevant resources and expense categories.',
        target: '[data-tour="care-recipient-form"]',
        position: 'center',
        delay: 500
      },
      {
        id: 'back-to-home',
        title: 'Quick Actions Hub',
        content: 'Now let\'s return to your dashboard to see the quick actions for expense tracking.',
        target: '[data-tour="quick-actions"]',
        position: 'top',
        navigateTo: '/home'
      },
      {
        id: 'add-expense-options',
        title: 'Add Expenses Quickly',
        content: 'These buttons let you add expenses in multiple ways: scan receipts with your camera, add manual entries, or track mileage.',
        target: '[data-tour="quick-actions"]',
        position: 'bottom',
        delay: 500
      },
      {
        id: 'expense-tracking',
        title: 'View All Expenses',
        content: 'Click here to see all your tracked expenses, filter them, and analyze your spending patterns.',
        target: '[data-tour="expenses-link"]',
        position: 'top',
        navigateTo: '/expenses'
      },
      {
        id: 'expense-list',
        title: 'Expense Management',
        content: 'Here you can view, edit, and organize all your caregiving expenses. Use filters to find specific transactions and see tax-deductible amounts.',
        target: '[data-tour="expense-list"]',
        position: 'center',
        delay: 500
      },
      {
        id: 'transaction-triage',
        title: 'Smart Transaction Review',
        content: 'Back on your home page, this section shows imported transactions from linked accounts that you can quickly categorize.',
        target: '[data-tour="transaction-triage"]',
        position: 'top',
        navigateTo: '/home'
      },
      {
        id: 'resources-section',
        title: 'Helpful Resources',
        content: 'Find financial assistance programs, discounts, and caregiving resources tailored to your location and needs.',
        target: '[data-tour="resources-link"]',
        position: 'top',
        navigateTo: '/resources'
      },
      {
        id: 'resources-overview',
        title: 'Browse Resources',
        content: 'Search and filter through hundreds of resources including government programs, local support, and financial assistance options.',
        target: '[data-tour="resources-content"]',
        position: 'center',
        delay: 500
      },
      {
        id: 'navigation-complete',
        title: 'Navigation & Next Steps',
        content: 'Use the bottom navigation to move between sections. You\'re now ready to start tracking your caregiving expenses and finding helpful resources!',
        target: '[data-tour="navigation"]',
        position: 'top',
        navigateTo: '/home'
      }
    ]
  }
];

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ 
  tutorialId = 'complete-onboarding',
  onComplete,
  onClose 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  
  const tutorial = tutorials.find(t => t.id === tutorialId);
  if (!tutorial) return null;

  const totalSteps = tutorial.steps.length;
  const currentStep = tutorial.steps[currentStepIndex];
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = useCallback(async () => {
    console.log(`🎯 Moving from step ${currentStepIndex + 1} to ${currentStepIndex + 2}`);
    
    if (isLastStep) {
      // Complete the tutorial
      document.body.classList.remove('tutorial-active');
      onComplete?.();
      return;
    }

    const nextStep = tutorial.steps[currentStepIndex + 1];
    
    // Handle navigation if needed
    if (nextStep.navigateTo) {
      console.log(`🎯 Navigating to: ${nextStep.navigateTo}`);
      setIsNavigating(true);
      navigate(nextStep.navigateTo);
      
      // Wait for navigation and optional delay - longer timeout for profile page
      const navigationDelay = nextStep.navigateTo === '/profile' ? 2000 : 800;
      const totalDelay = (nextStep.delay || 0) + navigationDelay;
      console.log(`🎯 Waiting ${totalDelay}ms for navigation and DOM to be ready`);
      
      setTimeout(() => {
        console.log(`🎯 Navigation complete, moving to step ${currentStepIndex + 2}`);
        setIsNavigating(false);
        setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
      }, totalDelay);
    } else {
      // Go to next step without navigation
      setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
    }
  }, [isLastStep, onComplete, totalSteps, navigate, tutorial.steps, currentStepIndex]);

  // Handle element highlighting
  useEffect(() => {
    const highlightElement = () => {
      console.log(`🎯 Tutorial Step ${currentStepIndex + 1}: Looking for element "${currentStep.target}"`);
      
      if (currentStep.target !== 'body') {
        const element = document.querySelector(currentStep.target);
        console.log(`🎯 Element found:`, element);
        
        if (!element) {
          console.warn(`🎯 Element not found for step ${currentStepIndex + 1}: ${currentStep.target}`);
          // Try multiple times to find the element with exponential backoff
          let attempts = 0;
          const findElement = () => {
            attempts++;
            const retryElement = document.querySelector(currentStep.target);
            console.log(`🎯 Retry attempt ${attempts}: Element found:`, retryElement);
            
            if (retryElement) {
              setHighlightedElement(retryElement);
              setTimeout(() => {
                retryElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center',
                  inline: 'center'
                });
              }, 100);
            } else if (attempts < 8) {
              // Exponential backoff: 200ms, 400ms, 800ms, etc.
              const delay = Math.min(200 * Math.pow(2, attempts - 1), 2000);
              console.log(`🎯 Will retry in ${delay}ms`);
              setTimeout(findElement, delay);
            } else {
              console.error(`🎯 Failed to find element after ${attempts} attempts: ${currentStep.target}`);
              // Continue without highlighting if element not found
              setHighlightedElement(null);
            }
          };
          setTimeout(findElement, 300);
        } else {
          setHighlightedElement(element);
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }, 100);
        }
      } else {
        setHighlightedElement(null);
      }
    };

    if (!isNavigating) {
      const delay = currentStep.delay || 0;
      if (delay > 0) {
        console.log(`🎯 Waiting ${delay}ms before highlighting element`);
        const timer = setTimeout(highlightElement, delay);
        return () => clearTimeout(timer);
      } else {
        // Add a small delay even when no explicit delay is set to ensure DOM is ready
        const timer = setTimeout(highlightElement, 100);
        return () => clearTimeout(timer);
      }
    }

    // Add overlay class to body
    document.body.classList.add('tutorial-active');
    
    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, [currentStep, isNavigating, currentStepIndex]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = tutorial.steps[currentStepIndex - 1];
      
      // Handle navigation if the previous step had navigation
      if (prevStep.navigateTo) {
        setIsNavigating(true);
        navigate(prevStep.navigateTo);
        
        setTimeout(() => {
          setIsNavigating(false);
          setCurrentStepIndex(prev => Math.max(prev - 1, 0));
        }, (prevStep.delay || 0) + 100);
      } else {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
      }
    }
  }, [isFirstStep, navigate, tutorial.steps, currentStepIndex]);

  const handleClose = useCallback(() => {
    document.body.classList.remove('tutorial-active');
    onClose?.();
  }, [onClose]);

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
    const tooltipWidth = 360;
    const tooltipHeight = 250;
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

  // Don't render if navigating
  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground text-center">Loading next step...</p>
        </div>
      </div>
    );
  }

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
        className="w-full max-w-md shadow-2xl border-primary/20 bg-white"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Step {currentStepIndex + 1} of {totalSteps}
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
            <h3 className="font-semibold text-lg mb-3">
              {currentStep.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{tutorial.name}</span>
              <span>{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStepIndex + 1) / totalSteps) * 100}%`
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
                {isLastStep ? 'Complete Tour' : 'Next'}
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