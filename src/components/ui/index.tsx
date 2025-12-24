// ============================================
// SHARED UI COMPONENTS
// ============================================

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../constants';

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
}

export const PrimaryButton = memo<ButtonProps>(({
  onPress,
  disabled = false,
  style,
  textStyle,
  children,
}) => (
  <TouchableOpacity
    style={[styles.primaryButton, disabled && styles.buttonDisabled, style]}
    onPress={onPress}
    disabled={disabled}
    accessible={true}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
  >
    <Text style={[styles.primaryButtonText, disabled && styles.buttonTextDisabled, textStyle]}>
      {children}
    </Text>
  </TouchableOpacity>
));

export const SecondaryButton = memo<ButtonProps>(({
  onPress,
  disabled = false,
  style,
  textStyle,
  children,
}) => (
  <TouchableOpacity
    style={[styles.secondaryButton, disabled && styles.buttonDisabled, style]}
    onPress={onPress}
    disabled={disabled}
    accessible={true}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
  >
    <Text style={[styles.secondaryButtonText, disabled && styles.buttonTextDisabled, textStyle]}>
      {children}
    </Text>
  </TouchableOpacity>
));

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const SelectableCard = memo<CardProps>(({
  selected = false,
  onPress,
  style,
  children,
}) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected, style]}
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    {children}
  </TouchableOpacity>
));

// ============================================
// INPUT COMPONENT
// ============================================

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoFocus?: boolean;
}

export const Input = memo<InputProps>(({
  value,
  onChangeText,
  placeholder,
  style,
  keyboardType = 'default',
  autoFocus = false,
}) => (
  <TextInput
    style={[styles.input, style]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={colors.textMuted}
    keyboardType={keyboardType}
    autoFocus={autoFocus}
    accessible={true}
    accessibilityLabel={placeholder}
  />
));

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  style?: ViewStyle;
}

export const ProgressBar = memo<ProgressBarProps>(({
  progress,
  color = colors.primary,
  style,
}) => (
  <View style={[styles.progressBarContainer, style]}>
    <View
      style={[
        styles.progressBarFill,
        { width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color },
      ]}
    />
  </View>
));

// ============================================
// STAT ROW
// ============================================

interface StatRowProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export const StatRow = memo<StatRowProps>(({
  label,
  value,
  valueColor = colors.textPrimary,
}) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
  </View>
));

// ============================================
// DIVIDER
// ============================================

interface DividerProps {
  color?: string;
  style?: ViewStyle;
}

export const Divider = memo<DividerProps>(({
  color = colors.border,
  style,
}) => (
  <View style={[styles.divider, { backgroundColor: color }, style]} />
));

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  text: string;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
}

export const Badge = memo<BadgeProps>(({
  text,
  color = colors.primary,
  textColor = '#fff',
  style,
}) => (
  <View style={[styles.badge, { backgroundColor: color }, style]}>
    <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
  </View>
));

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },

  // Card styles
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },

  // Input styles
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Progress bar
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },

  // Badge
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default {
  PrimaryButton,
  SecondaryButton,
  SelectableCard,
  Input,
  ProgressBar,
  StatRow,
  Divider,
  Badge,
};
