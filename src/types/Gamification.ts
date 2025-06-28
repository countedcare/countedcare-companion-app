
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'habit' | 'discovery' | 'self-care';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: {
    type: 'expense_count' | 'total_amount' | 'streak_days' | 'categories_used' | 'self_care';
    value: number;
  };
  unlocked?: boolean;
  unlockedAt?: string;
  emoji: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  type: 'logging' | 'review' | 'discovery' | 'self-care';
  criteria: {
    target: number;
    current: number;
  };
  reward: {
    badge?: string;
    message: string;
  };
  active: boolean;
  startDate?: string;
  completedAt?: string;
  emoji: string;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  type: 'log_expenses' | 'scan_receipt' | 'read_tip' | 'review_expenses';
  target: number;
  current: number;
  completed: boolean;
  emoji: string;
  reward: string;
}

export interface UserProgress {
  totalExpenses: number;
  expenseCount: number;
  currentStreak: number;
  longestStreak: number;
  categoriesUsed: string[];
  badgesEarned: string[];
  challengesCompleted: string[];
  level: number;
  experiencePoints: number;
  lastActivity: string;
  weeklyMissions: WeeklyMission[];
  lastMissionReset: string;
  tipsRead: string[];
  lastTipDate: string;
}

export const BADGE_DEFINITIONS: Badge[] = [
  // Milestone Badges - Enhanced
  {
    id: 'first-expense',
    name: 'Getting Started',
    description: 'You logged your first expense! Every journey begins with a single step.',
    icon: 'star',
    category: 'milestone',
    tier: 'bronze',
    criteria: { type: 'expense_count', value: 1 },
    emoji: '⭐'
  },
  {
    id: 'bronze-saver',
    name: 'Bronze Saver',
    description: 'You\'ve logged 10 expenses! You\'re building great financial habits.',
    icon: 'award',
    category: 'milestone',
    tier: 'bronze',
    criteria: { type: 'expense_count', value: 10 },
    emoji: '🥉'
  },
  {
    id: 'silver-tracker',
    name: 'Silver Tracker',
    description: 'Amazing! 25 expenses logged. You\'re becoming a tracking pro!',
    icon: 'trophy',
    category: 'milestone',
    tier: 'silver',
    criteria: { type: 'expense_count', value: 25 },
    emoji: '🥈'
  },
  {
    id: 'gold-master',
    name: 'Gold Master',
    description: 'Incredible! 50 expenses tracked. You\'re a financial wellness champion!',
    icon: 'award',
    category: 'milestone',
    tier: 'gold',
    criteria: { type: 'expense_count', value: 50 },
    emoji: '🥇'
  },
  {
    id: 'thousand-keeper',
    name: 'Thousand Keeper',
    description: 'You\'ve tracked $1,000 in expenses! Your future self will thank you.',
    icon: 'award',
    category: 'milestone',
    tier: 'gold',
    criteria: { type: 'total_amount', value: 1000 },
    emoji: '💎'
  },
  
  // Habit Badges - Enhanced
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'You\'ve logged expenses for 3 days straight! Consistency is building!',
    icon: 'flame',
    category: 'habit',
    tier: 'bronze',
    criteria: { type: 'streak_days', value: 3 },
    emoji: '🔥'
  },
  {
    id: 'steady-tracker',
    name: 'Steady Tracker',
    description: 'You\'ve logged expenses for 7 days straight! Consistency is your superpower.',
    icon: 'calendar-check',
    category: 'habit',
    tier: 'silver',
    criteria: { type: 'streak_days', value: 7 },
    emoji: '📅'
  },
  {
    id: 'habit-hero',
    name: 'Habit Hero',
    description: 'A 30-day streak! You\'ve made financial tracking a beautiful habit.',
    icon: 'heart',
    category: 'habit',
    tier: 'gold',
    criteria: { type: 'streak_days', value: 30 },
    emoji: '💪'
  },
  
  // Discovery Badges
  {
    id: 'category-explorer',
    name: 'Category Explorer',
    description: 'You\'ve used all expense categories! You see the full picture of caregiving costs.',
    icon: 'badge-check',
    category: 'discovery',
    tier: 'platinum',
    criteria: { type: 'categories_used', value: 6 },
    emoji: '🗺️'
  },
  
  // Self-Care Badges
  {
    id: 'self-care-champion',
    name: 'Self-Care Champion',
    description: 'You\'re taking care of yourself too! Remember: you can\'t pour from an empty cup.',
    icon: 'heart',
    category: 'self-care',
    tier: 'gold',
    criteria: { type: 'self_care', value: 1 },
    emoji: '🌸'
  }
];

export const WEEKLY_MISSION_TEMPLATES: Omit<WeeklyMission, 'id' | 'current' | 'completed'>[] = [
  {
    title: 'Log Your Expenses',
    description: 'Track 3 expenses this week',
    type: 'log_expenses',
    target: 3,
    emoji: '📝',
    reward: 'Great job staying on top of your expenses!'
  },
  {
    title: 'Receipt Scanner',
    description: 'Scan 1 receipt to capture details',
    type: 'scan_receipt',
    target: 1,
    emoji: '📄',
    reward: 'You\'re making record-keeping so much easier!'
  },
  {
    title: 'Learn Something New',
    description: 'Read 2 financial wellness tips',
    type: 'read_tip',
    target: 2,
    emoji: '💡',
    reward: 'Knowledge is power - you\'re getting stronger!'
  }
];

export const DAILY_TIPS = [
  "Did you know home modifications for accessibility may be deductible?",
  "Keep receipts for all medical equipment - they're often tax deductible!",
  "Transportation costs to medical appointments can be deducted at 21¢ per mile.",
  "Personal care services may qualify as medical expenses.",
  "Installing grab bars or ramps for safety can be tax deductible.",
  "Specialized dietary foods prescribed by doctors may be deductible.",
  "Medical alert systems and monitoring devices often qualify for deductions.",
  "Remember to track parking fees for medical visits - they add up!",
  "Home healthcare services are typically fully deductible.",
  "Vision and hearing aids are usually tax-deductible medical expenses.",
  "Physical therapy and occupational therapy costs are deductible.",
  "Medical conferences related to a chronic condition may be deductible.",
  "Adaptive equipment for daily living can often be tax deductible.",
  "Long-term care insurance premiums may be partially deductible.",
  "Medical travel expenses include lodging costs up to $50/night per person."
];

export const CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'active' | 'startDate' | 'completedAt'>[] = [
  {
    title: '3-Day Logging Sprint',
    description: 'Log at least one expense for 3 days in a row. Small steps, big impact!',
    duration: 3,
    type: 'logging',
    criteria: { target: 3, current: 0 },
    reward: {
      message: 'Amazing! You\'re building a powerful habit that will serve you well. 🌟'
    },
    emoji: '🚀'
  },
  {
    title: 'Review & Refresh',
    description: 'Take a moment to review last month\'s expenses and celebrate your progress.',
    duration: 7,
    type: 'review',
    criteria: { target: 1, current: 0 },
    reward: {
      message: 'You\'re so thoughtful about your family\'s finances. That\'s true love in action! 💙'
    },
    emoji: '📊'
  },
  {
    title: 'Category Detective',
    description: 'Try logging expenses in 3 different categories this week.',
    duration: 7,
    type: 'discovery',
    criteria: { target: 3, current: 0 },
    reward: {
      message: 'You\'re getting the full picture! Knowledge is power, and you\'re owning yours. 🔍'
    },
    emoji: '🕵️‍♀️'
  }
];
