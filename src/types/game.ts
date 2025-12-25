// Core game types

export interface Cuisine {
  id: string;
  name: string;
  icon: string;
  foodCost: number;
  avgTicket: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  wage: number;
  skill: number;
  weeks: number;
  training: string[];
  morale: number;
  icon: string;
  department: 'kitchen' | 'foh' | 'bar' | 'management' | 'corporate';
  canManage?: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  cost: number;
  popular: boolean;
  is86d: boolean;
}

export interface Location {
  id: number;
  name: string;
  locationType: string;
  market: string;
  isGhostKitchen: boolean;
  cash: number;
  totalRevenue: number;
  totalProfit: number;
  weeklyHistory: WeeklyRecord[];
  staff: StaffMember[];
  menu: MenuItem[];
  equipment: string[];
  upgrades: string[];
  marketing: Marketing;
  delivery: Delivery;
  virtualBrands: string[];
  reputation: number;
  morale: number;
  covers: number;
  weeksOpen: number;
  manager: StaffMember | null;
  managerAutonomy: number;
  rent: number;
  avgTicket: number;
  foodCostPct: number;
  lastWeekRevenue: number;
  lastWeekProfit: number;
  lastWeekCovers: number;
  // Loan tracking per location
  loans?: Loan[];
  // Economic multipliers
  economicRevenueMultiplier?: number;
  economicCostMultiplier?: number;
  // City/State location data
  city?: string;
  state?: string;
  locationEconomicData?: LocationEconomicData;
}

export interface WeeklyRecord {
  week: number;
  revenue: number;
  profit: number;
  covers: number;
}

export interface Marketing {
  channels: string[];
  socialFollowers: number;
}

export interface Delivery {
  platforms: string[];
  orders: number;
}

export interface Franchise {
  id: number;
  tier: string;
  name: string;
  weeklyRoyalty: number;
  weeksActive: number;
  performance: number;
  quality: number;
}

export interface Loan {
  type: string;
  amount: number;
  remaining: number;
  weeksRemaining: number;
  weeklyPayment: number;
  rate?: number;
}

export interface Competitor {
  id: number;
  name: string;
  type: string;
  reputation: number;
  weeksOpen: number;
}

export interface Vendor {
  id: string;
  name: string;
  weeksUsed: number;
  deal: string | null;
  priceLevel: number;
  relationship: number;
}

export interface Investor {
  id: number;
  type: string;
  name: string;
  amount: number;
  equity: number;
}

export interface GameStats {
  peakWeeklyRevenue: number;
  peakWeeklyProfit: number;
  totalCustomersServed: number;
  employeesHired: number;
  employeesFired: number;
  scenariosWon: number;
  scenariosLost: number;
  locationsOpened: number;
  locationsClosed: number;
  franchisesSold: number;
}

export interface GameState {
  week: number;
  locations: Location[];
  franchises: Franchise[];
  corporateStaff: StaffMember[];
  corporateCash: number;
  totalRevenue: number;
  totalProfit: number;
  loans: Loan[];
  equity: number;
  empireValuation: number;
  brandStrength: number;
  achievements: string[];
  scenariosSeen: string[];
  profitStreak: number;
  burnout: number;
  ownerHours: number;
  franchiseEnabled: boolean;
  franchiseFee: number;
  royaltyRate: number;
  competitors: Competitor[];
  vendors: Vendor[];
  currentSeason: string;
  upcomingEvents: string[];
  completedEvents: string[];
  unlockedMilestones: string[];
  milestoneRewards: number;
  tutorialComplete: boolean;
  tutorialProgress: number;
  stats: GameStats;
  investors: Investor[];
  totalEquitySold: number;
  boardMembers: number;
  investorDemands: string[];
  ownedProperties: Property[];
  totalPropertyValue: number;
  mortgages: Mortgage[];
  cateringEnabled: boolean;
  cateringContracts: CateringContract[];
  cateringRevenue: number;
  cateringCapacity: number;
  foodTrucks: FoodTruck[];
  truckEvents: string[];
  truckRevenue: number;
  mediaAppearances: MediaAppearance[];
  brandDeals: BrandDeal[];
  publicProfile: number;
  cookbookSales: number;
  economicCondition: string;
  economicEffects: Record<string, number>;
  economyCycleWeek: number;
  exitStrategy: string | null;
  exitProgress: number;
  ipoReady: boolean;
  weather: Weather;
  reviews: Record<string, Review>;
  healthInspection: HealthInspection;
  socialMediaEvents: string[];
  employeeBenefits: string[];
  maintenanceLevel: number;
  equipmentStatus: Record<string, number>;
  supplyDisruptions: string[];
  customerSegments: Record<string, number>;
  kpiHistory: KPIRecord[];
  regularCustomers: number;
  weeksWithoutBreakdown: number;
  weeksMeetingKPIs: number;
}

export interface Property {
  id: number;
  type: string;
  value: number;
  location: string;
}

export interface Mortgage {
  propertyId: number;
  principal: number;
  weeklyPayment: number;
  weeksRemaining: number;
}

export interface CateringContract {
  id: string;
  weeklyRevenue: number;
}

export interface FoodTruck {
  id: number;
  name: string;
  currentEvent: string | null;
  eventRevenue: number;
}

export interface MediaAppearance {
  id: string;
  date: string;
}

export interface BrandDeal {
  id: string;
  active: boolean;
}

export interface Weather {
  current: string;
  forecast: string[];
  weeksOfBadWeather: number;
}

export interface Review {
  rating: number;
  count: number;
}

export interface HealthInspection {
  lastGrade: string;
  lastScore: number;
  lastDate: string | null;
  violations: string[];
}

export interface KPIRecord {
  week: number;
  metrics: Record<string, number>;
}

// Location economic modifiers from AI research
export interface LocationEconomicData {
  city: string;
  state: string;
  // Base modifiers (from constants)
  costOfLiving: number;
  wageMultiplier: number;
  rentMultiplier: number;
  ticketMultiplier: number;
  trafficMultiplier: number;
  competitionLevel: number;
  foodCostMultiplier: number;
  tier: number;
  // AI-researched detailed data (loaded in background)
  aiResearched?: boolean;
  researchedAt?: string;
  // Detailed wage data
  minWage?: number;
  avgRestaurantWage?: number;
  avgManagerSalary?: number;
  // Real estate data
  avgCommercialRentSqFt?: number;
  avgBuildoutCostSqFt?: number;
  // Market data
  avgTicketCasual?: number;
  avgTicketFineDining?: number;
  restaurantsPerCapita?: number;
  // Economic context
  unemploymentRate?: number;
  medianHouseholdIncome?: number;
  touristDestination?: boolean;
  majorEmployers?: string[];
  // Fun facts for flavor
  foodScene?: string;
  localSpecialties?: string[];
  bestNeighborhoods?: string[];
}

// Status of location research
export type LocationResearchStatus = 'pending' | 'loading' | 'complete' | 'error';

export interface Setup {
  cuisine: string | null;
  capital: number;
  name: string;
  location: string;
  market: string;
  goal: string;
  experience: string;
  difficulty: string;
  // New location fields
  city: string;
  state: string;
  locationData?: LocationEconomicData;
  locationResearchStatus?: LocationResearchStatus;
}

export interface Scenario {
  id: string;
  title: string;
  message: string;
  type: 'crisis' | 'opportunity' | 'decision';
  options: ScenarioOption[];
  minWeek?: number;
  minCash?: number;
  minLocations?: number;
  maxLocations?: number;
  minFranchises?: number;
  minReputation?: number;
  minValuation?: number;
  requiresInvestors?: boolean;
  investorType?: string;
  economic?: string;
}

export interface ScenarioOption {
  text: string;
  successChance: number;
  success: ScenarioOutcome;
  fail: ScenarioOutcome;
}

export interface ScenarioOutcome {
  cash?: number;
  reputation?: number;
  morale?: number;
  burnout?: number;
  covers?: number;
  followers?: number;
  allLocations?: boolean;
  expansionOpportunity?: boolean;
  newFranchises?: number;
  equity?: number;
  endGame?: string;
  foodCostMod?: number;
  laborCostMod?: number;
}

export type Screen = 'welcome' | 'onboarding' | 'dashboard' | 'gameover' | 'win';

export type Tab = 'overview' | 'staff' | 'ops' | 'finance' | 'empire';

export type GameSpeed = 'pause' | 'slow' | 'normal' | 'fast';

// Type aliases for backwards compatibility
export type LocationState = Location;
export type SetupState = Setup;
export type GameStateType = GameState;

// Conversation message for AI chat
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// AI Quick Action
export interface AIQuickAction {
  label: string;
  prompt: string;
}

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (game: GameState) => boolean;
}

// Notification type
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'milestone';
  message: string;
  timestamp: number;
}

// Save game slot
export interface SaveSlot {
  slot: number;
  name: string;
  date: string;
  week: number;
  cash: number;
  setup: Setup;
  game: GameState;
  version?: string;
  checksum?: string;
}

// Theme colors
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  info: string;
  purple: string;
  pink: string;
  cyan: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
}

// Command for undo/redo
export interface GameCommand {
  type: string;
  payload: unknown;
  timestamp: number;
  description: string;
}

// Analytics event
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}
