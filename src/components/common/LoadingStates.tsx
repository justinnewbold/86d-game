// ============================================
// LOADING STATES AND SKELETON COMPONENTS
// ============================================

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants';

// ============================================
// SKELETON SHIMMER ANIMATION
// ============================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = memo<SkeletonProps>(({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
});

// ============================================
// SKELETON CARD
// ============================================

export const SkeletonCard = memo(() => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCardHeader}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.skeletonCardHeaderText}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
    <Skeleton width="100%" height={60} style={{ marginTop: 16 }} />
    <View style={styles.skeletonCardFooter}>
      <Skeleton width={60} height={24} />
      <Skeleton width={60} height={24} />
      <Skeleton width={60} height={24} />
    </View>
  </View>
));

// ============================================
// SKELETON STAT ROW
// ============================================

export const SkeletonStatRow = memo(() => (
  <View style={styles.skeletonStatRow}>
    <Skeleton width={100} height={14} />
    <Skeleton width={60} height={14} />
  </View>
));

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
}

export const SkeletonList = memo<SkeletonListProps>(({
  count = 5,
  itemHeight = 60,
}) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={[styles.skeletonListItem, { height: itemHeight }]}>
        <Skeleton width={40} height={40} borderRadius={8} />
        <View style={styles.skeletonListItemContent}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
));

// ============================================
// LOADING SPINNER
// ============================================

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({
  size = 'large',
  color = colors.primary,
  message,
}) => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size={size} color={color} />
    {message && <Text style={styles.spinnerMessage}>{message}</Text>}
  </View>
));

// ============================================
// FULL SCREEN LOADING
// ============================================

interface FullScreenLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export const FullScreenLoading = memo<FullScreenLoadingProps>(({
  message = 'Loading...',
  showLogo = true,
}) => (
  <View style={styles.fullScreenLoading}>
    {showLogo && <Text style={styles.loadingLogo}>86'd</Text>}
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingMessage}>{message}</Text>
  </View>
));

// ============================================
// SKELETON DASHBOARD
// ============================================

export const SkeletonDashboard = memo(() => (
  <View style={styles.skeletonDashboard}>
    {/* Header */}
    <View style={styles.skeletonHeader}>
      <Skeleton width={150} height={24} />
      <Skeleton width={80} height={32} />
    </View>

    {/* Stats Grid */}
    <View style={styles.skeletonStatsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonStatCard}>
          <Skeleton width={40} height={40} borderRadius={8} />
          <Skeleton width="80%" height={24} style={{ marginTop: 12 }} />
          <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>

    {/* Chart placeholder */}
    <View style={styles.skeletonChartCard}>
      <Skeleton width={120} height={20} />
      <Skeleton width="100%" height={150} style={{ marginTop: 16 }} borderRadius={8} />
    </View>

    {/* Action buttons */}
    <View style={styles.skeletonActions}>
      <Skeleton width="48%" height={48} borderRadius={8} />
      <Skeleton width="48%" height={48} borderRadius={8} />
    </View>
  </View>
));

// ============================================
// AI RESPONSE LOADING
// ============================================

export const AIResponseLoading = memo(() => {
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animate(dotAnim1, 0);
    const anim2 = animate(dotAnim2, 150);
    const anim3 = animate(dotAnim3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dotAnim1, dotAnim2, dotAnim3]);

  const getScale = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
  });

  return (
    <View style={styles.aiLoadingContainer}>
      <Text style={styles.aiLoadingIcon}>👨‍🍳</Text>
      <View style={styles.aiLoadingDots}>
        <Animated.View style={[styles.aiLoadingDot, getScale(dotAnim1)]} />
        <Animated.View style={[styles.aiLoadingDot, getScale(dotAnim2)]} />
        <Animated.View style={[styles.aiLoadingDot, getScale(dotAnim3)]} />
      </View>
      <Text style={styles.aiLoadingText}>Chef Marcus is thinking...</Text>
    </View>
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skeletonStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skeletonListItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinnerMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  fullScreenLoading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 24,
  },
  loadingMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  skeletonDashboard: {
    flex: 1,
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  skeletonStatCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  skeletonChartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiLoadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  aiLoadingIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  aiLoadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  aiLoadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  aiLoadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default {
  Skeleton,
  SkeletonCard,
  SkeletonStatRow,
  SkeletonList,
  LoadingSpinner,
  FullScreenLoading,
  SkeletonDashboard,
  AIResponseLoading,
};
