// ============================================
// STAT CARD COMPONENT
// ============================================
// Animated stat display with trend indicator

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  trend, // 'up', 'down', 'neutral'
  trendValue,
  color = '#F59E0B',
  size = 'medium', // 'small', 'medium', 'large'
  style,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sizeStyles = {
    small: { padding: 8 },
    medium: { padding: 12 },
    large: { padding: 16 },
  };

  const textSizes = {
    small: { label: 10, value: 16, icon: 16 },
    medium: { label: 11, value: 20, icon: 20 },
    large: { label: 12, value: 28, icon: 28 },
  };

  const trendColors = {
    up: '#10B981',
    down: '#DC2626',
    neutral: '#737373',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        sizeStyles[size],
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        style,
      ]}
      accessible={true}
      accessibilityLabel={`${label}: ${value}${trendValue ? `, ${trend} ${trendValue}` : ''}`}
      accessibilityRole="text"
    >
      <View style={styles.header}>
        {icon && <Text style={[styles.icon, { fontSize: textSizes[size].icon }]}>{icon}</Text>}
        <Text style={[styles.label, { fontSize: textSizes[size].label }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { fontSize: textSizes[size].value, color }]}>{value}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendIcon, { color: trendColors[trend] }]}>
            {trendIcons[trend]}
          </Text>
          <Text style={[styles.trendValue, { color: trendColors[trend] }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    color: '#A3A3A3',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  trendIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export { StatCard };
