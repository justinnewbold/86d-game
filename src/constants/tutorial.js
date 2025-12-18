// ============================================
// TUTORIAL SYSTEM
// ============================================

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to 86\'d!',
    message: 'Ready to build your restaurant empire? I\'m Chef Marcus, your mentor. I\'ve seen it all in 30 years - successes, failures, and everything in between. Let me show you around.',
    highlight: null,
    action: 'continue',
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    message: 'This is your dashboard. Every number tells a story. Green is good, red means trouble. Watch your cash like a hawk - it\'s the lifeblood of your business.',
    highlight: 'quickStats',
    action: 'continue',
  },
  {
    id: 'week',
    title: 'The Weekly Grind',
    message: 'Time moves in weeks. Each week you\'ll face decisions, collect revenue, and pay bills. Hit "NEXT WEEK" when you\'re ready to advance.',
    highlight: 'nextWeekButton',
    action: 'nextWeek',
  },
  {
    id: 'staff',
    title: 'Your Team',
    message: 'Staff is your biggest expense AND your biggest asset. Underpay and they leave. Overpay and you go broke. Find the balance. Happy staff = happy customers.',
    highlight: 'staffTab',
    action: 'goToStaff',
  },
  {
    id: 'scenarios',
    title: 'Crisis & Opportunity',
    message: 'Random events will test you. No-shows, equipment failures, great reviews - they all happen. Your choices have real consequences. There are no undo buttons in this business.',
    highlight: null,
    action: 'continue',
  },
  {
    id: 'mentor',
    title: 'I\'m Here to Help',
    message: 'Tap on my bar anytime to ask questions. I\'ll give you my honest take - not what you want to hear, but what you need to hear. Good luck, chef.',
    highlight: 'aiBar',
    action: 'complete',
  },
];

export const GAMEPLAY_TIPS = [
  { id: 1, tip: "💡 Keep 4-6 weeks of expenses in cash reserves for emergencies." },
  { id: 2, tip: "💡 A line cook at $18/hr costs you ~$27/hr after all expenses." },
  { id: 3, tip: "💡 Social media marketing has the best ROI for new restaurants." },
  { id: 4, tip: "💡 Prime cost (food + labor) should stay under 65% of revenue." },
  { id: 5, tip: "💡 Train staff to reduce turnover - it's cheaper than hiring new." },
  { id: 6, tip: "💡 Delivery apps take 15-30% - factor that into your pricing." },
  { id: 7, tip: "💡 Don't expand until your first location is consistently profitable." },
  { id: 8, tip: "💡 Negotiate with vendors quarterly - prices change." },
  { id: 9, tip: "💡 A great manager can run a location for you - invest in them." },
  { id: 10, tip: "💡 Ghost kitchens have low overhead but zero walk-in traffic." },
  { id: 11, tip: "💡 The restaurant that survives isn't the best - it's the most adaptable." },
  { id: 12, tip: "💡 Equipment failures always happen at the worst time. Maintain proactively." },
];
