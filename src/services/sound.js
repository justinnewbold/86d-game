// ============================================
// SOUND SERVICE
// ============================================
// Audio playback for game sounds and music
// Note: Sound files are optional - the game works without them

// Sound assets can be added later to assets/sounds/
// Expected files: tap.mp3, success.mp3, error.mp3, notification.mp3,
//                 cash-register.mp3, week-advance.mp3, hire.mp3, fire.mp3,
//                 level-up.mp3, milestone.mp3, background-music.mp3

class SoundService {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.volume = 0.7;
    this.initialized = false;
    this.audioAvailable = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Dynamically import expo-av to handle cases where it's not available
      const { Audio } = await import('expo-av');
      this.Audio = Audio;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.audioAvailable = true;
      this.initialized = true;
    } catch (error) {
      // Audio not available (probably running on web without audio support)
      console.log('Audio not available:', error.message);
      this.audioAvailable = false;
      this.initialized = true;
    }
  }

  async loadSound(name) {
    if (!this.audioAvailable || !this.Audio) return null;
    if (this.sounds[name]) return this.sounds[name];

    // Sound loading is disabled until assets are added
    // When assets are added, uncomment this block:
    /*
    try {
      const soundAssets = {
        tap: require('../../assets/sounds/tap.mp3'),
        success: require('../../assets/sounds/success.mp3'),
        error: require('../../assets/sounds/error.mp3'),
        notification: require('../../assets/sounds/notification.mp3'),
        cashRegister: require('../../assets/sounds/cash-register.mp3'),
        weekAdvance: require('../../assets/sounds/week-advance.mp3'),
        hire: require('../../assets/sounds/hire.mp3'),
        fire: require('../../assets/sounds/fire.mp3'),
        levelUp: require('../../assets/sounds/level-up.mp3'),
        milestone: require('../../assets/sounds/milestone.mp3'),
      };

      const source = soundAssets[name];
      if (!source) return null;

      const { sound } = await this.Audio.Sound.createAsync(source, {
        volume: this.volume,
      });

      this.sounds[name] = sound;
      return sound;
    } catch (error) {
      console.log(`Sound ${name} not loaded:`, error.message);
      return null;
    }
    */

    return null;
  }

  async play(name) {
    if (!this.soundEnabled || !this.audioAvailable) return;

    try {
      await this.initialize();

      let sound = this.sounds[name];

      if (!sound) {
        sound = await this.loadSound(name);
      }

      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      // Silently fail - sounds are optional
    }
  }

  async playMusic() {
    if (!this.musicEnabled || !this.audioAvailable) return;

    // Music playback disabled until assets are added
    /*
    try {
      await this.initialize();

      if (!this.music && this.Audio) {
        const source = require('../../assets/sounds/background-music.mp3');

        const { sound } = await this.Audio.Sound.createAsync(source, {
          volume: this.volume * 0.5,
          isLooping: true,
        });

        this.music = sound;
      }

      if (this.music) {
        await this.music.playAsync();
      }
    } catch (error) {
      console.log('Background music not available');
    }
    */
  }

  async stopMusic() {
    if (this.music) {
      try {
        await this.music.stopAsync();
      } catch (error) {
        // Ignore
      }
    }
  }

  async pauseMusic() {
    if (this.music) {
      try {
        await this.music.pauseAsync();
      } catch (error) {
        // Ignore
      }
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    Object.values(this.sounds).forEach(sound => {
      try {
        sound.setVolumeAsync(this.volume);
      } catch (error) {
        // Ignore
      }
    });

    if (this.music) {
      try {
        this.music.setVolumeAsync(this.volume * 0.5);
      } catch (error) {
        // Ignore
      }
    }
  }

  async cleanup() {
    // Unload all sounds
    for (const sound of Object.values(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore
      }
    }

    if (this.music) {
      try {
        await this.music.unloadAsync();
      } catch (error) {
        // Ignore
      }
    }

    this.sounds = {};
    this.music = null;
    this.initialized = false;
  }
}

// Singleton instance
const soundService = new SoundService();

// Convenience functions
export const playSound = (name) => soundService.play(name);
export const playMusic = () => soundService.playMusic();
export const stopMusic = () => soundService.stopMusic();
export const pauseMusic = () => soundService.pauseMusic();
export const setSoundEnabled = (enabled) => soundService.setSoundEnabled(enabled);
export const setMusicEnabled = (enabled) => soundService.setMusicEnabled(enabled);
export const setVolume = (volume) => soundService.setVolume(volume);
export const cleanupSound = () => soundService.cleanup();

export default soundService;
