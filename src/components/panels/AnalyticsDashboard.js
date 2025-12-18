// ============================================
// ANALYTICS DASHBOARD COMPONENT
// ============================================
// Comprehensive financial and operational analytics

import React, { memo, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { MiniChart } from '../common/MiniChart';
import { StatCard } from '../common/StatCard';
import { ProgressBar } from '../common/ProgressBar';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = memo(function AnalyticsDashboard({
  location,
  game,
  formatCurrency,
}) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!location) return null;

    const history = location.weeklyHistory || [];
    const recentWeeks = history.slice(-12);

    // Revenue metrics
    const totalRevenue = location.totalRevenue || 0;
    const avgWeeklyRevenue = recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.revenue || 0), 0) / recentWeeks.length
      : 0;
    const lastWeekRevenue = location.lastWeekRevenue || 0;
    const revenueGrowth = recentWeeks.length > 1
      ? ((recentWeeks[recentWeeks.length - 1]?.revenue || 0) - (recentWeeks[0]?.revenue || 0)) / Math.max(1, recentWeeks[0]?.revenue || 1) * 100
      : 0;

    // Profit metrics
    const totalProfit = location.totalProfit || 0;
    const avgWeeklyProfit = recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.profit || 0), 0) / recentWeeks.length
      : 0;
    const lastWeekProfit = location.lastWeekProfit || 0;
    const profitMargin = lastWeekRevenue > 0 ? (lastWeekProfit / lastWeekRevenue) * 100 : 0;

    // Customer metrics
    const totalCovers = recentWeeks.reduce((sum, w) => sum + (w.covers || 0), 0);
    const avgCoversPerWeek = recentWeeks.length > 0 ? totalCovers / recentWeeks.length : 0;
    const avgTicket = location.avgTicket || 0;

    // Staff metrics
    const staffCount = location.staff?.length || 0;
    const avgStaffSkill = staffCount > 0
      ? (location.staff || []).reduce((sum, s) => sum + (s.skill || 0), 0) / staffCount
      : 0;
    const avgStaffMorale = staffCount > 0
      ? (location.staff || []).reduce((sum, s) => sum + (s.morale || 0), 0) / staffCount
      : 0;
    const laborCostPerWeek = (location.staff || []).reduce((sum, s) => sum + (s.wage || 0) * 40, 0);
    const laborCostPct = lastWeekRevenue > 0 ? (laborCostPerWeek / lastWeekRevenue) * 100 : 0;

    // Operational metrics
    const foodCostPct = (location.foodCostPct || 0.30) * 100;
    const reputation = location.reputation || 50;
    const morale = location.morale || 50;

    // Equipment & upgrades
    const equipmentCount = location.equipment?.length || 0;
    const upgradesCount = location.upgrades?.length || 0;
    const marketingChannels = location.marketing?.channels?.length || 0;
    const deliveryPlatforms = location.delivery?.platforms?.length || 0;

    // Projections (annualized)
    const projectedAnnualRevenue = avgWeeklyRevenue * 52;
    const projectedAnnualProfit = avgWeeklyProfit * 52;

    // Breakeven analysis
    const fixedCosts = (location.rent || 0) + (location.rent || 0) * 0.15; // rent + utilities
    const variableCostPct = (location.foodCostPct || 0.30) + (laborCostPct / 100);
    const breakevenRevenue = variableCostPct < 1 ? fixedCosts / (1 - variableCostPct) : 0;

    return {
      // Revenue
      totalRevenue,
      avgWeeklyRevenue,
      lastWeekRevenue,
      revenueGrowth,
      revenueData: recentWeeks.map(w => w.revenue || 0),

      // Profit
      totalProfit,
      avgWeeklyProfit,
      lastWeekProfit,
      profitMargin,
      profitData: recentWeeks.map(w => w.profit || 0),

      // Customers
      totalCovers,
      avgCoversPerWeek,
      avgTicket,
      coversData: recentWeeks.map(w => w.covers || 0),

      // Staff
      staffCount,
      avgStaffSkill,
      avgStaffMorale,
      laborCostPerWeek,
      laborCostPct,

      // Operations
      foodCostPct,
      reputation,
      morale,
      equipmentCount,
      upgradesCount,
      marketingChannels,
      deliveryPlatforms,

      // Projections
      projectedAnnualRevenue,
      projectedAnnualProfit,
      breakevenRevenue,
    };
  }, [location]);

  if (!analytics) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overview Stats */}
      <Text style={styles.sectionTitle}>Financial Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon="💰"
          color="#10B981"
          style={styles.statCard}
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(analytics.totalProfit)}
          icon="📈"
          color={analytics.totalProfit >= 0 ? '#10B981' : '#DC2626'}
          style={styles.statCard}
        />
        <StatCard
          label="Profit Margin"
          value={`${analytics.profitMargin.toFixed(1)}%`}
          icon="📊"
          color={analytics.profitMargin >= 15 ? '#10B981' : analytics.profitMargin >= 5 ? '#F59E0B' : '#DC2626'}
          style={styles.statCard}
        />
        <StatCard
          label="Avg Weekly"
          value={formatCurrency(analytics.avgWeeklyRevenue)}
          icon="📅"
          trend={analytics.revenueGrowth > 0 ? 'up' : analytics.revenueGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(analytics.revenueGrowth).toFixed(1)}%`}
          style={styles.statCard}
        />
      </View>

      {/* Revenue Chart */}
      {analytics.revenueData.length > 1 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Revenue Trend (12 weeks)</Text>
          <MiniChart data={analytics.revenueData} color="#10B981" height={80} />
        </View>
      )}

      {/* Profit Chart */}
      {analytics.profitData.length > 1 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Profit Trend</Text>
          <MiniChart data={analytics.profitData} color="#3B82F6" height={80} />
        </View>
      )}

      {/* Customer Metrics */}
      <Text style={styles.sectionTitle}>Customer Metrics</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Avg Ticket"
          value={formatCurrency(analytics.avgTicket)}
          icon="🧾"
          style={styles.statCard}
        />
        <StatCard
          label="Weekly Covers"
          value={Math.round(analytics.avgCoversPerWeek).toLocaleString()}
          icon="👥"
          style={styles.statCard}
        />
      </View>

      {analytics.coversData.length > 1 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Customer Volume</Text>
          <MiniChart data={analytics.coversData} color="#8B5CF6" height={60} />
        </View>
      )}

      {/* Labor Analysis */}
      <Text style={styles.sectionTitle}>Labor Analysis</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Staff Count</Text>
          <Text style={styles.metricValue}>{analytics.staffCount} employees</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Weekly Labor Cost</Text>
          <Text style={styles.metricValue}>{formatCurrency(analytics.laborCostPerWeek)}</Text>
        </View>
        <ProgressBar
          label="Labor Cost %"
          value={analytics.laborCostPct}
          thresholds={{ low: 35, medium: 45 }}
          style={styles.progressBar}
        />
        <ProgressBar
          label="Avg Staff Skill"
          value={analytics.avgStaffSkill * 10}
          color="#8B5CF6"
          style={styles.progressBar}
        />
        <ProgressBar
          label="Staff Morale"
          value={analytics.avgStaffMorale}
          thresholds={{ low: 40, medium: 70 }}
          style={styles.progressBar}
        />
      </View>

      {/* Cost Structure */}
      <Text style={styles.sectionTitle}>Cost Structure</Text>
      <View style={styles.metricsContainer}>
        <ProgressBar
          label="Food Cost %"
          value={analytics.foodCostPct}
          thresholds={{ low: 35, medium: 40 }}
          style={styles.progressBar}
        />
        <ProgressBar
          label="Labor Cost %"
          value={analytics.laborCostPct}
          thresholds={{ low: 35, medium: 45 }}
          style={styles.progressBar}
        />
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Target Prime Cost</Text>
          <Text style={[
            styles.metricValue,
            { color: (analytics.foodCostPct + analytics.laborCostPct) <= 65 ? '#10B981' : '#DC2626' }
          ]}>
            {(analytics.foodCostPct + analytics.laborCostPct).toFixed(1)}% (target: ≤65%)
          </Text>
        </View>
      </View>

      {/* Projections */}
      <Text style={styles.sectionTitle}>Annual Projections</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Projected Revenue"
          value={formatCurrency(analytics.projectedAnnualRevenue)}
          icon="🎯"
          color="#3B82F6"
          style={styles.statCard}
        />
        <StatCard
          label="Projected Profit"
          value={formatCurrency(analytics.projectedAnnualProfit)}
          icon="💎"
          color={analytics.projectedAnnualProfit >= 0 ? '#10B981' : '#DC2626'}
          style={styles.statCard}
        />
      </View>

      {/* Operational Health */}
      <Text style={styles.sectionTitle}>Operational Health</Text>
      <View style={styles.metricsContainer}>
        <ProgressBar
          label="Reputation"
          value={analytics.reputation}
          thresholds={{ low: 40, medium: 70 }}
          style={styles.progressBar}
        />
        <ProgressBar
          label="Team Morale"
          value={analytics.morale}
          thresholds={{ low: 40, medium: 70 }}
          style={styles.progressBar}
        />
        <View style={styles.operationalStats}>
          <View style={styles.opStat}>
            <Text style={styles.opStatValue}>{analytics.equipmentCount}</Text>
            <Text style={styles.opStatLabel}>Equipment</Text>
          </View>
          <View style={styles.opStat}>
            <Text style={styles.opStatValue}>{analytics.upgradesCount}</Text>
            <Text style={styles.opStatLabel}>Upgrades</Text>
          </View>
          <View style={styles.opStat}>
            <Text style={styles.opStatValue}>{analytics.marketingChannels}</Text>
            <Text style={styles.opStatLabel}>Marketing</Text>
          </View>
          <View style={styles.opStat}>
            <Text style={styles.opStatValue}>{analytics.deliveryPlatforms}</Text>
            <Text style={styles.opStatLabel}>Delivery</Text>
          </View>
        </View>
      </View>

      {/* Breakeven Analysis */}
      <Text style={styles.sectionTitle}>Breakeven Analysis</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Weekly Breakeven Revenue</Text>
          <Text style={styles.metricValue}>{formatCurrency(analytics.breakevenRevenue)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Current vs Breakeven</Text>
          <Text style={[
            styles.metricValue,
            { color: analytics.lastWeekRevenue >= analytics.breakevenRevenue ? '#10B981' : '#DC2626' }
          ]}>
            {analytics.breakevenRevenue > 0
              ? `${((analytics.lastWeekRevenue / analytics.breakevenRevenue) * 100).toFixed(0)}%`
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#737373',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 2 - 4,
  },
  chartSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  chartTitle: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  metricsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#A3A3A3',
    fontSize: 13,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    marginVertical: 4,
  },
  operationalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  opStat: {
    alignItems: 'center',
  },
  opStatValue: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '700',
  },
  opStatLabel: {
    color: '#737373',
    fontSize: 10,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});

export { AnalyticsDashboard };
