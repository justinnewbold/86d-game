// ============================================
// PLATFORM UTILITIES
// ============================================
// Cross-platform detection and utilities

import { Platform, Dimensions } from 'react-native';
import Constants from 'expo-constants';

/**
 * Check if running on web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Check if running on iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Check if running on native (iOS or Android)
 */
export const isNative = isIOS || isAndroid;

/**
 * Get current platform name
 */
export const platformName = Platform.OS;

/**
 * Get device type info
 */
export function getDeviceInfo() {
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;

  return {
    platform: Platform.OS,
    version: Platform.Version,
    isTablet,
    isLandscape,
    width,
    height,
    expoVersion: Constants.expoVersion,
    appVersion: Constants.expoConfig?.version || '1.0.0',
  };
}

/**
 * Execute platform-specific code
 * @param {object} options - { web: fn, ios: fn, android: fn, native: fn, default: fn }
 */
export function platformSelect(options) {
  if (isWeb && options.web) return options.web();
  if (isIOS && options.ios) return options.ios();
  if (isAndroid && options.android) return options.android();
  if (isNative && options.native) return options.native();
  if (options.default) return options.default();
  return null;
}

/**
 * Reload the application (platform-specific)
 */
export async function reloadApp() {
  if (isWeb) {
    window.location.reload();
  } else {
    try {
      const Updates = await import('expo-updates');
      await Updates.reloadAsync();
    } catch (error) {
      // Fallback: Just log error - can't truly reload native without updates
      console.error('Could not reload app:', error);
    }
  }
}

/**
 * Open external URL
 */
export async function openURL(url) {
  if (isWeb) {
    window.open(url, '_blank');
  } else {
    const { Linking } = await import('react-native');
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Could not open URL:', error);
    }
  }
}

/**
 * Get safe area insets (returns defaults for web)
 */
export function getSafeAreaInsets() {
  // On web, return reasonable defaults
  if (isWeb) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  // On native, these would come from react-native-safe-area-context
  // For now, return conservative estimates
  return {
    top: isIOS ? 44 : 24,
    bottom: isIOS ? 34 : 0,
    left: 0,
    right: 0,
  };
}

/**
 * Check if device supports haptics
 */
export function supportsHaptics() {
  return isNative; // Web doesn't support haptics yet
}

/**
 * Get storage key prefix for the platform
 */
export function getStoragePrefix() {
  return `@86d_${Platform.OS}_`;
}

export default {
  isWeb,
  isIOS,
  isAndroid,
  isNative,
  platformName,
  getDeviceInfo,
  platformSelect,
  reloadApp,
  openURL,
  getSafeAreaInsets,
  supportsHaptics,
  getStoragePrefix,
};
