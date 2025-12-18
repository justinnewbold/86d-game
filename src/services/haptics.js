// ============================================
// HAPTICS SERVICE
// ============================================
// Cross-platform haptic feedback using expo-haptics

import { Platform } from 'react-native';

// Haptic types
export const HapticType = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SELECTION: 'selection',
};

class HapticsService {
  constructor() {
    this.enabled = true;
    this.Haptics = null;
    this.initialized = false;
    this.available = Platform.OS !== 'web';
  }

  async initialize() {
    if (this.initialized || !this.available) return;

    try {
      this.Haptics = await import('expo-haptics');
      this.initialized = true;
    } catch (error) {
      console.log('Haptics not available:', error.message);
      this.available = false;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  async trigger(type = HapticType.LIGHT) {
    if (!this.enabled || !this.available) return;

    try {
      await this.initialize();

      if (!this.Haptics) return;

      switch (type) {
        case HapticType.LIGHT:
          await this.Haptics.impactAsync(this.Haptics.ImpactFeedbackStyle.Light);
          break;

        case HapticType.MEDIUM:
          await this.Haptics.impactAsync(this.Haptics.ImpactFeedbackStyle.Medium);
          break;

        case HapticType.HEAVY:
          await this.Haptics.impactAsync(this.Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case HapticType.SUCCESS:
          await this.Haptics.notificationAsync(this.Haptics.NotificationFeedbackType.Success);
          break;

        case HapticType.WARNING:
          await this.Haptics.notificationAsync(this.Haptics.NotificationFeedbackType.Warning);
          break;

        case HapticType.ERROR:
          await this.Haptics.notificationAsync(this.Haptics.NotificationFeedbackType.Error);
          break;

        case HapticType.SELECTION:
          await this.Haptics.selectionAsync();
          break;

        default:
          await this.Haptics.impactAsync(this.Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail - haptics are optional
    }
  }

  // Convenience methods
  async light() {
    await this.trigger(HapticType.LIGHT);
  }

  async medium() {
    await this.trigger(HapticType.MEDIUM);
  }

  async heavy() {
    await this.trigger(HapticType.HEAVY);
  }

  async success() {
    await this.trigger(HapticType.SUCCESS);
  }

  async warning() {
    await this.trigger(HapticType.WARNING);
  }

  async error() {
    await this.trigger(HapticType.ERROR);
  }

  async selection() {
    await this.trigger(HapticType.SELECTION);
  }
}

// Singleton instance
const hapticsService = new HapticsService();

// Convenience exports
export const triggerHaptic = (type) => hapticsService.trigger(type);
export const setHapticsEnabled = (enabled) => hapticsService.setEnabled(enabled);

// Named exports for specific haptic types
export const hapticLight = () => hapticsService.light();
export const hapticMedium = () => hapticsService.medium();
export const hapticHeavy = () => hapticsService.heavy();
export const hapticSuccess = () => hapticsService.success();
export const hapticWarning = () => hapticsService.warning();
export const hapticError = () => hapticsService.error();
export const hapticSelection = () => hapticsService.selection();

export default hapticsService;
