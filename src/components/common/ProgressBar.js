// ============================================
// PROGRESS BAR COMPONENT
// ============================================
// Animated progress bar with color thresholds

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ProgressBar = memo(function ProgressBar({
  value = 0, // 0-100
  label,
  showValue = true,
  height = 8,
  color,
  backgroundColor = '#333333',
  thresholds, // { low: 30, medium: 60 }
  style,
  animated = true,
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: Math.min(100, Math.max(0, value)),
        speed: 8,
        bounciness: 4,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(value);
    }
  }, [value, animated]);

  const getColor = () => {
    if (color) return color;
    if (thresholds) {
      if (value < thresholds.low) return '#DC2626'; // Red
      if (value < thresholds.medium) return '#F97316'; // Orange
      return '#10B981'; // Green
    }
    return '#F59E0B'; // Default amber
  };

  const displayColor = getColor();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showValue && <Text style={[styles.value, { color: displayColor }]}>{Math.round(value)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: displayColor,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
          accessible={true}
          accessibilityLabel={label ? `${label}: ${Math.round(value)} percent` : `${Math.round(value)} percent`}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: value, min: 0, max: 100 }}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});

export { ProgressBar };
