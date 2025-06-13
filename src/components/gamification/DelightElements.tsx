
import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

interface ConfettiProps {
  show: boolean;
  onComplete: () => void;
}

export const Confetti = ({ show, onComplete }: ConfettiProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {i % 3 === 0 ? (
            <Heart className="h-4 w-4 text-red-400" />
          ) : i % 3 === 1 ? (
            <Sparkles className="h-4 w-4 text-yellow-400" />
          ) : (
            <Star className="h-4 w-4 text-blue-400" />
          )}
        </div>
      ))}
    </div>
  );
};

interface SurpriseQuoteProps {
  quotes: string[];
  interval?: number; // minutes
}

export const SurpriseQuote = ({ quotes, interval = 30 }: SurpriseQuoteProps) => {
  const [currentQuote, setCurrentQuote] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showQuote = () => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(randomQuote);
      setShow(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShow(false), 5000);
    };

    const timer = setInterval(showQuote, interval * 60 * 1000);
    return () => clearInterval(timer);
  }, [quotes, interval]);

  if (!show || !currentQuote) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg z-40 animate-slide-in-right">
      <div className="flex items-start gap-2">
        <Sparkles className="h-5 w-5 mt-0.5 text-yellow-300" />
        <div>
          <p className="text-sm font-medium mb-1">💙 Gentle Reminder</p>
          <p className="text-sm">{currentQuote}</p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="ml-auto text-white/70 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const SURPRISE_QUOTES = [
  "You're doing something beautiful by taking care of both your loved one and your family's future. 💙",
  "Every expense you track is an investment in peace of mind. You're amazing! ✨",
  "Remember to take care of yourself too. You can't pour from an empty cup. 🌸",
  "Small consistent actions create big changes. You're building something wonderful! 🌱",
  "Your love shows up in every detail you track. That's powerful! 💪",
  "Take a deep breath. You're doing better than you think. 🌈",
  "Progress, not perfection. You're exactly where you need to be. 🦋"
];
