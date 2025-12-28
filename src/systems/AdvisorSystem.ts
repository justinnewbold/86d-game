// ============================================
// ADVISOR SYSTEM - "WHAT REAL OWNERS WOULD SAY"
// ============================================
// Contextual advice from industry veterans
// Educational: Makes lessons memorable through expert voices

import type { Location, GameState } from '../types/game';

/**
 * An advisor persona with their expertise and communication style
 */
export interface Advisor {
  id: string;
  name: string;
  title: string;
  background: string;
  expertise: string[];
  personality: 'tough_love' | 'encouraging' | 'analytical' | 'practical';
  avatar: string; // emoji
}

/**
 * A piece of advice triggered by game conditions
 */
export interface AdvisorAdvice {
  id: string;
  advisorId: string;
  trigger: AdviceTrigger;
  quote: string;
  explanation: string;
  actionItem: string;
  priority: 'critical' | 'warning' | 'tip' | 'encouragement';
}

/**
 * Conditions that trigger advice
 */
export interface AdviceTrigger {
  condition: string;
  check: (location: Location, game: GameState) => boolean;
}

// Advisor personas
export const ADVISORS: Advisor[] = [
  {
    id: 'chef-maria',
    name: 'Chef Maria Santos',
    title: 'Executive Chef, 25 years',
    background: 'Ran 3 successful restaurants, known for kitchen efficiency',
    expertise: ['food_cost', 'kitchen_operations', 'menu_engineering'],
    personality: 'tough_love',
    avatar: '👩‍🍳',
  },
  {
    id: 'owner-james',
    name: 'James Chen',
    title: 'Multi-unit Owner',
    background: 'Built a 12-location regional chain from scratch',
    expertise: ['cash_flow', 'growth', 'financing'],
    personality: 'analytical',
    avatar: '👨‍💼',
  },
  {
    id: 'gm-patricia',
    name: 'Patricia Williams',
    title: 'General Manager, 20 years',
    background: 'Managed everything from diners to fine dining',
    expertise: ['labor', 'service', 'staff_management'],
    personality: 'encouraging',
    avatar: '👩‍💼',
  },
  {
    id: 'consultant-dave',
    name: 'Dave Morrison',
    title: 'Restaurant Consultant',
    background: 'Turned around 50+ failing restaurants',
    expertise: ['turnarounds', 'cost_control', 'operations'],
    personality: 'practical',
    avatar: '🧔',
  },
  {
    id: 'investor-sarah',
    name: 'Sarah Park',
    title: 'Restaurant Investor',
    background: 'Invested in 30+ restaurant concepts',
    expertise: ['finance', 'valuation', 'scaling'],
    personality: 'analytical',
    avatar: '👩‍💻',
  },
];

// Contextual advice database
export const ADVICE_DATABASE: AdvisorAdvice[] = [
  // Prime Cost Advice
  {
    id: 'prime-cost-critical',
    advisorId: 'chef-maria',
    trigger: {
      condition: 'primeCost > 70%',
      check: (loc) => (loc.lastWeekPL?.primeCostPercentage || 0) > 0.70,
    },
    quote: "Your prime cost is over 70%? You're not running a restaurant, you're running a charity. Every dollar coming in, 70 cents goes right back out before rent, before utilities, before anything else.",
    explanation: 'Prime cost (food + labor) over 70% leaves almost nothing for other expenses and profit.',
    actionItem: 'Immediately review portion sizes and cut unnecessary labor hours.',
    priority: 'critical',
  },
  {
    id: 'prime-cost-warning',
    advisorId: 'consultant-dave',
    trigger: {
      condition: 'primeCost > 65%',
      check: (loc) => {
        const pc = loc.lastWeekPL?.primeCostPercentage || 0;
        return pc > 0.65 && pc <= 0.70;
      },
    },
    quote: "65% prime cost? You're in the warning zone. I've seen a hundred restaurants ignore this number and close within a year. The math doesn't lie.",
    explanation: 'Prime cost between 65-70% means very thin margins that can\'t survive a slow month.',
    actionItem: 'Audit your top 10 selling items for cost creep and review your labor schedule.',
    priority: 'warning',
  },
  {
    id: 'prime-cost-excellent',
    advisorId: 'chef-maria',
    trigger: {
      condition: 'primeCost < 58%',
      check: (loc) => (loc.lastWeekPL?.primeCostPercentage || 1) < 0.58,
    },
    quote: "Under 58% prime cost? Now you're cooking. That's the kind of discipline that builds empires. Keep it there.",
    explanation: 'Prime cost under 58% gives you room for mistakes and investments.',
    actionItem: 'Document what you\'re doing right so you can replicate it.',
    priority: 'encouragement',
  },

  // Cash Flow Advice
  {
    id: 'cash-critical',
    advisorId: 'owner-james',
    trigger: {
      condition: 'cash < 2 weeks expenses',
      check: (loc) => {
        const weeklyExpenses = (loc.rent || 0) + (loc.staff?.reduce((s, st) => s + st.wage * 40, 0) || 0);
        return loc.cash < weeklyExpenses * 2;
      },
    },
    quote: "Two weeks of cash? I've been there. It's not a business anymore, it's a daily prayer. Every morning you're hoping today's receipts cover tomorrow's bills.",
    explanation: 'Less than 2 weeks of cash means one bad week could mean missed payroll.',
    actionItem: 'Cut all non-essential spending immediately. Consider a credit line if you can get one.',
    priority: 'critical',
  },
  {
    id: 'cash-warning',
    advisorId: 'investor-sarah',
    trigger: {
      condition: 'cash < 4 weeks expenses',
      check: (loc) => {
        const weeklyExpenses = (loc.rent || 0) + (loc.staff?.reduce((s, st) => s + st.wage * 40, 0) || 0);
        const cash = loc.cash;
        return cash >= weeklyExpenses * 2 && cash < weeklyExpenses * 4;
      },
    },
    quote: "A month of reserves? That's the minimum, not the goal. I don't invest in restaurants with less than 6 months runway. Know why? Because something always goes wrong.",
    explanation: '4 weeks of cash is still fragile - equipment breaks, slow seasons happen.',
    actionItem: 'Build reserves before reinvesting. The next emergency is always closer than you think.',
    priority: 'warning',
  },
  {
    id: 'cash-healthy',
    advisorId: 'owner-james',
    trigger: {
      condition: 'cash > 12 weeks expenses',
      check: (loc) => {
        const weeklyExpenses = (loc.rent || 0) + (loc.staff?.reduce((s, st) => s + st.wage * 40, 0) || 0);
        return loc.cash > weeklyExpenses * 12;
      },
    },
    quote: "Three months of reserves? Now you can think strategically instead of just surviving. This is when the real decisions become possible.",
    explanation: 'Strong reserves let you negotiate from strength and take calculated risks.',
    actionItem: 'Consider whether this cash should work harder - maybe marketing or expansion.',
    priority: 'tip',
  },

  // Labor Advice
  {
    id: 'labor-high',
    advisorId: 'gm-patricia',
    trigger: {
      condition: 'labor > 35%',
      check: (loc) => (loc.lastWeekPL?.labor?.percentage || 0) > 0.35,
    },
    quote: "35% labor? Honey, you're overstaffed or underpaying. Either you've got servers standing around, or you're paying so little they can't be productive. Both cost you money.",
    explanation: 'Labor over 35% usually means inefficient scheduling or undertraining.',
    actionItem: 'Review your schedule hour by hour. Match staffing to covers, not to habit.',
    priority: 'warning',
  },
  {
    id: 'morale-critical',
    advisorId: 'gm-patricia',
    trigger: {
      condition: 'morale < 40',
      check: (loc) => (loc.morale || 50) < 40,
    },
    quote: "Morale under 40? Your best people are updating their resumes right now. I guarantee it. The ones who stay are the ones who can't leave.",
    explanation: 'Low morale leads to poor service, high turnover, and a death spiral.',
    actionItem: 'Talk to your team. Find out what\'s wrong. Sometimes it\'s just being heard.',
    priority: 'critical',
  },

  // Reputation Advice
  {
    id: 'reputation-dropping',
    advisorId: 'consultant-dave',
    trigger: {
      condition: 'reputation < 40',
      check: (loc) => (loc.reputation || 50) < 40,
    },
    quote: "Reputation under 40? You're not getting second chances from customers. Every meal now has to be perfect just to break even on word-of-mouth. That's an uphill battle.",
    explanation: 'Low reputation means customers aren\'t coming back and aren\'t referring others.',
    actionItem: 'Focus obsessively on quality for the next month. Nothing else matters.',
    priority: 'critical',
  },
  {
    id: 'reputation-high',
    advisorId: 'investor-sarah',
    trigger: {
      condition: 'reputation > 80',
      check: (loc) => (loc.reputation || 50) > 80,
    },
    quote: "80+ reputation is rare. You've built something special. This is when word-of-mouth starts working for you instead of against you. Protect it.",
    explanation: 'High reputation is a competitive moat that\'s hard for others to copy.',
    actionItem: 'Consider raising prices slightly. Your customers value you more than you think.',
    priority: 'tip',
  },

  // Growth Advice
  {
    id: 'ready-to-grow',
    advisorId: 'owner-james',
    trigger: {
      condition: 'profitable for 12+ weeks with reserves',
      check: (loc, game) => {
        const weeklyExpenses = (loc.rent || 0) + 5000;
        const hasReserves = loc.cash > weeklyExpenses * 12;
        const isProfitable = loc.totalProfit > 0;
        const hasExperience = game.week > 20;
        return hasReserves && isProfitable && hasExperience;
      },
    },
    quote: "Strong cash, consistent profit, 20+ weeks under your belt? You might be ready for location two. But remember - the second one is harder than the first. You can't be everywhere at once.",
    explanation: 'Expansion should only happen from a position of strength.',
    actionItem: 'If you expand, make sure location one can run without you.',
    priority: 'tip',
  },

  // Menu Advice
  {
    id: 'menu-too-big',
    advisorId: 'chef-maria',
    trigger: {
      condition: 'menu > 30 items',
      check: (loc) => (loc.menu?.length || 0) > 30,
    },
    quote: "30 items on the menu? The Cheesecake Factory you are not. Every item is inventory to manage, training to maintain, and a chance to screw up. Cut it in half and watch your kitchen run smoother.",
    explanation: 'Large menus increase waste, training time, and inconsistency.',
    actionItem: 'Identify your bottom 10 sellers and cut them. Your cooks will thank you.',
    priority: 'tip',
  },

  // General Encouragement
  {
    id: 'first-profitable-week',
    advisorId: 'gm-patricia',
    trigger: {
      condition: 'first profit',
      check: (loc, game) => {
        const history = loc.weeklyHistory || [];
        const firstProfit = history.findIndex(w => w.profit > 0);
        return firstProfit === history.length - 1 && firstProfit >= 0;
      },
    },
    quote: "Your first profitable week! I remember mine. Doesn't matter if it's $50 or $5,000 - you just proved the model works. Now do it again.",
    explanation: 'The first profitable week proves viability. Consistency comes next.',
    actionItem: 'Document what was different this week. Replicate it.',
    priority: 'encouragement',
  },
  {
    id: 'survived-crisis',
    advisorId: 'owner-james',
    trigger: {
      condition: 'recovered from cash crunch',
      check: (loc) => {
        const history = loc.cashFlow?.cashFlowHistory || [];
        if (history.length < 4) return false;
        const recent = history.slice(-4);
        const hadCrisis = recent.some(w => w.endingCash < 5000);
        const recovered = (recent[recent.length - 1]?.endingCash || 0) > 15000;
        return hadCrisis && recovered;
      },
    },
    quote: "You survived a cash crunch. Most don't. That experience is worth more than any MBA. You now know what matters when everything else falls away.",
    explanation: 'Surviving a crisis teaches lessons that success never can.',
    actionItem: 'Build bigger reserves this time. You know what almost-failure feels like.',
    priority: 'encouragement',
  },
];

/**
 * Get relevant advice for current game state
 */
export function getActiveAdvice(
  location: Location,
  game: GameState,
  maxAdvice: number = 3
): AdvisorAdvice[] {
  const triggeredAdvice = ADVICE_DATABASE.filter(advice =>
    advice.trigger.check(location, game)
  );

  // Sort by priority
  const priorityOrder: Record<string, number> = { 'critical': 0, 'warning': 1, 'tip': 2, 'encouragement': 3 };
  triggeredAdvice.sort((a, b) => (priorityOrder[a.priority] ?? 999) - (priorityOrder[b.priority] ?? 999));

  return triggeredAdvice.slice(0, maxAdvice);
}

/**
 * Get advisor by ID
 */
export function getAdvisor(advisorId: string): Advisor | undefined {
  return ADVISORS.find(a => a.id === advisorId);
}

/**
 * Format advice for display
 */
export function formatAdvice(advice: AdvisorAdvice): {
  advisor: Advisor;
  formattedQuote: string;
  badge: string;
  badgeColor: string;
} | null {
  const advisor = getAdvisor(advice.advisorId);
  if (!advisor) return null;

  const badges = {
    'critical': '🚨 CRITICAL',
    'warning': '⚠️ WARNING',
    'tip': '💡 TIP',
    'encouragement': '🌟 NICE WORK',
  };

  const colors = {
    'critical': '#dc3545',
    'warning': '#ffc107',
    'tip': '#17a2b8',
    'encouragement': '#28a745',
  };

  return {
    advisor,
    formattedQuote: `"${advice.quote}"`,
    badge: badges[advice.priority],
    badgeColor: colors[advice.priority],
  };
}

/**
 * Get random wisdom for loading screens or idle moments
 */
export function getRandomWisdom(): { advisor: Advisor; quote: string } {
  const wisdomQuotes = [
    { advisorId: 'chef-maria', quote: "The difference between a good restaurant and a great one? Consistency. Every plate, every time." },
    { advisorId: 'owner-james', quote: "Cash is oxygen. Profit is nice, but cash is what keeps the lights on tonight." },
    { advisorId: 'gm-patricia', quote: "Take care of your staff and they'll take care of your customers. It's that simple." },
    { advisorId: 'consultant-dave', quote: "I've never seen a restaurant fail because the food was too good. I've seen hundreds fail because the numbers were wrong." },
    { advisorId: 'investor-sarah', quote: "The best time to raise money is when you don't need it. The worst time is when you do." },
    { advisorId: 'chef-maria', quote: "Every menu item should earn its place. If it's not selling or it's not profitable, it's taking up space." },
    { advisorId: 'owner-james', quote: "Location, concept, execution. You need all three. Two out of three will get you a failed restaurant." },
    { advisorId: 'gm-patricia', quote: "The customer who complains is giving you a gift. The one who leaves silently will never come back." },
    { advisorId: 'consultant-dave', quote: "Look at your P&L every week. The restaurants that check monthly find out too late." },
    { advisorId: 'investor-sarah', quote: "The restaurant business is simple. Buy low, sell high, control labor. Everything else is details." },
  ];

  const selected = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
  return {
    advisor: getAdvisor(selected.advisorId)!,
    quote: selected.quote,
  };
}

export default {
  ADVISORS,
  ADVICE_DATABASE,
  getActiveAdvice,
  getAdvisor,
  formatAdvice,
  getRandomWisdom,
};
