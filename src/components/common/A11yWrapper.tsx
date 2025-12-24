// ============================================
// ACCESSIBILITY WRAPPER COMPONENTS
// ============================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  AccessibilityInfo,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Props for accessible button
interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  role?: 'button' | 'link' | 'tab' | 'menuitem';
  children?: React.ReactNode;
  testID?: string;
}

// Accessible button with proper ARIA labels
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  label,
  hint,
  disabled = false,
  style,
  textStyle,
  role = 'button',
  children,
  testID,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={role}
      accessibilityState={{ disabled }}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      testID={testID}
    >
      {children || <Text style={[styles.buttonText, textStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
};

// Props for accessible text
interface AccessibleTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  role?: 'header' | 'text' | 'alert' | 'summary';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  testID?: string;
}

// Accessible text with proper role
export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  style,
  role = 'text',
  level,
  testID,
}) => {
  const accessibilityRole = role === 'header' ? 'header' : 'text';

  return (
    <Text
      accessible={true}
      accessibilityRole={accessibilityRole}
      // @ts-ignore - accessibilityLevel is valid on some platforms
      accessibilityLevel={level}
      style={style}
      testID={testID}
    >
      {children}
    </Text>
  );
};

// Props for accessible container
interface AccessibleContainerProps {
  children: React.ReactNode;
  label: string;
  style?: ViewStyle;
  testID?: string;
}

// Accessible container/region
export const AccessibleContainer: React.FC<AccessibleContainerProps> = ({
  children,
  label,
  style,
  testID,
}) => {
  return (
    <View
      accessible={false}
      accessibilityLabel={label}
      accessibilityRole="none"
      style={style}
      testID={testID}
    >
      {children}
    </View>
  );
};

// Props for live region (announces changes)
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
  style?: ViewStyle;
  testID?: string;
}

// Live region for dynamic content announcements
export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  style,
  testID,
}) => {
  return (
    <View
      accessible={true}
      accessibilityLiveRegion={politeness}
      style={style}
      testID={testID}
    >
      {children}
    </View>
  );
};

// Props for skip link
interface SkipLinkProps {
  targetId: string;
  label?: string;
}

// Skip link for keyboard navigation (mainly for web)
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Skip to main content',
}) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={styles.skipLink}
      onPress={() => {
        // For web, we'd focus on the target element
        const element = document.getElementById(targetId);
        if (element) {
          element.focus();
        }
      }}
    >
      <Text style={styles.skipLinkText}>{label}</Text>
    </TouchableOpacity>
  );
};

// Props for focus trap (for modals)
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

// Focus trap for modal accessibility
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
}) => {
  // React Native handles focus trapping differently than web
  // This is a placeholder for platform-specific implementations
  return (
    <View
      accessible={false}
      importantForAccessibility={active ? 'yes' : 'no'}
    >
      {children}
    </View>
  );
};

// Announce message to screen readers
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return AccessibilityInfo.isScreenReaderEnabled();
};

// Props for stat value (for game stats)
interface AccessibleStatProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  style?: ViewStyle;
}

// Accessible stat display
export const AccessibleStat: React.FC<AccessibleStatProps> = ({
  label,
  value,
  icon,
  trend,
  style,
}) => {
  const trendText = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : '';
  const accessibilityLabel = `${label}: ${value}${trendText ? `, ${trendText}` : ''}`;

  return (
    <View
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      style={[styles.stat, style]}
    >
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
};

// Props for progress indicator
interface AccessibleProgressProps {
  label: string;
  value: number;
  max?: number;
  style?: ViewStyle;
}

// Accessible progress bar
export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  label,
  value,
  max = 100,
  style,
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <View
      accessible={true}
      accessibilityLabel={`${label}: ${percentage}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.progressContainer, style]}
    >
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressValue}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  skipLink: {
    position: 'absolute',
    left: -9999,
    top: 0,
    zIndex: 9999,
    backgroundColor: '#000',
    padding: 12,
  },
  skipLinkText: {
    color: '#fff',
    fontSize: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  progressContainer: {
    padding: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default {
  AccessibleButton,
  AccessibleText,
  AccessibleContainer,
  LiveRegion,
  SkipLink,
  FocusTrap,
  AccessibleStat,
  AccessibleProgress,
  announceForAccessibility,
  isScreenReaderEnabled,
};
