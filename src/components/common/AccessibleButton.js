// ============================================
// ACCESSIBLE BUTTON COMPONENT
// ============================================
// TouchableOpacity with proper accessibility attributes

import React, { memo, useCallback, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';

const AccessibleButton = memo(function AccessibleButton({
  onPress,
  label,
  hint,
  style,
  textStyle,
  children,
  disabled = false,
  icon,
  role = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  testID,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const variantStyles = {
    primary: { backgroundColor: '#F59E0B', borderWidth: 0 },
    secondary: { backgroundColor: '#252525', borderWidth: 1, borderColor: '#333333' },
    danger: { backgroundColor: '#DC2626', borderWidth: 0 },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
    medium: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44 },
    large: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 52 },
  };

  const textSizes = {
    small: { fontSize: 12 },
    medium: { fontSize: 14 },
    large: { fontSize: 16 },
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRole={role}
        accessibilityState={{ disabled: disabled || loading }}
        testID={testID}
        style={[
          styles.button,
          variantStyles[variant],
          sizeStyles[size],
          disabled && styles.disabled,
          style,
        ]}
      >
        {children || (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text
              style={[
                styles.text,
                textSizes[size],
                variant === 'ghost' && styles.ghostText,
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {loading ? 'Loading...' : label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  ghostText: {
    color: '#F59E0B',
  },
  icon: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#737373',
  },
});

export { AccessibleButton };
