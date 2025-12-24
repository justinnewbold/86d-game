// ============================================
// GAME LOOP HOOK
// ============================================

import { useCallback, useRef, useEffect } from 'react';
import { GameState, LocationState } from '../types/game';
import {
  CUISINES,
  LOCATION_TYPES,
  CUSTOMER_TYPES,
  EQUIPMENT,
  UPGRADES,
  MARKETING_CHANNELS,
  DELIVERY_PLATFORMS,
  VIRTUAL_BRANDS,
  ECONOMIC_CONDITIONS,
} from '../constants';

// Process a single location's weekly calculations
export const processLocationWeek = (
  location: LocationState,
  cuisineId: string,
  economicRevenueMultiplier: number = 1,
  economicCostMultiplier: number = 1
): LocationState => {
  const cuisine = CUISINES.find(c => c.id === cuisineId) || CUISINES[0];
  const locationType = LOCATION_TYPES.find(t => t.id === location.locationType);

  // Calculate modifiers
  const equipCapacityMod = (location.equipment || []).reduce(
    (sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.effect?.capacity || 0),
    0
  );
  const upgradeCapacityMod = (location.upgrades || []).reduce(
    (sum, u) => sum + (UPGRADES.find(up => up.id === u)?.effect?.capacity || 0),
    0
  );
  const marketingReachMod = (location.marketing?.channels || []).reduce(
    (sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.effect?.reach || 0),
    0
  );

  const locationStaff = location.staff || [];
  const staffQualityMod = locationStaff.length > 0
    ? locationStaff.reduce((sum, s) => sum + s.skill, 0) / locationStaff.length / 20
    : 0;
  const moraleMod = (location.morale - 50) / 200;
  const managerBonus = location.manager ? location.manager.skill * 0.02 : 0;

  // Covers calculation
  let weekCovers = location.isGhostKitchen ? 0 : Math.floor(location.covers * (locationType?.trafficMod || 1));
  weekCovers = Math.floor(weekCovers * (1 + equipCapacityMod + upgradeCapacityMod + marketingReachMod + staffQualityMod + managerBonus));
  weekCovers = Math.floor(weekCovers * (1 + location.reputation / 200));
  weekCovers = Math.floor(weekCovers * (1 + moraleMod));
  weekCovers = Math.floor(weekCovers * (0.85 + Math.random() * 0.3));

  // Revenue calculation with proper customer type variable naming
  let totalSpend = 0;
  for (let i = 0; i < weekCovers; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let customerType = CUSTOMER_TYPES[0];
    for (const ct of CUSTOMER_TYPES) {
      cumulative += ct.frequency;
      if (rand <= cumulative) {
        customerType = ct;
        break;
      }
    }
    totalSpend += location.avgTicket * customerType.spendMod * (0.9 + Math.random() * 0.2);
  }

  const dineInRevenue = totalSpend;

  // Delivery revenue
  const deliveryPlatforms = location.delivery?.platforms || [];
  const deliveryOrders = deliveryPlatforms.length > 0
    ? Math.floor((location.isGhostKitchen ? 80 : weekCovers * 0.25) * deliveryPlatforms.length / 3)
    : 0;
  const avgCommission = deliveryPlatforms.length > 0
    ? deliveryPlatforms.reduce(
        (sum, p) => sum + (DELIVERY_PLATFORMS.find(dp => dp.id === p)?.commission || 0.25),
        0
      ) / deliveryPlatforms.length
    : 0;
  const deliveryRevenue = deliveryOrders * location.avgTicket * (1 - avgCommission);

  // Virtual brand revenue
  const virtualBrandRevenue = (location.virtualBrands || []).reduce((sum, vb) => {
    const brand = VIRTUAL_BRANDS.find(v => v.id === vb);
    if (!brand) return sum;
    const orders = Math.floor(15 + Math.random() * 20);
    return sum + orders * brand.avgTicket * 0.70;
  }, 0);

  // Bar revenue
  const barRevenue = (location.upgrades || []).includes('bar')
    ? weekCovers * 8 * (0.3 + Math.random() * 0.4)
    : 0;

  const baseRevenue = dineInRevenue + deliveryRevenue + virtualBrandRevenue + barRevenue;
  const totalRevenue = baseRevenue * economicRevenueMultiplier;

  // Costs
  const foodCost = totalRevenue * location.foodCostPct * economicCostMultiplier;
  const laborCost = (location.staff || []).reduce((sum, s) => sum + s.wage * 40, 0);
  const rent = location.rent;
  const utilities = Math.floor(rent * 0.15);
  const marketingCost = (location.marketing?.channels || []).reduce(
    (sum, c) => sum + (MARKETING_CHANNELS.find(mc => mc.id === c)?.costPerWeek || 0),
    0
  );
  const equipmentMaint = (location.equipment || []).reduce(
    (sum, e) => sum + (EQUIPMENT.find(eq => eq.id === e)?.maintenance || 0),
    0
  ) / 4;
  const ccFees = totalRevenue * 0.025;

  const totalCosts = foodCost + laborCost + rent + utilities + marketingCost + equipmentMaint + ccFees;
  const weekProfit = totalRevenue - totalCosts;

  // Update staff
  const updatedStaff = (location.staff || []).map(s => {
    let newMorale = s.morale;
    if (weekProfit > 0) newMorale += 2;
    if (weekProfit < -1000) newMorale -= 5;
    newMorale = Math.max(20, Math.min(100, newMorale + (Math.random() - 0.5) * 5));
    const skillGain = s.weeks > 0 && s.weeks % 8 === 0 && s.skill < 10 ? 0.5 : 0;
    return {
      ...s,
      weeks: s.weeks + 1,
      morale: Math.round(newMorale),
      skill: Math.min(10, s.skill + skillGain),
    };
  }).filter(s => !(s.morale < 30 && Math.random() < 0.3)); // Staff quits

  const avgMorale = updatedStaff.length > 0
    ? updatedStaff.reduce((sum, s) => sum + s.morale, 0) / updatedStaff.length
    : 50;

  // Update history
  const newHistory = [
    ...location.weeklyHistory,
    {
      week: location.weeksOpen + 1,
      revenue: totalRevenue,
      profit: weekProfit,
      covers: weekCovers + deliveryOrders,
    },
  ].slice(-52);

  return {
    ...location,
    cash: location.cash + weekProfit,
    totalRevenue: location.totalRevenue + totalRevenue,
    totalProfit: location.totalProfit + weekProfit,
    lastWeekRevenue: totalRevenue,
    lastWeekProfit: weekProfit,
    lastWeekCovers: weekCovers + deliveryOrders,
    lastWeekFoodCost: foodCost,
    lastWeekLaborCost: laborCost,
    staff: updatedStaff,
    morale: Math.round(avgMorale),
    weeksOpen: location.weeksOpen + 1,
    weeklyHistory: newHistory,
    reputation: Math.min(100, Math.max(0, location.reputation + (weekProfit > 0 ? 1 : -1))),
    delivery: {
      ...(location.delivery || {}),
      orders: (location.delivery?.orders || 0) + deliveryOrders,
    },
  };
};

// Get economic multipliers for current condition
export const getEconomicMultipliers = (
  economicCondition: string
): { revenue: number; cost: number } => {
  const condition = ECONOMIC_CONDITIONS.find(e => e.id === economicCondition) || ECONOMIC_CONDITIONS[1];
  return {
    revenue: condition.revenueMultiplier,
    cost: condition.costMultiplier,
  };
};

// Custom hook for game auto-advance
export const useGameAutoAdvance = (
  gameSpeed: string,
  processWeek: () => void,
  isPaused: boolean
) => {
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }

    // Set up new interval if not paused
    if (gameSpeed !== 'pause' && !isPaused) {
      const speeds: Record<string, number> = {
        slow: 3000,
        normal: 1500,
        fast: 750,
        ultra: 300,
      };
      const interval = speeds[gameSpeed] || 1500;
      autoAdvanceRef.current = setInterval(processWeek, interval);
    }

    // Cleanup on unmount
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, [gameSpeed, processWeek, isPaused]);

  return autoAdvanceRef;
};

// Calculate empire valuation
export const calculateEmpireValuation = (
  game: GameState,
  cuisineId: string
): number => {
  let total = 0;

  // Owned locations
  if (game.locations) {
    game.locations.forEach(loc => {
      const annualRevenue = (loc.totalRevenue / Math.max(1, loc.weeksOpen)) * 52;
      const revenueMult = loc.reputation > 80 ? 3 : loc.reputation > 60 ? 2.5 : 2;
      const equipmentValue = (loc.equipment?.length || 0) * 3000;
      const upgradeValue = (loc.upgrades || []).reduce(
        (sum, u) => sum + (UPGRADES.find(up => up.id === u)?.cost || 0) * 0.5,
        0
      );
      total += Math.round(annualRevenue * revenueMult + equipmentValue + upgradeValue);
      total += loc.cash;
    });
  }

  // Franchise value (royalty stream)
  if (game.franchises) {
    game.franchises.forEach(f => {
      const annualRoyalty = f.weeklyRoyalty * 52;
      total += annualRoyalty * 5; // 5x royalty multiple
    });
  }

  // Brand value multiplier based on total units
  const totalUnits = (game.locations?.length || 0) + (game.franchises?.length || 0);
  const brandMultiplier = totalUnits > 20 ? 1.5 : totalUnits > 10 ? 1.3 : totalUnits > 5 ? 1.15 : 1;

  return Math.round(total * brandMultiplier);
};
