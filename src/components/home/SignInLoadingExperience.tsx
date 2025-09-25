import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, TrendingUp, Receipt } from 'lucide-react';

interface SignInLoadingExperienceProps {
  onComplete: () => void;
}

export function SignInLoadingExperience({ onComplete }: SignInLoadingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { icon: Heart, text: "Welcome back!", color: "text-red-500" },
    { icon: Receipt, text: "Loading your expenses...", color: "text-blue-500" },
    { icon: TrendingUp, text: "Calculating insights...", color: "text-green-500" },
    { icon: Sparkles, text: "Personalizing your dashboard...", color: "text-purple-500" }
  ];

  useEffect(() => {
    const stepDuration = 800;
    const totalDuration = stepDuration * loadingSteps.length;

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalDuration / 50));
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= loadingSteps.length) {
          clearInterval(stepInterval);
          return prev;
        }
        return nextStep;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md px-6">
        {/* Logo Animation */}
        <div className="relative">
          <div className="bg-white rounded-full p-6 shadow-2xl mx-auto w-24 h-24 flex items-center justify-center animate-pulse">
            <Heart className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-6">
          {loadingSteps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-center space-x-4 transition-all duration-500 ${
                  isActive 
                    ? 'opacity-100 scale-100 transform translate-y-0' 
                    : isCompleted
                      ? 'opacity-60 scale-95'
                      : 'opacity-30 scale-90 transform translate-y-2'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-md' : 'bg-gray-100'}`}>
                  <IconComponent 
                    className={`h-5 w-5 ${
                      isActive ? step.color : 'text-gray-400'
                    } ${isActive ? 'animate-pulse' : ''}`} 
                  />
                </div>
                <span className={`text-lg font-medium ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Setting up your personalized dashboard...
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className="w-2 h-2 bg-primary/20 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}