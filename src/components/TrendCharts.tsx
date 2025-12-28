// ============================================
// TREND CHARTS COMPONENT
// ============================================
// Visual representation of key financial trends
// Educational: Shows patterns that indicate success or danger

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { Location, GameState } from '../types/game';
import type { WeeklyCashFlow } from '../systems/CashFlowEngine';

interface TrendChartsProps {
  location: Location;
  game: GameState;
  colors: {
    background: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    danger: string;
    warning: string;
    accent: string;
  };
}

interface ChartDataPoint {
  value: number;
  label: string;
}

/**
 * Simple bar chart using native components
 */
const SimpleBarChart: React.FC<{
  data: ChartDataPoint[];
  title: string;
  colors: TrendChartsProps['colors'];
  formatValue?: (value: number) => string;
  showTrendLine?: boolean;
}> = ({ data, title, colors, formatValue = (v) => `$${v.toLocaleString()}`, showTrendLine }) => {
  if (data.length === 0) {
    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.noData, { color: colors.textSecondary }]}>
          No data yet - process more weeks
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue;

  // Calculate trend (simple linear regression)
  const n = data.length;
  const sumX = data.reduce((sum, _, i) => sum + i, 0);
  const sumY = data.reduce((sum, d) => sum + d.value, 0);
  const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
  const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  const trendDirection = slope > 100 ? 'up' : slope < -100 ? 'down' : 'stable';

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{title}</Text>
        {showTrendLine && (
          <View style={styles.trendIndicator}>
            <Text style={[
              styles.trendText,
              {
                color: trendDirection === 'up' ? colors.success :
                       trendDirection === 'down' ? colors.danger :
                       colors.textSecondary
              }
            ]}>
              {trendDirection === 'up' ? '📈 Trending Up' :
               trendDirection === 'down' ? '📉 Trending Down' :
               '➡️ Stable'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {formatValue(maxValue)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {formatValue((maxValue + minValue) / 2)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>
            {formatValue(minValue)}
          </Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.slice(-12).map((point, index) => {
            const height = range > 0 ? (Math.abs(point.value - minValue) / range) * 100 : 50;
            const isNegative = point.value < 0;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                        backgroundColor: isNegative ? colors.danger : colors.success,
                        opacity: 0.7 + (index / data.length) * 0.3,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Latest</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatValue(data[data.length - 1]?.value || 0)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatValue(sumY / n)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatValue(maxValue)}
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Cash runway visualization
 */
const RunwayGauge: React.FC<{
  weeksOfRunway: number;
  colors: TrendChartsProps['colors'];
}> = ({ weeksOfRunway, colors }) => {
  const maxWeeks = 52;
  const percentage = Math.min((weeksOfRunway / maxWeeks) * 100, 100);
  const isHealthy = weeksOfRunway >= 12;
  const isWarning = weeksOfRunway >= 4 && weeksOfRunway < 12;
  const isCritical = weeksOfRunway < 4;

  const gaugeColor = isHealthy ? colors.success :
                     isWarning ? colors.warning :
                     colors.danger;

  return (
    <View style={[styles.gaugeContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
        💰 Cash Runway
      </Text>

      <View style={styles.gaugeTrack}>
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${percentage}%`,
              backgroundColor: gaugeColor,
            },
          ]}
        />
      </View>

      <View style={styles.gaugeLabels}>
        <Text style={[styles.gaugeValue, { color: gaugeColor }]}>
          {weeksOfRunway} weeks
        </Text>
        <Text style={[styles.gaugeMessage, { color: colors.textSecondary }]}>
          {isHealthy ? '✅ Healthy reserves' :
           isWarning ? '⚠️ Build more reserves' :
           '🚨 Critical - take action!'}
        </Text>
      </View>

      {/* Educational markers */}
      <View style={styles.gaugeMarkers}>
        <View style={[styles.marker, { left: '7.7%' }]}>
          <View style={[styles.markerLine, { backgroundColor: colors.danger }]} />
          <Text style={[styles.markerLabel, { color: colors.textSecondary }]}>4w</Text>
        </View>
        <View style={[styles.marker, { left: '23%' }]}>
          <View style={[styles.markerLine, { backgroundColor: colors.warning }]} />
          <Text style={[styles.markerLabel, { color: colors.textSecondary }]}>12w</Text>
        </View>
        <View style={[styles.marker, { left: '50%' }]}>
          <View style={[styles.markerLine, { backgroundColor: colors.success }]} />
          <Text style={[styles.markerLabel, { color: colors.textSecondary }]}>26w</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Prime cost trend visualization
 */
const PrimeCostTrend: React.FC<{
  history: Array<{ week: number; primeCostPct: number }>;
  colors: TrendChartsProps['colors'];
}> = ({ history, colors }) => {
  const target = 0.60;
  const danger = 0.70;

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
        📊 Prime Cost Trend (Food + Labor)
      </Text>

      {history.length === 0 ? (
        <Text style={[styles.noData, { color: colors.textSecondary }]}>
          No data yet
        </Text>
      ) : (
        <>
          <View style={styles.primeCostBars}>
            {history.slice(-12).map((week, index) => {
              const pct = week.primeCostPct * 100;
              const isAboveDanger = week.primeCostPct > danger;
              const isAboveTarget = week.primeCostPct > target;

              return (
                <View key={index} style={styles.primeCostBar}>
                  <View style={styles.primeCostColumn}>
                    <View
                      style={[
                        styles.primeCostFill,
                        {
                          height: `${Math.min(pct, 100)}%`,
                          backgroundColor: isAboveDanger ? colors.danger :
                                          isAboveTarget ? colors.warning :
                                          colors.success,
                        },
                      ]}
                    />
                    {/* Target line */}
                    <View
                      style={[
                        styles.targetLine,
                        { bottom: `${target * 100}%`, backgroundColor: colors.accent }
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    W{week.week}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Under 60% (Good)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                60-70% (Warning)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Over 70% (Critical)
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

/**
 * Main Trend Charts Component
 */
const TrendCharts: React.FC<TrendChartsProps> = ({ location, game, colors }) => {
  // Prepare revenue data
  const revenueData: ChartDataPoint[] = (location.weeklyHistory || []).map(week => ({
    value: week.revenue,
    label: `W${week.week}`,
  }));

  // Prepare profit data
  const profitData: ChartDataPoint[] = (location.weeklyHistory || []).map(week => ({
    value: week.profit,
    label: `W${week.week}`,
  }));

  // Prepare cash flow data
  const cashFlowData: ChartDataPoint[] = (location.cashFlow?.cashFlowHistory || []).map(week => ({
    value: week.netCashFlow,
    label: `W${week.week}`,
  }));

  // Prepare prime cost data
  const primeCostData = (location.weeklyHistory || []).map((week, idx) => {
    const pl = location.lastWeekPL;
    return {
      week: week.week,
      primeCostPct: pl?.primeCostPercentage || 0.55,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        📈 Performance Trends
      </Text>
      <Text style={[styles.subheader, { color: colors.textSecondary }]}>
        Track your restaurant's key metrics over time
      </Text>

      {/* Cash Runway Gauge */}
      <RunwayGauge
        weeksOfRunway={location.cashFlow?.weeksOfRunway || 12}
        colors={colors}
      />

      {/* Revenue Chart */}
      <SimpleBarChart
        data={revenueData}
        title="💵 Weekly Revenue"
        colors={colors}
        showTrendLine
      />

      {/* Profit Chart */}
      <SimpleBarChart
        data={profitData}
        title="📊 Weekly Profit"
        colors={colors}
        showTrendLine
      />

      {/* Cash Flow Chart */}
      <SimpleBarChart
        data={cashFlowData}
        title="💰 Net Cash Flow"
        colors={colors}
        formatValue={(v) => `${v >= 0 ? '+' : ''}$${v.toLocaleString()}`}
        showTrendLine
      />

      {/* Prime Cost Trend */}
      <PrimeCostTrend
        history={primeCostData}
        colors={colors}
      />

      {/* Educational Footer */}
      <View style={[styles.educationalFooter, { backgroundColor: colors.card }]}>
        <Text style={[styles.footerTitle, { color: colors.textPrimary }]}>
          📚 Reading These Charts
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Revenue</Text>: Should grow steadily. Flat is okay, declining needs action.
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Profit</Text>: More important than revenue. Negative weeks happen, but the trend should be positive.
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Cash Flow</Text>: Can differ from profit! Profitable but cash-negative is the #1 killer.
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Prime Cost</Text>: Food + Labor should stay under 60%. This is the most important metric.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noData: {
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  chartArea: {
    flexDirection: 'row',
    height: 120,
    marginBottom: 12,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barColumn: {
    width: '70%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  gaugeContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gaugeTrack: {
    height: 24,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 12,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gaugeMessage: {
    fontSize: 12,
  },
  gaugeMarkers: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerLine: {
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  markerLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  primeCostBars: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'flex-end',
    marginVertical: 12,
  },
  primeCostBar: {
    flex: 1,
    alignItems: 'center',
  },
  primeCostColumn: {
    width: '70%',
    height: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  primeCostFill: {
    width: '100%',
    borderRadius: 4,
  },
  targetLine: {
    position: 'absolute',
    left: -4,
    right: -4,
    height: 2,
    borderRadius: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
  },
  educationalFooter: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default TrendCharts;
