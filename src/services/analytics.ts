// ============================================
// ANALYTICS AND TELEMETRY SERVICE
// ============================================

import { Platform } from 'react-native';
import type { AnalyticsEvent, GameState, Setup } from '../types/game';

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  sessionId: string;
  userId?: string;
}

// Session data
interface SessionData {
  startTime: number;
  events: AnalyticsEvent[];
  gameStarted: boolean;
  gamesPlayed: number;
}

// Default configuration
let config: AnalyticsConfig = {
  enabled: true,
  debug: __DEV__,
  sessionId: generateSessionId(),
};

let sessionData: SessionData = {
  startTime: Date.now(),
  events: [],
  gameStarted: false,
  gamesPlayed: 0,
};

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Configure analytics settings
 */
export const configureAnalytics = (newConfig: Partial<AnalyticsConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Set user ID for tracking (optional, for registered users)
 */
export const setUserId = (userId: string): void => {
  config.userId = userId;
};

/**
 * Track a custom event
 */
export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>
): void => {
  if (!config.enabled) return;

  const analyticsEvent: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      sessionId: config.sessionId,
      platform: Platform.OS,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  sessionData.events.push(analyticsEvent);

  if (config.debug) {
    console.log('[Analytics]', event, properties);
  }

  // In production, you would send this to your analytics backend
  // sendToBackend(analyticsEvent);
};

/**
 * Track screen view
 */
export const trackScreen = (screenName: string, properties?: Record<string, unknown>): void => {
  trackEvent('screen_view', {
    screen_name: screenName,
    ...properties,
  });
};

/**
 * Track game start
 */
export const trackGameStart = (setup: Setup): void => {
  sessionData.gameStarted = true;
  sessionData.gamesPlayed++;

  trackEvent('game_start', {
    cuisine: setup.cuisine,
    starting_capital: setup.capital,
    location: setup.location,
    goal: setup.goal,
    difficulty: setup.difficulty,
    games_played_session: sessionData.gamesPlayed,
  });
};

/**
 * Track game end
 */
export const trackGameEnd = (
  game: GameState,
  setup: Setup,
  outcome: 'win' | 'loss' | 'quit'
): void => {
  const totalUnits = (game.locations?.length || 0) + (game.franchises?.length || 0);

  trackEvent('game_end', {
    outcome,
    weeks_played: game.week,
    final_valuation: game.empireValuation,
    total_revenue: game.totalRevenue,
    locations_count: game.locations?.length || 0,
    franchise_count: game.franchises?.length || 0,
    total_units: totalUnits,
    achievements_earned: game.achievements?.length || 0,
    cuisine: setup.cuisine,
    goal: setup.goal,
    difficulty: setup.difficulty,
    session_duration_ms: Date.now() - sessionData.startTime,
  });
};

/**
 * Track weekly progress
 */
export const trackWeekProgress = (game: GameState, week: number): void => {
  // Only track milestones to reduce event volume
  if (week % 13 !== 0) return; // Track quarterly

  trackEvent('week_milestone', {
    week,
    valuation: game.empireValuation,
    cash: game.corporateCash,
    locations: game.locations?.length || 0,
    franchises: game.franchises?.length || 0,
  });
};

/**
 * Track achievement unlocked
 */
export const trackAchievement = (achievementId: string, game: GameState): void => {
  trackEvent('achievement_unlocked', {
    achievement_id: achievementId,
    week: game.week,
    valuation: game.empireValuation,
  });
};

/**
 * Track scenario completion
 */
export const trackScenario = (
  scenarioId: string,
  choice: string,
  outcome: 'success' | 'failure'
): void => {
  trackEvent('scenario_completed', {
    scenario_id: scenarioId,
    choice,
    outcome,
  });
};

/**
 * Track AI mentor interaction
 */
export const trackAIInteraction = (
  promptType: 'quick_action' | 'custom',
  responseTime?: number
): void => {
  trackEvent('ai_interaction', {
    prompt_type: promptType,
    response_time_ms: responseTime,
  });
};

/**
 * Track error
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>
): void => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
};

/**
 * Track feature usage
 */
export const trackFeature = (featureName: string, properties?: Record<string, unknown>): void => {
  trackEvent('feature_used', {
    feature: featureName,
    ...properties,
  });
};

/**
 * Track performance metrics
 */
export const trackPerformance = (
  metric: string,
  value: number,
  unit: 'ms' | 'count' | 'bytes' = 'ms'
): void => {
  trackEvent('performance', {
    metric,
    value,
    unit,
  });
};

/**
 * Get session statistics
 */
export const getSessionStats = (): {
  duration: number;
  eventsCount: number;
  gamesPlayed: number;
} => ({
  duration: Date.now() - sessionData.startTime,
  eventsCount: sessionData.events.length,
  gamesPlayed: sessionData.gamesPlayed,
});

/**
 * Export events for debugging
 */
export const exportEvents = (): AnalyticsEvent[] => [...sessionData.events];

/**
 * Clear session data
 */
export const clearSession = (): void => {
  config.sessionId = generateSessionId();
  sessionData = {
    startTime: Date.now(),
    events: [],
    gameStarted: false,
    gamesPlayed: 0,
  };
};

/**
 * Flush events to backend (placeholder for actual implementation)
 */
export const flushEvents = async (): Promise<void> => {
  if (!config.enabled || sessionData.events.length === 0) return;

  // In production, send events to your analytics endpoint
  // await fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     sessionId: config.sessionId,
  //     userId: config.userId,
  //     events: sessionData.events,
  //   }),
  // });

  if (config.debug) {
    console.log('[Analytics] Flushing', sessionData.events.length, 'events');
  }

  // Clear flushed events
  sessionData.events = [];
};

export default {
  configureAnalytics,
  setUserId,
  trackEvent,
  trackScreen,
  trackGameStart,
  trackGameEnd,
  trackWeekProgress,
  trackAchievement,
  trackScenario,
  trackAIInteraction,
  trackError,
  trackFeature,
  trackPerformance,
  getSessionStats,
  exportEvents,
  clearSession,
  flushEvents,
};
