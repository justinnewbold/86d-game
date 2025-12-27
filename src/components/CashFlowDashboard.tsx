// ============================================
// CASH FLOW DASHBOARD
// ============================================
// Educational UI that shows the difference between profit and cash
// This is THE key lesson for restaurant owners

import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { Location, GameState, CashFlowAlert } from '../types/game';
import type { WeeklyCashFlow } from '../systems/CashFlowEngine';
import { INDUSTRY_BENCHMARKS } from '../systems/RealisticFinancials';

interface CashFlowDashboardProps {
  location: Location;
  game: GameState;
  colors: {
    background: string;
    surface: string;
    surfaceLight: string;
    primary: string;
    accent: string;
    success: string;
    warning: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
  };
}

/**
 * Format currency for display
 */
const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
};

/**
 * Format percentage
 */
const formatPct = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * The Key Insight Card - Profit vs Cash
 */
const ProfitVsCashCard = memo<{
  accountingProfit: number;
  cashFlow: number;
  colors: CashFlowDashboardProps['colors'];
}>(({ accountingProfit, cashFlow, colors }) => {
  const difference = accountingProfit - cashFlow;
  const isDangerous = accountingProfit > 0 && cashFlow < 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        💡 The Key Lesson: Profit ≠ Cash
      </Text>

      <View style={styles.comparisonRow}>
        <View style={styles.comparisonItem}>
          <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
            Accounting Profit
          </Text>
          <Text style={[
            styles.comparisonValue,
            { color: accountingProfit >= 0 ? colors.success : colors.accent }
          ]}>
            {formatCurrency(accountingProfit)}
          </Text>
          <Text style={[styles.comparisonNote, { color: colors.textMuted }]}>
            What the P&L says
          </Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={[styles.vsText, { color: colors.textMuted }]}>vs</Text>
        </View>

        <View style={styles.comparisonItem}>
          <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
            Actual Cash Flow
          </Text>
          <Text style={[
            styles.comparisonValue,
            { color: cashFlow >= 0 ? colors.success : colors.accent }
          ]}>
            {formatCurrency(cashFlow)}
          </Text>
          <Text style={[styles.comparisonNote, { color: colors.textMuted }]}>
            What hit your bank
          </Text>
        </View>
      </View>

      {isDangerous && (
        <View style={[styles.dangerBox, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.dangerText, { color: colors.accent }]}>
            ⚠️ PROFITABLE BUT CASH NEGATIVE
          </Text>
          <Text style={[styles.dangerExplain, { color: colors.textSecondary }]}>
            This is the #1 reason restaurants fail. Your books show profit, but your
            bank account is shrinking. This happens when you pay bills before customers pay you.
          </Text>
        </View>
      )}

      {Math.abs(difference) > 100 && !isDangerous && (
        <Text style={[styles.differenceNote, { color: colors.textSecondary }]}>
          {difference > 0
            ? `You recorded ${formatCurrency(difference)} in profit that isn't in the bank yet (outstanding invoices, delayed payments).`
            : `You spent ${formatCurrency(Math.abs(difference))} more than your profit shows (paying off past bills, stocking inventory).`
          }
        </Text>
      )}
    </View>
  );
});

/**
 * Runway Indicator - How long can you survive?
 */
const RunwayCard = memo<{
  weeksOfRunway: number;
  cashOnHand: number;
  weeklyBurn: number;
  colors: CashFlowDashboardProps['colors'];
}>(({ weeksOfRunway, cashOnHand, weeklyBurn, colors }) => {
  const getRunwayColor = () => {
    if (weeksOfRunway < 2) return colors.accent;
    if (weeksOfRunway < 4) return colors.warning;
    if (weeksOfRunway < 8) return '#F59E0B';
    return colors.success;
  };

  const getRunwayStatus = () => {
    if (weeksOfRunway < 2) return 'CRITICAL';
    if (weeksOfRunway < 4) return 'DANGER';
    if (weeksOfRunway < 8) return 'CAUTION';
    return 'HEALTHY';
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        🛤️ Runway (How Long Until Broke?)
      </Text>

      <View style={styles.runwayContainer}>
        <Text style={[styles.runwayNumber, { color: getRunwayColor() }]}>
          {weeksOfRunway}
        </Text>
        <Text style={[styles.runwayUnit, { color: colors.textSecondary }]}>
          weeks
        </Text>
        <View style={[styles.runwayBadge, { backgroundColor: getRunwayColor() }]}>
          <Text style={styles.runwayBadgeText}>{getRunwayStatus()}</Text>
        </View>
      </View>

      <View style={styles.runwayDetails}>
        <View style={styles.runwayDetailRow}>
          <Text style={[styles.runwayDetailLabel, { color: colors.textSecondary }]}>
            Cash on Hand
          </Text>
          <Text style={[styles.runwayDetailValue, { color: colors.textPrimary }]}>
            {formatCurrency(cashOnHand)}
          </Text>
        </View>
        <View style={styles.runwayDetailRow}>
          <Text style={[styles.runwayDetailLabel, { color: colors.textSecondary }]}>
            Weekly Burn Rate
          </Text>
          <Text style={[styles.runwayDetailValue, { color: colors.accent }]}>
            -{formatCurrency(Math.abs(weeklyBurn))}
          </Text>
        </View>
      </View>

      <Text style={[styles.runwayAdvice, { color: colors.textMuted }]}>
        {weeksOfRunway < 4
          ? "💡 Industry wisdom: Maintain 4-6 weeks of expenses in reserve at minimum."
          : weeksOfRunway < 8
          ? "💡 You're okay for now, but consider building to 8+ weeks of reserves."
          : "💡 Great cash position! This gives you flexibility for opportunities or emergencies."
        }
      </Text>
    </View>
  );
});

/**
 * Prime Cost Card - The most important metric
 */
const PrimeCostCard = memo<{
  foodCost: number;
  laborCost: number;
  revenue: number;
  colors: CashFlowDashboardProps['colors'];
}>(({ foodCost, laborCost, revenue, colors }) => {
  const primeCost = foodCost + laborCost;
  const primeCostPct = revenue > 0 ? primeCost / revenue : 0;

  const foodCostPct = revenue > 0 ? foodCost / revenue : 0;
  const laborCostPct = revenue > 0 ? laborCost / revenue : 0;

  const getPrimeCostColor = () => {
    if (primeCostPct > INDUSTRY_BENCHMARKS.primeCost.danger) return colors.accent;
    if (primeCostPct > INDUSTRY_BENCHMARKS.primeCost.acceptable) return colors.warning;
    return colors.success;
  };

  const getPrimeCostStatus = () => {
    if (primeCostPct > INDUSTRY_BENCHMARKS.primeCost.danger) return 'LOSING MONEY';
    if (primeCostPct > INDUSTRY_BENCHMARKS.primeCost.acceptable) return 'THIN MARGINS';
    if (primeCostPct <= INDUSTRY_BENCHMARKS.primeCost.target) return 'EXCELLENT';
    return 'GOOD';
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        🎯 Prime Cost (Food + Labor)
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
        THE most important metric in restaurants
      </Text>

      <View style={styles.primeCostContainer}>
        <Text style={[styles.primeCostNumber, { color: getPrimeCostColor() }]}>
          {formatPct(primeCostPct)}
        </Text>
        <View style={[styles.primeCostBadge, { backgroundColor: getPrimeCostColor() }]}>
          <Text style={styles.primeCostBadgeText}>{getPrimeCostStatus()}</Text>
        </View>
      </View>

      {/* Visual breakdown bar */}
      <View style={styles.costBreakdownBar}>
        <View style={[
          styles.costSegment,
          {
            flex: foodCostPct,
            backgroundColor: '#F59E0B',
          }
        ]} />
        <View style={[
          styles.costSegment,
          {
            flex: laborCostPct,
            backgroundColor: '#3B82F6',
          }
        ]} />
        <View style={[
          styles.costSegment,
          {
            flex: Math.max(0, 1 - foodCostPct - laborCostPct),
            backgroundColor: colors.success,
          }
        ]} />
      </View>

      <View style={styles.costLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Food {formatPct(foodCostPct)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Labor {formatPct(laborCostPct)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Other + Profit
          </Text>
        </View>
      </View>

      <Text style={[styles.primeCostAdvice, { color: colors.textMuted }]}>
        💡 Target: Under 60%. Every 1% over 60% comes directly from your profit.
        {primeCostPct > 0.65 &&
          " You need to cut costs or raise prices immediately."
        }
      </Text>
    </View>
  );
});

/**
 * Alerts Card
 */
const AlertsCard = memo<{
  alerts: CashFlowAlert[];
  colors: CashFlowDashboardProps['colors'];
}>(({ alerts, colors }) => {
  if (alerts.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        🚨 Alerts & Warnings
      </Text>

      {alerts.map((alert, index) => (
        <View
          key={index}
          style={[
            styles.alertItem,
            {
              backgroundColor: alert.severity === 'critical'
                ? colors.accent + '20'
                : alert.severity === 'warning'
                ? colors.warning + '20'
                : colors.primary + '20',
            }
          ]}
        >
          <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>
            {alert.message}
          </Text>
          <Text style={[styles.alertConsequence, { color: colors.textSecondary }]}>
            {alert.consequence}
          </Text>
        </View>
      ))}
    </View>
  );
});

/**
 * Main Dashboard Component
 */
export const CashFlowDashboard = memo<CashFlowDashboardProps>(({
  location,
  game,
  colors,
}) => {
  const cashFlow = location.cashFlow;
  const pl = location.lastWeekPL;
  const lastWeekCashFlow = cashFlow?.cashFlowHistory?.[cashFlow.cashFlowHistory.length - 1];

  // Calculate weekly burn rate
  const weeklyBurn = cashFlow?.cashFlowHistory && cashFlow.cashFlowHistory.length > 0
    ? cashFlow.cashFlowHistory.slice(-4).reduce((sum, w) => sum + w.totalCashOut, 0) / 4
    : location.rent + (location.staff || []).reduce((s, st) => s + st.wage * 40, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        📊 Cash Flow Dashboard
      </Text>
      <Text style={[styles.subheader, { color: colors.textSecondary }]}>
        Understanding cash flow is the #1 skill for restaurant survival
      </Text>

      {/* The Key Insight */}
      <ProfitVsCashCard
        accountingProfit={pl?.netProfit || location.lastWeekProfit || 0}
        cashFlow={lastWeekCashFlow?.netCashFlow || location.lastWeekProfit || 0}
        colors={colors}
      />

      {/* Runway */}
      <RunwayCard
        weeksOfRunway={cashFlow?.weeksOfRunway || 12}
        cashOnHand={cashFlow?.cashOnHand || location.cash}
        weeklyBurn={weeklyBurn}
        colors={colors}
      />

      {/* Prime Cost */}
      {pl && (
        <PrimeCostCard
          foodCost={pl.cogs.total}
          laborCost={pl.labor.total}
          revenue={pl.revenue.total}
          colors={colors}
        />
      )}

      {/* Alerts */}
      <AlertsCard
        alerts={game.cashFlowAlerts || []}
        colors={colors}
      />

      {/* Educational Footer */}
      <View style={[styles.eduFooter, { backgroundColor: colors.surfaceLight }]}>
        <Text style={[styles.eduFooterTitle, { color: colors.primary }]}>
          📚 Why This Matters
        </Text>
        <Text style={[styles.eduFooterText, { color: colors.textSecondary }]}>
          60% of restaurants fail within 5 years. The #1 cause isn't bad food—it's
          running out of cash. Many "profitable" restaurants close because they didn't
          understand the difference between accounting profit and cash in the bank.
        </Text>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 15,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  comparisonNote: {
    fontSize: 10,
    marginTop: 3,
  },
  vsContainer: {
    paddingHorizontal: 15,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  dangerExplain: {
    fontSize: 12,
    lineHeight: 18,
  },
  differenceNote: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  runwayContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  runwayNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  runwayUnit: {
    fontSize: 14,
    marginTop: -5,
  },
  runwayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  runwayBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  runwayDetails: {
    marginTop: 10,
  },
  runwayDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  runwayDetailLabel: {
    fontSize: 13,
  },
  runwayDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  runwayAdvice: {
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
  },
  primeCostContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  primeCostNumber: {
    fontSize: 42,
    fontWeight: '700',
  },
  primeCostBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  primeCostBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  costBreakdownBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
  },
  costSegment: {
    height: '100%',
  },
  costLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
  },
  primeCostAdvice: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertConsequence: {
    fontSize: 11,
  },
  eduFooter: {
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  eduFooterTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  eduFooterText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default CashFlowDashboard;
