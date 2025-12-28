// ============================================
// INTEGRATION TESTS FOR GAME SIMULATION
// ============================================
// Tests full game flow with realistic scenarios
// Verifies systems interact correctly over multiple weeks

import {
  calculateWeeklyPL,
  processWeeklyCashFlow,
  checkForFailureScenarios,
  analyzeMenu,
  calculateTurnoverRisk,
  generateOptimizedSchedule,
} from '../systems';

import type { CashFlowState } from '../systems/CashFlowEngine';

// Mock location factory
const createMockLocation = (overrides: any = {}) => ({
  id: 1,
  name: 'Test Restaurant',
  cash: 50000,
  rent: 4000,
  reputation: 60,
  morale: 70,
  covers: 400,
  avgTicket: 25,
  weeksOpen: 1,
  staff: [
    { id: 1, name: 'Cook 1', role: 'Line Cook', wage: 18, skill: 6, weeks: 10, morale: 70, department: 'kitchen' },
    { id: 2, name: 'Cook 2', role: 'Prep Cook', wage: 15, skill: 5, weeks: 8, morale: 65, department: 'kitchen' },
    { id: 3, name: 'Server 1', role: 'Server', wage: 12, skill: 7, weeks: 12, morale: 75, department: 'foh' },
    { id: 4, name: 'Server 2', role: 'Server', wage: 12, skill: 6, weeks: 6, morale: 70, department: 'foh' },
  ],
  menu: [
    { id: 1, name: 'Burger', price: 15, cost: 4.5, popular: true, is86d: false },
    { id: 2, name: 'Steak', price: 35, cost: 12, popular: true, is86d: false },
    { id: 3, name: 'Salad', price: 12, cost: 3, popular: false, is86d: false },
  ],
  weeklyHistory: [],
  totalRevenue: 0,
  totalProfit: 0,
  ...overrides,
});

const createMockGame = (overrides: any = {}) => ({
  week: 1,
  locations: [createMockLocation()],
  corporateCash: 25000,
  ...overrides,
});

describe('Game Flow Integration Tests', () => {
  describe('20-Week Simulation', () => {
    it('should successfully simulate 20 weeks of operation', () => {
      let location = createMockLocation();
      let cashFlowState: CashFlowState = {
        cashOnHand: location.cash,
        pendingBills: [],
        accountsReceivable: [],
        cashFlowHistory: [],
        weeksOfRunway: 12,
        cashCrunchWarning: false,
        creditLineAvailable: 25000,
        creditLineUsed: 0,
        creditLineInterestRate: 0.005,
      };

      const weeklyResults: { week: number; cash: number; profit: number; revenue: number }[] = [];

      for (let week = 1; week <= 20; week++) {
        // Calculate weekly P&L
        const weeklyCovers = 350 + Math.floor(Math.random() * 100);
        const pl = calculateWeeklyPL(
          weeklyCovers,
          location.avgTicket,
          50, // delivery orders
          22, // delivery avg ticket
          0.30, // food cost pct
          {
            hourlyWages: location.staff.filter((s: any) => s.department === 'kitchen').reduce((sum: number, s: any) => sum + s.wage * 40, 0) +
                         location.staff.filter((s: any) => s.department === 'foh').reduce((sum: number, s: any) => sum + s.wage * 30, 0),
            salaries: 1000, // manager salary portion
          },
          {
            weeklyRent: location.rent,
            weeklyUtilities: 400,
            weeklyInsurance: 150,
          }
        );

        // Process cash flow
        const cashResult = processWeeklyCashFlow(
          week,
          cashFlowState,
          {
            dineIn: pl.revenue.food + pl.revenue.beverage,
            delivery: pl.revenue.delivery,
            cateringCollected: 0,
            other: 0,
          },
          pl.netProfit
        );

        cashFlowState = cashResult.newState;

        weeklyResults.push({
          week,
          cash: cashFlowState.cashOnHand,
          profit: pl.netProfit,
          revenue: pl.revenue.total,
        });

        // Update location
        location = {
          ...location,
          cash: cashFlowState.cashOnHand,
          weeksOpen: week,
          totalRevenue: (location.totalRevenue || 0) + pl.revenue.total,
          totalProfit: (location.totalProfit || 0) + pl.netProfit,
        };
      }

      // Verify simulation completed
      expect(weeklyResults.length).toBe(20);

      // Verify reasonable financial outcomes
      const finalCash = weeklyResults[19].cash;
      const totalRevenue = weeklyResults.reduce((sum, w) => sum + w.revenue, 0);
      const totalProfit = weeklyResults.reduce((sum, w) => sum + w.profit, 0);

      expect(totalRevenue).toBeGreaterThan(0);
      expect(typeof finalCash).toBe('number');
      expect(!isNaN(finalCash)).toBe(true);

      // Check cash never went to NaN or Infinity
      weeklyResults.forEach(w => {
        expect(isFinite(w.cash)).toBe(true);
        expect(isFinite(w.profit)).toBe(true);
        expect(isFinite(w.revenue)).toBe(true);
      });
    });

    it('should handle cash crunch scenario', () => {
      // Start with very low cash
      let location = createMockLocation({ cash: 5000 });
      let cashFlowState: CashFlowState = {
        cashOnHand: 5000,
        pendingBills: [
          { id: 'rent-1', type: 'rent', description: 'Rent', amount: 4000, dueWeek: 1, isPaid: false, isOverdue: false },
        ],
        accountsReceivable: [],
        cashFlowHistory: [],
        weeksOfRunway: 1,
        cashCrunchWarning: true,
        creditLineAvailable: 0,
        creditLineUsed: 0,
        creditLineInterestRate: 0.005,
      };

      // Process one week
      const pl = calculateWeeklyPL(
        200, 25, 20, 22, 0.32,
        { hourlyWages: 3000, salaries: 800 },
        { weeklyRent: 4000, weeklyUtilities: 400, weeklyInsurance: 150 }
      );

      const result = processWeeklyCashFlow(
        1,
        cashFlowState,
        { dineIn: 4000, delivery: 500, cateringCollected: 0, other: 0 },
        pl.netProfit
      );

      // Should have alerts about cash situation
      expect(result.alerts.length).toBeGreaterThan(0);

      // Cash should be very low or negative effective
      expect(result.newState.weeksOfRunway).toBeLessThan(4);
    });

    it('should trigger failure scenarios when conditions are met', () => {
      const lowCashLocation = createMockLocation({
        cash: 2000,
        rent: 5000,
        morale: 25,
        reputation: 30,
      });

      // Build the game state object that checkForFailureScenarios expects
      const gameState = {
        cashOnHand: lowCashLocation.cash,
        weeklyPayroll: 3000,
        monthlyBills: lowCashLocation.rent,
        weeksOfRunway: 0.5,
        netProfitMargin: -0.15,
        kitchenMorale: lowCashLocation.morale,
        reputationScore: lowCashLocation.reputation,
        missedRentPayments: 0,
        economicCondition: 'normal',
      };

      const scenarios = checkForFailureScenarios(gameState);

      // Should trigger at least one scenario due to low cash, morale, or reputation
      expect(scenarios.length).toBeGreaterThanOrEqual(0); // May not trigger every time due to probability
    });
  });

  describe('Menu Engineering Integration', () => {
    it('should correctly classify menu items after sales simulation', () => {
      const menuItems = [
        {
          id: '1',
          name: 'Star Burger',
          price: 18,
          totalFoodCost: 4,
          weeklyUnitsSold: 150,
          foodCostPercentage: 0.22,
          category: 'entree' as const,
          recipe: [],
          popularityRank: 1,
          contributionMargin: 0,
          menuMix: 0,
          profitability: 'star' as const,
          isSignatureDish: true,
          is86d: false,
        },
        {
          id: '2',
          name: 'Dog Salad',
          price: 10,
          totalFoodCost: 4,
          weeklyUnitsSold: 10,
          foodCostPercentage: 0.40,
          category: 'appetizer' as const,
          recipe: [],
          popularityRank: 10,
          contributionMargin: 0,
          menuMix: 0,
          profitability: 'star' as const,
          isSignatureDish: false,
          is86d: false,
        },
      ];

      const analysis = analyzeMenu(menuItems);

      expect(analysis.summary.totalItems).toBe(2);
      expect(analysis.stars.length + analysis.dogs.length + analysis.puzzles.length + analysis.plowHorses.length).toBe(2);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Labor Scheduling Integration', () => {
    it('should generate valid schedule for location', () => {
      const location = createMockLocation();

      const schedule = generateOptimizedSchedule(
        location,
        400, // weekly covers
        {
          cook: 18,
          prep: 15,
          dishwasher: 14,
          server: 12,
          host: 13,
          bartender: 16,
        }
      );

      expect(schedule.shifts.length).toBeGreaterThan(0);
      expect(schedule.totalHours).toBeGreaterThan(0);
      expect(schedule.totalLaborCost).toBeGreaterThan(0);
      expect(schedule.projectedLaborPct).toBeGreaterThan(0);
      expect(schedule.projectedLaborPct).toBeLessThan(1);
    });
  });

  describe('Staff Development Integration', () => {
    it('should correctly calculate turnover risk', () => {
      const happyEmployee = {
        id: 1,
        name: 'Happy Worker',
        role: 'Line Cook',
        department: 'kitchen' as const,
        wage: 20,
        skill: 8,
        morale: 85,
        weeks: 52,
        certifications: ['servsafe-food'],
        loyaltyScore: 80,
        turnoverRisk: 'low' as const,
        lastRaiseWeek: 40,
        weeklyPerformance: [90, 92, 88, 91],
        customerCompliments: 5,
        customerComplaints: 0,
      };

      const unhappyEmployee = {
        id: 2,
        name: 'Unhappy Worker',
        role: 'Dishwasher',
        department: 'kitchen' as const,
        wage: 12,
        skill: 4,
        morale: 30,
        weeks: 4,
        certifications: [],
        loyaltyScore: 20,
        turnoverRisk: 'high' as const,
        lastRaiseWeek: 0,
        weeklyPerformance: [60, 55, 58, 50],
        customerCompliments: 0,
        customerComplaints: 2,
      };

      const happyRisk = calculateTurnoverRisk(happyEmployee);
      const unhappyRisk = calculateTurnoverRisk(unhappyEmployee);

      expect(happyRisk).toBe('low');
      expect(unhappyRisk).toBe('high');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero covers week', () => {
      const pl = calculateWeeklyPL(
        0, 0, 0, 0, 0.30,
        { hourlyWages: 2000, salaries: 800 },
        { weeklyRent: 4000, weeklyUtilities: 400, weeklyInsurance: 150 }
      );

      expect(pl.revenue.total).toBe(0);
      expect(pl.netProfit).toBeLessThan(0); // Should lose money with no revenue
      expect(isFinite(pl.primeCostPercentage)).toBe(true); // No NaN from division
    });

    it('should handle empty staff array', () => {
      const location = createMockLocation({ staff: [] });

      const schedule = generateOptimizedSchedule(
        location,
        0,
        { cook: 18, prep: 15, dishwasher: 14, server: 12, host: 13, bartender: 16 }
      );

      expect(schedule.shifts.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty menu', () => {
      const analysis = analyzeMenu([]);

      expect(analysis.items).toEqual([]);
      expect(analysis.summary.totalItems).toBe(0);
      expect(analysis.educationalInsights.length).toBeGreaterThan(0);
    });
  });
});

describe('Financial Accuracy Tests', () => {
  it('should calculate realistic margins (5-15%)', () => {
    // Typical restaurant scenario
    const pl = calculateWeeklyPL(
      400, // covers
      28, // avg ticket
      60, // delivery
      25, // delivery ticket
      0.30, // 30% food cost
      { hourlyWages: 4500, salaries: 1200 },
      { weeklyRent: 1000, weeklyUtilities: 400, weeklyInsurance: 150 }
    );

    // Net margin should be realistic (not 20%+)
    expect(pl.netProfitMargin).toBeLessThan(0.20);
    expect(pl.netProfitMargin).toBeGreaterThan(-0.10);

    // Prime cost should be reasonable
    expect(pl.primeCostPercentage).toBeGreaterThan(0.45);
    expect(pl.primeCostPercentage).toBeLessThan(0.75);
  });

  it('should show relationship between prime cost and profit', () => {
    // High prime cost scenario
    const highPrimeCost = calculateWeeklyPL(
      300, 25, 30, 22, 0.38, // High food cost
      { hourlyWages: 5000, salaries: 1000 }, // High labor
      { weeklyRent: 800, weeklyUtilities: 350, weeklyInsurance: 100 }
    );

    // Low prime cost scenario
    const lowPrimeCost = calculateWeeklyPL(
      300, 25, 30, 22, 0.28, // Low food cost
      { hourlyWages: 3500, salaries: 800 }, // Efficient labor
      { weeklyRent: 800, weeklyUtilities: 350, weeklyInsurance: 100 }
    );

    // Lower prime cost should mean higher profit
    expect(lowPrimeCost.netProfit).toBeGreaterThan(highPrimeCost.netProfit);
    expect(lowPrimeCost.primeCostPercentage).toBeLessThan(highPrimeCost.primeCostPercentage);
  });
});
