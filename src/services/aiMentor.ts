// ============================================
// AI MENTOR SERVICE WITH RETRY LOGIC
// ============================================

import { GameState, SetupState } from '../types/game';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIRequestPayload {
  message: string;
  gameContext: GameContext;
  conversationHistory: ConversationMessage[];
}

interface GameContext {
  summary: {
    week: number;
    totalCash: number;
    totalDebt: number;
    weeklyPayroll: number;
    weeklyRent: number;
    profitStreak: number;
    burnout: number;
    corporateCash: number;
    empireValuation: number;
  };
  locations: Array<{
    name: string;
    reputation: number;
    morale: number;
    cash: number;
    weeksOpen: number;
    staffCount: number;
    staffWages: number;
    equipment: number;
    upgrades: number;
    lastWeekRevenue: number;
    lastWeekProfit: number;
    loans: Array<{ amount: number; remaining: number; weeklyPayment: number }>;
  }>;
  franchises: {
    franchiseCount: number;
    weeklyRoyalties: number;
  };
  setup: {
    cuisine: string | null;
    goal: string;
    difficulty: string;
  };
}

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  return BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
};

// Sleep utility
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Build game context for AI
export const buildGameContext = (game: GameState, setup: SetupState): GameContext => {
  const totalCash = game.locations?.reduce((sum, loc) => sum + (loc.cash || 0), 0) || 0;
  const totalDebt = game.locations?.reduce(
    (sum, loc) => sum + (loc.loans?.reduce((s, l) => s + l.remaining, 0) || 0),
    0
  ) || 0;
  const weeklyPayroll = game.locations?.reduce(
    (sum, loc) => sum + (loc.staff?.reduce((s, st) => s + st.wage, 0) || 0),
    0
  ) || 0;
  const weeklyRent = game.locations?.reduce((sum, loc) => sum + (loc.rent || 0), 0) || 0;

  return {
    summary: {
      week: game.week || 0,
      totalCash,
      totalDebt,
      weeklyPayroll,
      weeklyRent,
      profitStreak: game.profitStreak || 0,
      burnout: game.burnout || 0,
      corporateCash: game.corporateCash || 0,
      empireValuation: game.empireValuation || 0,
    },
    locations: game.locations?.map(loc => ({
      name: loc.name,
      reputation: loc.reputation,
      morale: loc.morale,
      cash: loc.cash,
      weeksOpen: loc.weeksOpen,
      staffCount: loc.staff?.length || 0,
      staffWages: loc.staff?.reduce((s, st) => s + st.wage, 0) || 0,
      equipment: loc.equipment?.length || 0,
      upgrades: loc.upgrades?.length || 0,
      lastWeekRevenue: loc.lastWeekRevenue || 0,
      lastWeekProfit: loc.lastWeekProfit || 0,
      loans: loc.loans?.map(l => ({
        amount: l.amount,
        remaining: l.remaining,
        weeklyPayment: l.weeklyPayment,
      })) || [],
    })) || [],
    franchises: {
      franchiseCount: game.franchises?.length || 0,
      weeklyRoyalties: game.franchises?.reduce((s, f) => s + f.weeklyRoyalty, 0) || 0,
    },
    setup: {
      cuisine: setup.cuisine,
      goal: setup.goal,
      difficulty: setup.difficulty,
    },
  };
};

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES = [
  "Keep an eye on your cash flow - it's the lifeblood of any restaurant.",
  "Focus on consistency. Great restaurants are built on reliable experiences.",
  "Your staff is your greatest asset. Invest in their training and morale.",
  "Watch your food costs closely - small percentage changes have big impacts.",
  "Don't expand too fast. Perfect your systems before scaling.",
  "Customer experience is everything. Happy guests become regular guests.",
  "Labor costs should stay under 30% of revenue if possible.",
  "Build relationships with your vendors - they can save you in tough times.",
  "Marketing brings them in, but quality brings them back.",
  "Every decision has a trade-off. Think through the consequences.",
];

// Get random fallback response
const getFallbackResponse = (): string => {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

// Main AI request function with retry logic
export const getAIMentorResponse = async (
  message: string,
  game: GameState,
  setup: SetupState,
  conversationHistory: ConversationMessage[],
  setConversationHistory: (updater: (prev: ConversationMessage[]) => ConversationMessage[]) => void
): Promise<string> => {
  // Build context
  const gameContext = buildGameContext(game, setup);

  // Prepare payload
  const payload: AIRequestPayload = {
    message,
    gameContext,
    conversationHistory: conversationHistory.slice(-20), // Last 20 messages
  };

  // Retry loop
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If server error, try again
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          console.warn(`AI API returned ${response.status}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(getRetryDelay(attempt));
          continue;
        }
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || data.message || getFallbackResponse();

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse },
      ].slice(-20));

      return aiResponse;
    } catch (error) {
      const isNetworkError = error instanceof TypeError ||
        (error instanceof Error && error.name === 'AbortError');

      if (isNetworkError && attempt < MAX_RETRIES) {
        console.warn(`Network error, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`, error);
        await sleep(getRetryDelay(attempt));
        continue;
      }

      // Final failure - return fallback
      console.error('AI API failed after retries:', error);
      return getFallbackResponse();
    }
  }

  // Should not reach here, but return fallback just in case
  return getFallbackResponse();
};

// Quick action prompts based on current screen/context
export const getQuickActionPrompts = (screen: string, game: GameState): string[] => {
  const prompts: Record<string, string[]> = {
    overview: [
      'How am I doing overall?',
      'What should I focus on this week?',
      'Any red flags I should know about?',
    ],
    staff: [
      'Do I need to hire more staff?',
      'How can I improve morale?',
      'Should I give anyone a raise?',
    ],
    menu: [
      'How is my menu performing?',
      'Should I add or remove items?',
      'How can I reduce food costs?',
    ],
    finances: [
      'Should I take out a loan?',
      'How can I improve profitability?',
      'Is my cash position healthy?',
    ],
    marketing: [
      'What marketing should I invest in?',
      'How do I get more customers?',
      'Is social media worth it?',
    ],
    expansion: [
      'Am I ready to expand?',
      'What should I look for in a second location?',
      'Should I consider franchising?',
    ],
  };

  // Add context-specific prompts
  const contextPrompts: string[] = [];

  if (game.locations?.[0]?.cash < 5000) {
    contextPrompts.push("I'm running low on cash - what should I do?");
  }

  if (game.locations?.[0]?.morale < 50) {
    contextPrompts.push('Staff morale is low - how can I fix this?');
  }

  if (game.profitStreak >= 5) {
    contextPrompts.push('We have a profit streak going - how do I keep it up?');
  }

  return [...(prompts[screen] || prompts.overview), ...contextPrompts];
};

// Cache for similar responses (simple in-memory cache)
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Get cached response if available and fresh
export const getCachedResponse = (cacheKey: string): string | null => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.response;
  }
  return null;
};

// Set cached response
export const setCachedResponse = (cacheKey: string, response: string): void => {
  responseCache.set(cacheKey, { response, timestamp: Date.now() });

  // Clean old entries if cache gets too large
  if (responseCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
      if (now - value.timestamp > CACHE_TTL_MS) {
        responseCache.delete(key);
      }
    }
  }
};

// Generate cache key from context
export const generateCacheKey = (message: string, week: number, screen: string): string => {
  // Normalize message and create key
  const normalizedMessage = message.toLowerCase().trim();
  return `${normalizedMessage}_w${Math.floor(week / 4)}_${screen}`;
};
