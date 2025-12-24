// ============================================
// SOUND EFFECTS AND HAPTICS MANAGER
// ============================================

import { Platform } from 'react-native';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'notification'
  | 'cash_register'
  | 'level_up'
  | 'achievement'
  | 'week_advance'
  | 'game_over'
  | 'victory';

// Haptic feedback types
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

// Sound configuration
interface SoundConfig {
  enabled: boolean;
  volume: number;
  hapticEnabled: boolean;
}

// Audio context for web
let audioContext: AudioContext | null = null;

// Sound cache for web
const soundCache: Map<SoundEffect, AudioBuffer> = new Map();

// Default configuration
let config: SoundConfig = {
  enabled: true,
  volume: 0.5,
  hapticEnabled: true,
};

/**
 * Initialize audio context (call on user interaction)
 */
export const initAudio = async (): Promise<void> => {
  if (Platform.OS === 'web' && !audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }
};

/**
 * Configure sound settings
 */
export const configureSounds = (newConfig: Partial<SoundConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Get current sound configuration
 */
export const getSoundConfig = (): SoundConfig => ({ ...config });

/**
 * Generate simple beep/tone for web
 */
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = config.volume
): void => {
  if (!audioContext || !config.enabled) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('Error playing tone:', e);
  }
};

/**
 * Sound effect definitions (frequency-based for web)
 */
const soundDefinitions: Record<SoundEffect, () => void> = {
  click: () => playTone(800, 0.05, 'sine', 0.3),
  success: () => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.15), 200);
  },
  error: () => {
    playTone(200, 0.15, 'sawtooth', 0.4);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.3), 150);
  },
  notification: () => {
    playTone(880, 0.08);
    setTimeout(() => playTone(1100, 0.08), 80);
  },
  cash_register: () => {
    playTone(1200, 0.05);
    setTimeout(() => playTone(1400, 0.05), 50);
    setTimeout(() => playTone(1600, 0.1), 100);
  },
  level_up: () => {
    playTone(440, 0.1);
    setTimeout(() => playTone(554, 0.1), 100);
    setTimeout(() => playTone(659, 0.1), 200);
    setTimeout(() => playTone(880, 0.2), 300);
  },
  achievement: () => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.1), 200);
    setTimeout(() => playTone(1047, 0.3), 300);
  },
  week_advance: () => playTone(600, 0.08, 'triangle', 0.2),
  game_over: () => {
    playTone(440, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(349, 0.3, 'sawtooth', 0.25), 300);
    setTimeout(() => playTone(294, 0.5, 'sawtooth', 0.2), 600);
  },
  victory: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15), i * 100);
    });
  },
};

/**
 * Play a sound effect
 */
export const playSound = (effect: SoundEffect): void => {
  if (!config.enabled) return;

  if (Platform.OS === 'web') {
    soundDefinitions[effect]?.();
  } else {
    // For native, we would use expo-av or react-native-sound
    // This is a placeholder for native implementation
    console.log(`Playing sound: ${effect}`);
  }
};

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (type: HapticType = 'medium'): Promise<void> => {
  if (!config.hapticEnabled) return;

  if (Platform.OS === 'web') {
    // Use Vibration API on web if available
    if ('vibrate' in navigator) {
      const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 30],
        warning: [30, 20, 30],
        error: [50, 30, 50],
        selection: 5,
      };
      navigator.vibrate(patterns[type]);
    }
  } else {
    // For native, use expo-haptics
    try {
      const Haptics = await import('expo-haptics');
      const hapticStyles: Record<HapticType, unknown> = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
        selection: 'selection',
      };

      const style = hapticStyles[type];
      if (type === 'selection') {
        await Haptics.selectionAsync();
      } else if (['success', 'warning', 'error'].includes(type)) {
        await Haptics.notificationAsync(style as unknown as Haptics.NotificationFeedbackType);
      } else {
        await Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle);
      }
    } catch (e) {
      // Haptics not available
    }
  }
};

/**
 * Combined sound and haptic feedback
 */
export const feedback = (
  sound: SoundEffect | null,
  haptic: HapticType | null = 'light'
): void => {
  if (sound) playSound(sound);
  if (haptic) triggerHaptic(haptic);
};

/**
 * Preload sounds (for native implementation with actual audio files)
 */
export const preloadSounds = async (): Promise<void> => {
  // Placeholder for preloading actual audio files
  await initAudio();
};

/**
 * Clean up audio resources
 */
export const cleanup = (): void => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  soundCache.clear();
};

export default {
  initAudio,
  configureSounds,
  getSoundConfig,
  playSound,
  triggerHaptic,
  feedback,
  preloadSounds,
  cleanup,
};
