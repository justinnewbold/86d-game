// ============================================
// EDUCATIONAL RESTAURANT SIMULATION SYSTEMS
// ============================================
// Central registry for all game systems
// These systems transform the game into an educational tool for aspiring restaurant owners

// ============================================
// CORE FINANCIAL SYSTEMS
// ============================================

/**
 * Cash Flow Engine
 * The #1 reason restaurants fail: profitable but out of cash
 * Use for: Weekly cash processing, bill payment, runway calculation
 */
export {
  type Bill,
  type Receivable,
  type CashFlowState,
  type WeeklyCashFlow,
  type CashFlowAlert,
  BILL_SCHEDULES,
  REVENUE_TIMING,
  calculateRunway,
  generateUpcomingBills,
  processWeeklyCashFlow,
  explainCashFlowGap,
} from './CashFlowEngine';

/**
 * Realistic Financial Model
 * Industry-accurate P&L with 5-12% margins (not 20%+)
 * Use for: Weekly P&L calculation, benchmark comparison, break-even analysis
 */
export {
  type RestaurantPL,
  type PLIssue,
  type PLAnalysis,
  INDUSTRY_BENCHMARKS,
  calculateWeeklyPL,
  analyzePL,
  calculateBreakEven,
} from './RealisticFinancials';

// ============================================
// MARKET & COMPETITION SYSTEMS
// ============================================

/**
 * Real Market Data Integration
 * Location-based wages, costs, and demographics
 * Use for: Setup phase market selection, cost calculations
 */
export {
  type MarketData,
  getMinimumWage,
  calculateRestaurantWages,
  getMarketData,
  getCommodityPrices,
  calculateMenuItemImpact,
} from './RealMarketData';

/**
 * Competitive Analysis
 * Market events, competitor tracking, SWOT analysis
 * Use for: Weekly market event generation, competitive positioning
 */
export {
  type Competitor,
  type MarketEvent,
  type MarketAnalysis,
  generateCompetitors,
  generateMarketEvent,
  analyzeMarket,
  applyMarketEventEffects,
  processMarketWeek,
  MARKET_LESSONS,
} from './CompetitiveAnalysis';

/**
 * Supplier Relationship System
 * Vendor management, payment terms, commodity pricing
 * Use for: Purchasing decisions, cash flow optimization via payment terms
 */
export {
  type Supplier,
  type SupplierOrder,
  type Commodity,
  DEFAULT_SUPPLIERS,
  COMMODITIES,
  calculateEffectivePrice,
  updateCommodityPrices,
  updateSupplierRelationship,
  evaluateSuppliers,
  SUPPLIER_LESSONS,
} from './SupplierRelationship';

// ============================================
// MENU & OPERATIONS SYSTEMS
// ============================================

/**
 * Menu Engineering
 * Stars, Puzzles, Plow Horses, Dogs classification
 * Use for: Menu optimization, pricing strategy, item profitability
 */
export {
  type MenuItem,
  type RecipeIngredient,
  type MenuItemCategory,
  type MenuAnalysis,
  type MenuRecommendation,
  classifyMenuItem,
  analyzeMenu,
  calculateRecipeCost,
  suggestPrice,
  MENU_ENGINEERING_LESSONS,
} from './MenuEngineering';

/**
 * Labor Scheduling System
 * Shift planning, coverage analysis, labor % optimization
 * Use for: Staff scheduling, labor cost control, shift optimization
 */
export {
  type Shift,
  type StaffingRequirement,
  type WeeklySchedule,
  calculateExpectedCovers,
  calculateRequiredStaff,
  generateStaffingRequirements,
  calculateScheduleSummary,
  generateOptimizedSchedule,
  analyzeScheduleEfficiency,
  SCHEDULING_LESSONS,
} from './LaborScheduling';

// ============================================
// STAFF SYSTEMS
// ============================================

/**
 * Staff Development System
 * Certifications, career paths, turnover cost calculation
 * Use for: Staff training, promotion decisions, retention analysis
 */
export {
  type Certification,
  type CareerPath,
  type DevelopedStaff,
  CERTIFICATIONS,
  CAREER_PATHS,
  calculateTurnoverRisk,
  calculateTurnoverCost,
  getAvailablePromotions,
  getAvailableCertifications,
  startTraining,
  processTrainingWeek,
  promoteStaff,
  STAFF_DEVELOPMENT_LESSONS,
} from './StaffDevelopment';

// ============================================
// SCENARIO & CRISIS SYSTEMS
// ============================================

/**
 * Failure Scenarios
 * Based on actual reasons restaurants fail (SBA statistics)
 * Use for: Weekly scenario checks, educational crisis moments
 */
export {
  type FailureScenario,
  type ScenarioTrigger,
  type ScenarioConsequence,
  FAILURE_STATISTICS,
  CASH_FLOW_SCENARIOS,
  OPERATIONAL_SCENARIOS,
  MARKET_SCENARIOS,
  LEGAL_SCENARIOS,
  EXTERNAL_SCENARIOS,
  checkForFailureScenarios,
  generatePostMortem as generateFailurePostMortem,
} from './FailureScenarios';

/**
 * Scenario Consequences & Recovery
 * Apply real consequences, provide recovery options
 * Use for: When scenarios trigger, giving players meaningful choices
 */
export {
  type RecoveryOption,
  type RecoveryOutcome,
  applyScenarioConsequences,
  executeRecovery,
} from './ScenarioConsequences';

// ============================================
// PLAYER GUIDANCE SYSTEMS
// ============================================

/**
 * Advisor System
 * Contextual quotes from industry veterans
 * Use for: Real-time guidance based on game state
 */
export {
  type Advisor,
  type AdvisorAdvice,
  ADVISORS,
  ADVICE_DATABASE,
  getActiveAdvice,
  getAdvisor,
  formatAdvice,
  getRandomWisdom,
} from './AdvisorSystem';

/**
 * Post-Mortem Analysis
 * End-game reports with grades and lessons
 * Use for: Game end analysis, shareable summaries
 */
export {
  type PostMortemReport,
  generatePostMortem,
} from './PostMortem';

// ============================================
// LEARNING & REPLAY SYSTEMS
// ============================================

/**
 * Scenario Mode
 * Pre-configured learning scenarios for focused education
 * Use for: Targeted learning (cash flow 101, turnaround challenges, etc.)
 */
export {
  type LearningScenario,
  type SuccessCriterion,
  type FailureCriterion,
  type ScenarioProgress,
  type ScenarioHint,
  LEARNING_SCENARIOS,
  getScenariosByDifficulty,
  getScenariosByCategory,
  initializeScenario,
  processScenarioWeek,
  generateScenarioSummary,
  getScenarioEducation,
} from './ScenarioMode';

/**
 * Decision History & Replay
 * Track decisions, enable undo, explore "what if" branches
 * Use for: Learning from past decisions, comparing alternative outcomes
 */
export {
  type Decision,
  type DecisionCategory,
  type DecisionOption,
  type DecisionImpact,
  type DecisionBranch,
  type DecisionHistoryState,
  createDecisionHistory,
  recordDecision,
  undoDecision,
  redoDecision,
  createBranch,
  simulateAlternativeOutcome,
  analyzeDecisionPatterns,
  generateDecisionTimeline,
  identifyPivotPoints,
  exportDecisionSummary,
  getDecisionInsight,
} from './DecisionHistory';

// ============================================
// SEASONAL & CUSTOMER SYSTEMS
// ============================================

/**
 * Seasonal Events & Calendar
 * Holidays, weather, local events that affect business
 * Use for: Weekly event checks, planning for peaks/valleys
 */
export {
  type CalendarEvent,
  type EventType,
  type EventEffects,
  type ActiveEvent,
  type SeasonalState,
  ALL_EVENTS,
  HOLIDAY_EVENTS,
  SEASONAL_EVENTS,
  WEATHER_EVENTS,
  LOCAL_EVENTS,
  getSeason,
  initializeSeasonalState,
  processSeasonalWeek,
  calculateCombinedEffects,
  getUpcomingEvents,
  applySeasonalEffects,
  generateSeasonalCalendar,
  SEASONAL_LESSONS,
} from './SeasonalEvents';

/**
 * Customer Segmentation & Loyalty
 * Different customer types with different behaviors
 * Use for: Customer mix analysis, loyalty programs, marketing focus
 */
export {
  type CustomerSegment,
  type SegmentProfile,
  type CustomerMix,
  type Customer,
  type LoyaltyTier,
  type CustomerState,
  SEGMENT_PROFILES,
  DEFAULT_LOYALTY_TIERS,
  initializeCustomerState,
  calculateMixedTicket,
  calculatePriceSensitivity,
  predictPriceChangeImpact,
  predictReviews,
  processCustomerWeek,
  analyzeSegments,
  recommendMarketingFocus,
  CUSTOMER_LESSONS,
} from './CustomerSegmentation';

// ============================================
// EQUIPMENT & ASSET SYSTEMS
// ============================================

/**
 * Equipment Lifecycle Management
 * Depreciation, maintenance, breakdowns
 * Use for: Capital planning, maintenance scheduling, repair decisions
 */
export {
  type Equipment,
  type EquipmentCategory,
  type MaintenanceRecord,
  type EquipmentBreakdown,
  type RepairOption,
  type EquipmentState,
  EQUIPMENT_CATALOG,
  initializeEquipmentState,
  purchaseEquipment,
  calculateDepreciation,
  processEquipmentWeek,
  performMaintenance,
  repairBreakdown,
  analyzeLeaseVsBuy,
  generateEquipmentReport,
  EQUIPMENT_LESSONS,
} from './EquipmentLifecycle';

// ============================================
// GAMIFICATION SYSTEMS
// ============================================

/**
 * Achievement & Milestone System
 * Educational milestones with real-world context
 * Use for: Progress tracking, learning reinforcement
 */
export {
  type Achievement,
  type AchievementCategory,
  type UnlockedAchievement,
  type AchievementState,
  type AchievementProgress,
  type AchievementRank,
  ACHIEVEMENTS,
  initializeAchievementState,
  checkAchievements,
  getVisibleAchievements,
  getAchievementsByCategory,
  generateAchievementSummary,
  getRecommendedAchievements,
  ACHIEVEMENT_LESSONS,
} from './Achievements';

// ============================================
// QUICK REFERENCE: WHEN TO USE EACH SYSTEM
// ============================================
/**
 * GAME SETUP:
 * - RealMarketData: Get location-specific costs
 * - CompetitiveAnalysis: Generate initial competitors
 * - SupplierRelationship: Set up initial suppliers
 * - DecisionHistory: Initialize history tracking
 * - CustomerSegmentation: Initialize customer state
 * - EquipmentLifecycle: Set up initial equipment
 * - Achievements: Initialize achievement tracking
 * - SeasonalEvents: Initialize seasonal state
 *
 * SCENARIO MODE:
 * - ScenarioMode: Get/initialize learning scenarios
 * - processScenarioWeek: Check progress each week
 *
 * EACH WEEK:
 * - SeasonalEvents: Check for events, apply effects
 * - LaborScheduling: Validate/optimize schedule
 * - RealisticFinancials: Calculate P&L
 * - CashFlowEngine: Process cash flow
 * - CompetitiveAnalysis: Check for market events
 * - FailureScenarios: Check for triggered scenarios
 * - CustomerSegmentation: Process customer dynamics
 * - EquipmentLifecycle: Process wear, check breakdowns
 * - AdvisorSystem: Get contextual advice
 * - StaffDevelopment: Process training progress
 * - DecisionHistory: Record key decisions
 * - Achievements: Check for new unlocks
 *
 * PLAYER DECISIONS:
 * - MenuEngineering: Menu changes
 * - StaffDevelopment: Training/promotion choices
 * - SupplierRelationship: Vendor selection
 * - EquipmentLifecycle: Repair/replace/maintain
 * - CustomerSegmentation: Marketing focus
 * - ScenarioConsequences: Crisis recovery choices
 * - DecisionHistory: Track and analyze choices
 *
 * UNDO/WHAT-IF:
 * - undoDecision: Reverse last decision
 * - createBranch: Explore alternative path
 * - simulateAlternativeOutcome: Compare "what if"
 *
 * GAME END:
 * - PostMortem: Generate analysis report
 * - exportDecisionSummary: Share decision history
 * - generateScenarioSummary: Complete scenario review
 * - generateAchievementSummary: Show accomplishments
 */

// ============================================
// EDUCATIONAL PHILOSOPHY
// ============================================
/**
 * This simulation is designed to teach, not just entertain.
 *
 * Key lessons embedded in the systems:
 *
 * 1. CASH FLOW IS KING
 *    - Profit ≠ Cash
 *    - You pay bills before customers pay you
 *    - Running out of cash kills more restaurants than bad food
 *
 * 2. MARGINS ARE THIN
 *    - Real restaurants make 5-12%, not 20%+
 *    - Prime cost (food + labor) should be under 60%
 *    - Every percentage point matters
 *
 * 3. LOCATION IS DESTINY
 *    - Labor costs vary 50%+ between markets
 *    - Rent can be 2-3x in expensive cities
 *    - Competition density affects everyone
 *
 * 4. MENU ENGINEERING MATTERS
 *    - Not all dishes are equally profitable
 *    - Stars pay for Dogs
 *    - Smaller menus usually win
 *
 * 5. PEOPLE ARE EVERYTHING
 *    - Turnover costs 50-200% of annual salary
 *    - Training pays for itself
 *    - Morale affects quality, service, and retention
 *
 * 6. SUPPLIERS ARE PARTNERS
 *    - Payment terms affect cash flow as much as price
 *    - Relationships unlock better terms
 *    - Diversification protects against disruption
 *
 * 7. FAILURE IS COMMON BUT PREVENTABLE
 *    - 60% of restaurants fail by year 5
 *    - #1 cause: undercapitalization
 *    - Most failures are boring and preventable
 *
 * The goal is for someone who "wins" this game to have a realistic
 * understanding of what they're getting into if they open a real restaurant.
 */
