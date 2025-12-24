// ============================================
// ACHIEVEMENT NOTIFICATION COMPONENT
// ============================================

import React, { useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../../constants';
import { playSound, triggerHaptic } from '../../services/soundManager';

// Achievement data
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

// Rarity colors
const rarityColors = {
  common: colors.textSecondary,
  rare: colors.info,
  epic: colors.purple,
  legendary: '#FFD700',
};

const rarityLabels = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

/**
 * Achievement unlock notification with animation
 */
export const AchievementNotification = memo<AchievementNotificationProps>(({
  achievement,
  visible,
  onDismiss,
  duration = 5000,
  position = 'top',
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;

  // Show animation
  const showNotification = useCallback(() => {
    // Play sound and haptic
    playSound('achievement');
    triggerHaptic('success');

    // Reset animations
    slideAnim.setValue(position === 'top' ? -200 : 200);
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);
    glowAnim.setValue(0);

    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation for legendary/epic
    if (achievement?.rarity === 'legendary' || achievement?.rarity === 'epic') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Icon bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1400),
      ]),
      { iterations: 2 }
    ).start();
  }, [position, slideAnim, scaleAnim, opacityAnim, glowAnim, iconBounceAnim, achievement?.rarity]);

  // Hide animation
  const hideNotification = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -200 : 200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [position, slideAnim, opacityAnim, onDismiss]);

  // Handle visibility changes
  useEffect(() => {
    if (visible && achievement) {
      showNotification();

      // Auto-dismiss
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement, duration, showNotification, hideNotification]);

  if (!achievement) return null;

  const rarity = achievement.rarity || 'common';
  const rarityColor = rarityColors[rarity];

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Glow effect for rare achievements */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: rarityColor, opacity: glowOpacity },
          ]}
        />
      )}

      <TouchableOpacity
        style={[styles.notification, { borderColor: rarityColor }]}
        onPress={hideNotification}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconBounceAnim }] }]}>
          <Text style={styles.icon}>{achievement.icon}</Text>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.unlocked}>ACHIEVEMENT UNLOCKED</Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>{rarityLabels[rarity]}</Text>
            </View>
          </View>
          <Text style={styles.name}>{achievement.name}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// ACHIEVEMENT TOAST (simpler version)
// ============================================

interface AchievementToastProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
}

export const AchievementToast = memo<AchievementToastProps>(({
  achievement,
  visible,
  onDismiss,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      playSound('achievement');
      triggerHaptic('success');

      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }
  }, [visible, opacity, onDismiss]);

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.toastIcon}>{achievement.icon}</Text>
      <View style={styles.toastContent}>
        <Text style={styles.toastLabel}>Achievement Unlocked!</Text>
        <Text style={styles.toastName}>{achievement.name}</Text>
      </View>
    </Animated.View>
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  positionTop: {
    top: 60,
  },
  positionBottom: {
    bottom: 100,
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 20,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unlocked: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rarityBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    color: colors.background,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 18,
  },

  // Toast styles
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    zIndex: 9999,
  },
  toastIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toastName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AchievementNotification;
