// ============================================
// GAME PERSISTENCE HOOK
// ============================================
// Auto-saves game state and allows recovery from crashes
// Uses AsyncStorage for React Native compatibility

import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, SetupState } from '../types/game';

const STORAGE_KEYS = {
  AUTO_SAVE: '@86d_autosave',
  SAVE_SLOTS: '@86d_saves',
  SETTINGS: '@86d_settings',
  TUTORIAL_COMPLETED: '@86d_tutorial_done',
};

const AUTO_SAVE_INTERVAL = 60000; // 1 minute

export interface SavedGame {
  id: string;
  name: string;
  setup: SetupState;
  game: GameState;
  savedAt: string;
  week: number;
  cash: number;
  locations: number;
}

export interface GamePersistenceState {
  isLoading: boolean;
  hasSavedGame: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
}

/**
 * Hook for managing game persistence with auto-save
 */
export function useGamePersistence(
  setup: SetupState | null,
  game: GameState | null,
  isGameActive: boolean
) {
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<string | null>(null);

  /**
   * Save game to a specific slot
   */
  const saveGame = useCallback(async (
    slotId: string,
    name?: string
  ): Promise<boolean> => {
    if (!setup || !game) return false;

    try {
      const savedGame: SavedGame = {
        id: slotId,
        name: name || `${setup.name} - Week ${game.week}`,
        setup,
        game,
        savedAt: new Date().toISOString(),
        week: game.week,
        cash: game.locations.reduce((sum, loc) => sum + (loc.cash || 0), 0) + (game.corporateCash || 0),
        locations: game.locations.length,
      };

      // Get existing saves
      const existingSavesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
      const existingSaves: SavedGame[] = existingSavesJson
        ? JSON.parse(existingSavesJson)
        : [];

      // Update or add save
      const saveIndex = existingSaves.findIndex(s => s.id === slotId);
      if (saveIndex >= 0) {
        existingSaves[saveIndex] = savedGame;
      } else {
        existingSaves.push(savedGame);
      }

      // Keep max 10 saves
      const trimmedSaves = existingSaves.slice(-10);

      await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(trimmedSaves));
      lastSaveRef.current = savedGame.savedAt;

      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [setup, game]);

  /**
   * Auto-save current game state
   */
  const autoSave = useCallback(async (): Promise<boolean> => {
    if (!setup || !game) return false;

    try {
      const autoSaveData: SavedGame = {
        id: 'autosave',
        name: 'Auto-Save',
        setup,
        game,
        savedAt: new Date().toISOString(),
        week: game.week,
        cash: game.locations.reduce((sum, loc) => sum + (loc.cash || 0), 0) + (game.corporateCash || 0),
        locations: game.locations.length,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(autoSaveData));
      lastSaveRef.current = autoSaveData.savedAt;

      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }, [setup, game]);

  /**
   * Load game from a slot
   */
  const loadGame = useCallback(async (
    slotId: string
  ): Promise<{ setup: SetupState; game: GameState } | null> => {
    try {
      if (slotId === 'autosave') {
        const autoSaveJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
        if (autoSaveJson) {
          const savedGame: SavedGame = JSON.parse(autoSaveJson);
          return { setup: savedGame.setup, game: savedGame.game };
        }
        return null;
      }

      const savesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
      if (!savesJson) return null;

      const saves: SavedGame[] = JSON.parse(savesJson);
      const save = saves.find(s => s.id === slotId);

      if (save) {
        return { setup: save.setup, game: save.game };
      }

      return null;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }, []);

  /**
   * Get all saved games
   */
  const getSavedGames = useCallback(async (): Promise<SavedGame[]> => {
    try {
      const saves: SavedGame[] = [];

      // Check for auto-save
      const autoSaveJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
      if (autoSaveJson) {
        saves.push(JSON.parse(autoSaveJson));
      }

      // Get manual saves
      const manualSavesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
      if (manualSavesJson) {
        const manualSaves: SavedGame[] = JSON.parse(manualSavesJson);
        saves.push(...manualSaves);
      }

      // Sort by saved date, newest first
      return saves.sort((a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get saved games:', error);
      return [];
    }
  }, []);

  /**
   * Delete a saved game
   */
  const deleteSave = useCallback(async (slotId: string): Promise<boolean> => {
    try {
      if (slotId === 'autosave') {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTO_SAVE);
        return true;
      }

      const savesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
      if (!savesJson) return false;

      const saves: SavedGame[] = JSON.parse(savesJson);
      const filteredSaves = saves.filter(s => s.id !== slotId);

      await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(filteredSaves));
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }, []);

  /**
   * Check if there's a recoverable auto-save
   */
  const checkForRecovery = useCallback(async (): Promise<SavedGame | null> => {
    try {
      const autoSaveJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
      if (autoSaveJson) {
        return JSON.parse(autoSaveJson);
      }
      return null;
    } catch (error) {
      console.error('Failed to check for recovery:', error);
      return null;
    }
  }, []);

  /**
   * Tutorial completion tracking
   */
  const markTutorialComplete = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    } catch (error) {
      console.error('Failed to mark tutorial complete:', error);
    }
  }, []);

  const isTutorialComplete = useCallback(async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
      return completed === 'true';
    } catch (error) {
      return false;
    }
  }, []);

  // Set up auto-save interval when game is active
  useEffect(() => {
    if (isGameActive && setup && game) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      // Start auto-save timer
      autoSaveTimerRef.current = setInterval(() => {
        autoSave();
      }, AUTO_SAVE_INTERVAL);

      // Initial auto-save
      autoSave();
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [isGameActive, setup, game, autoSave]);

  // Auto-save on significant changes (every 5 weeks)
  useEffect(() => {
    if (game && game.week % 5 === 0) {
      autoSave();
    }
  }, [game?.week, autoSave]);

  return {
    saveGame,
    loadGame,
    autoSave,
    getSavedGames,
    deleteSave,
    checkForRecovery,
    markTutorialComplete,
    isTutorialComplete,
    lastSaved: lastSaveRef.current,
  };
}

export default useGamePersistence;
