export const RC_API_KEY = 'test_zokdfXzIqRVGlIMuXrPBlLBirAY';

// LemonSqueezy — no EIN/SSN required, handles taxes for you
// Set these in .env or Vercel env vars
export const LEMON_SQUEEZY_API_KEY = import.meta.env.VITE_LEMON_SQUEEZY_API_KEY || '';
export const LEMON_SQUEEZY_STORE_ID = import.meta.env.VITE_LEMON_SQUEEZY_STORE_ID || '';

// LemonSqueezy checkout URLs — create products at https://app.lemonsqueezy.com
export const LEMON_SQUEEZY_CHECKOUT = {
  monthly: import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_URL || '',
  yearly: import.meta.env.VITE_LEMON_SQUEEZY_YEARLY_URL || '',
};

// RevenueCat offering IDs — create these in RevenueCat dashboard
export const OFFERING_ID = 'default';

export const PRODUCTS = {
  monthly: {
    id: 'milestonemindset_pro_monthly',
    label: 'Monthly',
    price: '$4.99',
    period: '/month',
    savings: null,
    lemonsqueezyUrl: LEMON_SQUEEZY_CHECKOUT.monthly,
  },
  yearly: {
    id: 'milestonemindset_pro_yearly',
    label: 'Yearly',
    price: '$39.99',
    period: '/year',
    savings: 'Save 33%',
    lemonsqueezyUrl: LEMON_SQUEEZY_CHECKOUT.yearly,
  },
};

export const FREE_LIMITS = {
  maxGoals: 1,
  maxMilestonesPerGoal: 6,
  maxTasksPerMilestone: 10,
  maxHistoryDays: 7,
};

export const PRO_FEATURES = [
  { id: 'unlimited_goals', label: 'Unlimited Goals', icon: '🎯' },
  { id: 'unlimited_milestones', label: 'Unlimited Milestones', icon: '📌' },
  { id: 'unlimited_tasks', label: 'Unlimited Tasks', icon: '✅' },
  { id: 'advanced_analytics', label: 'Advanced Analytics', icon: '📊' },
  { id: 'ai_goal_builder', label: 'AI Goal Builder', icon: '🤖' },
  { id: 'all_templates', label: 'All Templates', icon: '📋' },
  { id: 'pdf_export', label: 'PDF Export', icon: '📄' },
  { id: 'full_history', label: 'Full History', icon: '📅' },
  { id: 'weekly_review', label: 'Weekly Review', icon: '📝' },
  { id: 'custom_themes', label: 'Custom Themes', icon: '🎨' },
];
