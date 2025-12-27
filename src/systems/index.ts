// ============================================
// EDUCATIONAL RESTAURANT SIMULATION SYSTEMS
// ============================================
// These systems transform the game from "fun but unrealistic"
// to "educational tool for aspiring restaurant owners"

// Cash Flow Engine
// The #1 reason restaurants fail: profitable but out of cash
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

// Realistic Financial Model
// Industry-accurate P&L with 5-12% margins (not the 20%+ the game was giving)
export {
  type RestaurantPL,
  type PLIssue,
  type PLAnalysis,
  INDUSTRY_BENCHMARKS,
  calculateWeeklyPL,
  analyzePL,
  calculateBreakEven,
} from './RealisticFinancials';

// Real Market Data Integration
// Pull actual data from BLS, USDA, and local markets
export {
  type MarketData,
  getMinimumWage,
  calculateRestaurantWages,
  getMarketData,
  getCommodityPrices,
  calculateMenuItemImpact,
} from './RealMarketData';

// Menu Engineering
// Teach that 70% of profit comes from 20% of menu items
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

// Failure Scenarios
// Based on actual reasons restaurants fail
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
  generatePostMortem,
} from './FailureScenarios';

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
 * 5. FAILURE IS COMMON
 *    - 60% of restaurants fail by year 5
 *    - #1 cause: undercapitalization
 *    - Most failures are boring and preventable
 *
 * The goal is for someone who "wins" this game to have a realistic
 * understanding of what they're getting into if they open a real restaurant.
 */
