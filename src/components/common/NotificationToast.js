// ============================================
// NOTIFICATION TOAST COMPONENT
// ============================================
// Animated notification popup with auto-dismiss

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

const NotificationToast = memo(function NotificationToast({
  notifications = [],
  onDismiss,
}) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
});

const ToastItem = memo(function ToastItem({ notification, onDismiss }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.(notification.id);
      });
    }, 3800);

    return () => clearTimeout(timer);
  }, [notification.id]);

  const typeStyles = {
    success: { backgroundColor: '#10B981', icon: '✓' },
    error: { backgroundColor: '#DC2626', icon: '✕' },
    warning: { backgroundColor: '#F97316', icon: '!' },
    info: { backgroundColor: '#3B82F6', icon: 'i' },
  };

  const config = typeStyles[notification.type] || typeStyles.info;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: config.backgroundColor },
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={() => onDismiss?.(notification.id)}
        accessible={true}
        accessibilityLabel={`${notification.type}: ${notification.message}. Tap to dismiss.`}
        accessibilityRole="alert"
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    gap: 8,
  },
  toast: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export { NotificationToast };
