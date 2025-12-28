/**
 * Unit Tests for Educational Restaurant Systems
 * Tests the core financial calculations that teach restaurant economics
 */

import {
  calculateWeeklyPL,
  analyzePL,
  calculateBreakEven,
  INDUSTRY_BENCHMARKS,
} from '../systems/RealisticFinancials';

import {
  calculateRunway,
  generateUpcomingBills,
  processWeeklyCashFlow,
  explainCashFlowGap,
} from '../systems/CashFlowEngine';

import {
  analyzeMenu,
  classifyMenuItem,
  calculateRecipeCost,
  suggestPrice,
} from '../systems/MenuEngineering';

describe('RealisticFinancials', () => {
  describe('calculateWeeklyPL', () => {
    it('should calculate correct revenue from covers and ticket', () => {
      const pl = calculateWeeklyPL(
        100, // weeklyCovers
        50, // avgTicket
        20, // deliveryOrders
        45, // deliveryAvgTicket
        0.32, // menuFoodCostPct
        { hourlyWages: 2000, salaries: 1000 },
        { weeklyRent: 1000, weeklyUtilities: 200, weeklyInsurance: 100 }
      );

      expect(pl.revenue.total).toBeGreaterThan(0);
      expect(pl.revenue.food).toBe(100 * 50 * 0.75); // 75% food
      expect(pl.revenue.beverage).toBe(100 * 50 * 0.25); // 25% beverage
    });

    it('should handle zero covers without crashing', () => {
      const pl = calculateWeeklyPL(
        0, 0, 0, 0, 0.32,
        { hourlyWages: 0, salaries: 0 },
        { weeklyRent: 1000, weeklyUtilities: 200, weeklyInsurance: 100 }
      );

      expect(pl.revenue.total).toBe(0);
      expect(pl.primeCostPercentage).toBe(0); // Division by zero protected
      expect(pl.netProfitMargin).toBe(0);
    });

    it('should calculate prime cost as COGS + Labor', () => {
      const pl = calculateWeeklyPL(
        100, 50, 0, 0, 0.30,
        { hourlyWages: 1500, salaries: 500 },
        { weeklyRent: 500, weeklyUtilities: 100, weeklyInsurance: 50 }
      );

      expect(pl.primeCost).toBe(pl.cogs.total + pl.labor.total);
    });

    it('should warn when prime cost exceeds 60%', () => {
      const pl = calculateWeeklyPL(
        50, 30, 0, 0, 0.40, // High food cost
        { hourlyWages: 800, salaries: 200 }, // High labor for low revenue
        { weeklyRent: 300, weeklyUtilities: 50, weeklyInsurance: 25 }
      );

      expect(pl.primeCostPercentage).toBeGreaterThan(
        INDUSTRY_BENCHMARKS.primeCost.target
      );
    });
  });

  describe('analyzePL', () => {
    it('should flag critical issues when prime cost is too high', () => {
      const pl = calculateWeeklyPL(
        30, 25, 0, 0, 0.45,
        { hourlyWages: 600, salaries: 200 },
        { weeklyRent: 200, weeklyUtilities: 50, weeklyInsurance: 25 }
      );

      const analysis = analyzePL(pl);
      const hasPrimeCostIssue = analysis.issues.some(
        i => i.category === 'prime_cost'
      );

      expect(hasPrimeCostIssue).toBe(true);
    });

    it('should give good grades for healthy margins', () => {
      const pl = calculateWeeklyPL(
        200, 60, 30, 55, 0.28,
        { hourlyWages: 2500, salaries: 800 },
        { weeklyRent: 800, weeklyUtilities: 150, weeklyInsurance: 80 }
      );

      const analysis = analyzePL(pl);
      expect(['A', 'B', 'C']).toContain(analysis.grade);
    });
  });

  describe('calculateBreakEven', () => {
    it('should calculate break-even covers correctly', () => {
      const result = calculateBreakEven(
        10000, // fixedCostsMonthly
        40, // avgTicket
        0.30, // foodCostPct
        0.30 // laborCostPct
      );

      expect(result.coversPerMonth).toBeGreaterThan(0);
      expect(result.revenuePerMonth).toBeGreaterThan(10000);
      expect(result.coversPerWeek).toBe(result.coversPerMonth / 4);
    });
  });
});

describe('CashFlowEngine', () => {
  describe('calculateRunway', () => {
    it('should return weeks until cash runs out', () => {
      const runway = calculateRunway(10000, 2500, []);
      expect(runway).toBe(4); // 10000 / 2500 = 4 weeks
    });

    it('should factor in upcoming bills', () => {
      const runway = calculateRunway(10000, 2500, [
        { id: 'rent-1', type: 'rent', description: 'Rent', amount: 5000, dueWeek: 2, isPaid: false, isOverdue: false },
      ]);

      expect(runway).toBeLessThan(4); // Should be less due to upcoming rent
    });

    it('should cap runway at 52 weeks', () => {
      const runway = calculateRunway(1000000, 100, []);
      expect(runway).toBe(52);
    });

    it('should handle zero burn rate', () => {
      const runway = calculateRunway(10000, 0, []);
      expect(runway).toBe(52); // Max runway when no burn
    });
  });

  describe('generateUpcomingBills', () => {
    it('should generate rent bills on correct weeks', () => {
      const bills = generateUpcomingBills(1, 4000, 2000, 500, [], []);
      const rentBills = bills.filter(b => b.type === 'rent');

      expect(rentBills.length).toBeGreaterThan(0);
      rentBills.forEach(bill => {
        expect(bill.dueWeek % 4).toBe(1); // Due on weeks 1, 5, 9...
      });
    });

    it('should generate payroll bills every 2 weeks', () => {
      const bills = generateUpcomingBills(1, 4000, 2000, 500, [], []);
      const payrollBills = bills.filter(b => b.type === 'payroll');

      expect(payrollBills.length).toBeGreaterThan(0);
      payrollBills.forEach(bill => {
        expect(bill.dueWeek % 2).toBe(0); // Due on even weeks
      });
    });
  });

  describe('processWeeklyCashFlow', () => {
    const baseState = {
      cashOnHand: 20000,
      pendingBills: [],
      accountsReceivable: [],
      cashFlowHistory: [],
      weeksOfRunway: 8,
      cashCrunchWarning: false,
      creditLineAvailable: 25000,
      creditLineUsed: 0,
      creditLineInterestRate: 0.005,
    };

    it('should track cash in and out correctly', () => {
      const result = processWeeklyCashFlow(
        1,
        baseState,
        { dineIn: 10000, delivery: 2000, cateringCollected: 0, other: 0 },
        3000
      );

      expect(result.weekFlow.totalCashIn).toBe(12000);
      expect(result.newState.cashOnHand).toBeGreaterThan(baseState.cashOnHand);
    });

    it('should alert when profitable but cash-negative', () => {
      const stateWithBills = {
        ...baseState,
        cashOnHand: 5000,
        pendingBills: [
          { id: 'rent-1', type: 'rent', description: 'Rent', amount: 8000, dueWeek: 1, isPaid: false, isOverdue: false },
        ],
      };

      const result = processWeeklyCashFlow(
        1,
        stateWithBills,
        { dineIn: 5000, delivery: 1000, cateringCollected: 0, other: 0 },
        2000 // Profitable on paper
      );

      const hasCashFlowAlert = result.alerts.some(
        a => a.type === 'profitable_but_negative_cash' || a.type === 'low_runway'
      );

      expect(hasCashFlowAlert).toBe(true);
    });
  });

  describe('explainCashFlowGap', () => {
    it('should explain positive gap (profit > cash)', () => {
      const explanation = explainCashFlowGap({
        week: 1,
        cashFromSales: 5000,
        cashFromDelivery: 1000,
        cashFromCatering: 0,
        cashFromOther: 0,
        totalCashIn: 6000,
        rentPaid: 0,
        payrollPaid: 3000,
        suppliersPaid: 0,
        utilitiesPaid: 0,
        loanPaymentsPaid: 0,
        taxesPaid: 0,
        otherPaid: 0,
        totalCashOut: 3000,
        netCashFlow: 3000,
        endingCash: 23000,
        accountingProfit: 5000, // Higher than cash flow
        cashFlowDifference: 2000,
      });

      expect(explanation).toContain('profitable');
    });
  });
});

describe('MenuEngineering', () => {
  describe('analyzeMenu', () => {
    it('should handle empty menu without crashing', () => {
      const analysis = analyzeMenu([]);

      expect(analysis.items).toEqual([]);
      expect(analysis.summary.totalItems).toBe(0);
      expect(analysis.educationalInsights).toContain('Add menu items to see analysis');
    });

    it('should classify items into stars, puzzles, plow horses, and dogs', () => {
      const menuItems = [
        { id: '1', name: 'Burger', price: 15, totalFoodCost: 4, weeklyUnitsSold: 100, foodCostPercentage: 0.27, category: 'entree', recipe: [], popularityRank: 1, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: true, is86d: false },
        { id: '2', name: 'Truffle Pasta', price: 35, totalFoodCost: 8, weeklyUnitsSold: 10, foodCostPercentage: 0.23, category: 'entree', recipe: [], popularityRank: 5, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: false, is86d: false },
        { id: '3', name: 'Kids Meal', price: 8, totalFoodCost: 3, weeklyUnitsSold: 80, foodCostPercentage: 0.375, category: 'entree', recipe: [], popularityRank: 2, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: false, is86d: false },
        { id: '4', name: 'Side Salad', price: 6, totalFoodCost: 2.5, weeklyUnitsSold: 5, foodCostPercentage: 0.42, category: 'side', recipe: [], popularityRank: 10, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: false, is86d: false },
      ];

      const analysis = analyzeMenu(menuItems);

      expect(analysis.summary.totalItems).toBe(4);
      expect(analysis.stars.length + analysis.puzzles.length + analysis.plowHorses.length + analysis.dogs.length).toBe(4);
    });

    it('should generate recommendations for each category', () => {
      const menuItems = [
        { id: '1', name: 'Star Item', price: 20, totalFoodCost: 5, weeklyUnitsSold: 50, foodCostPercentage: 0.25, category: 'entree', recipe: [], popularityRank: 1, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: true, is86d: false },
        { id: '2', name: 'Dog Item', price: 10, totalFoodCost: 5, weeklyUnitsSold: 2, foodCostPercentage: 0.50, category: 'entree', recipe: [], popularityRank: 10, contributionMargin: 0, menuMix: 0, profitability: 'star', isSignatureDish: false, is86d: false },
      ];

      const analysis = analyzeMenu(menuItems);

      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('classifyMenuItem', () => {
    const baseItem = {
      id: '1',
      name: 'Test',
      price: 20,
      totalFoodCost: 5,
      foodCostPercentage: 0.25,
      weeklyUnitsSold: 50,
      category: 'entree',
      recipe: [],
      popularityRank: 1,
      contributionMargin: 15,
      menuMix: 0.25,
      profitability: 'star',
      isSignatureDish: false,
      is86d: false,
    };

    it('should classify high margin, high popularity as star', () => {
      const result = classifyMenuItem(
        { ...baseItem, contributionMargin: 15, menuMix: 0.30 },
        10, // avgContributionMargin
        0.20 // avgMenuMix
      );
      expect(result).toBe('star');
    });

    it('should classify high margin, low popularity as puzzle', () => {
      const result = classifyMenuItem(
        { ...baseItem, contributionMargin: 15, menuMix: 0.05 },
        10,
        0.20
      );
      expect(result).toBe('puzzle');
    });

    it('should classify low margin, high popularity as plow_horse', () => {
      const result = classifyMenuItem(
        { ...baseItem, contributionMargin: 5, menuMix: 0.30 },
        10,
        0.20
      );
      expect(result).toBe('plow_horse');
    });

    it('should classify low margin, low popularity as dog', () => {
      const result = classifyMenuItem(
        { ...baseItem, contributionMargin: 5, menuMix: 0.05 },
        10,
        0.20
      );
      expect(result).toBe('dog');
    });
  });

  describe('calculateRecipeCost', () => {
    it('should sum ingredient costs correctly', () => {
      const result = calculateRecipeCost([
        { name: 'Beef', quantity: 8, unit: 'oz', costPerUnit: 0.50, totalCost: 4.00 },
        { name: 'Bun', quantity: 1, unit: 'each', costPerUnit: 0.30, totalCost: 0.30 },
        { name: 'Cheese', quantity: 2, unit: 'oz', costPerUnit: 0.15, totalCost: 0.30 },
      ]);

      expect(result.totalCost).toBe(4.60);
      expect(result.largestCostDriver).toBe('Beef');
    });

    it('should handle empty recipe', () => {
      const result = calculateRecipeCost([]);
      expect(result.totalCost).toBe(0);
      expect(result.largestCostDriver).toBe('None');
    });
  });

  describe('suggestPrice', () => {
    it('should suggest price based on target food cost', () => {
      const result = suggestPrice(5, 0.30); // $5 cost, 30% target
      expect(result.suggestedPrice).toBeCloseTo(16.99, 0); // ~$5/0.30 rounded
    });

    it('should compare to competitor price', () => {
      const result = suggestPrice(5, 0.30, 14);
      expect(result.vsCompetitor).toBeDefined();
    });
  });
});
