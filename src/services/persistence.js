// ============================================
// DATA PERSISTENCE SERVICE
// ============================================
// Handles save/load game functionality with auto-save

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SAVES: '@86d_game_saves',
  SETTINGS: '@86d_game_settings',
  AUTOSAVE: '@86d_game_autosave',
  STATISTICS: '@86d_game_statistics',
};

const MAX_SAVE_SLOTS = 5;
const AUTOSAVE_INTERVAL = 5; // Auto-save every 5 game weeks

/**
 * Save game to a specific slot
 * @param {number} slot - Slot number (1-5)
 * @param {object} gameState - Current game state
 * @param {object} setupState - Game setup state
 * @returns {Promise<boolean>}
 */
export async function saveGame(slot, gameState, setupState) {
  try {
    const saves = await getSaveSlots();

    const saveData = {
      id: slot,
      timestamp: Date.now(),
      version: '2.0.0',
      game: gameState,
      setup: setupState,
      meta: {
        week: gameState.week,
        totalCash: (gameState.locations || []).reduce((sum, l) => sum + (l.cash || 0), 0) + (gameState.corporateCash || 0),
        locationsCount: gameState.locations?.length || 0,
        restaurantName: setupState.name,
        cuisine: setupState.cuisine,
      },
    };

    saves[slot - 1] = saveData;

    await AsyncStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(saves));

    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

/**
 * Load game from a specific slot
 * @param {number} slot - Slot number (1-5)
 * @returns {Promise<object|null>}
 */
export async function loadGame(slot) {
  try {
    const saves = await getSaveSlots();
    const saveData = saves[slot - 1];

    if (!saveData) {
      return null;
    }

    // Validate save data
    if (!saveData.game || !saveData.setup) {
      console.warn('Invalid save data structure');
      return null;
    }

    return saveData;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

/**
 * Delete a save slot
 * @param {number} slot - Slot number (1-5)
 * @returns {Promise<boolean>}
 */
export async function deleteSave(slot) {
  try {
    const saves = await getSaveSlots();
    saves[slot - 1] = null;

    await AsyncStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(saves));

    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

/**
 * Get all save slots
 * @returns {Promise<Array>}
 */
export async function getSaveSlots() {
  try {
    const savesJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVES);

    if (!savesJson) {
      return Array(MAX_SAVE_SLOTS).fill(null);
    }

    const saves = JSON.parse(savesJson);

    // Ensure we always have 5 slots
    while (saves.length < MAX_SAVE_SLOTS) {
      saves.push(null);
    }

    return saves;
  } catch (error) {
    console.error('Failed to get save slots:', error);
    return Array(MAX_SAVE_SLOTS).fill(null);
  }
}

/**
 * Auto-save game if enough weeks have passed
 * @param {object} gameState - Current game state
 * @param {object} setupState - Game setup state
 * @returns {Promise<boolean>}
 */
export async function autoSave(gameState, setupState) {
  try {
    const lastAutosaveJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTOSAVE);
    const lastAutosave = lastAutosaveJson ? JSON.parse(lastAutosaveJson) : null;

    const shouldAutosave = !lastAutosave ||
      (gameState.week - (lastAutosave.week || 0)) >= AUTOSAVE_INTERVAL;

    if (!shouldAutosave) {
      return false;
    }

    const autosaveData = {
      timestamp: Date.now(),
      week: gameState.week,
      game: gameState,
      setup: setupState,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.AUTOSAVE, JSON.stringify(autosaveData));

    return true;
  } catch (error) {
    console.error('Failed to auto-save:', error);
    return false;
  }
}

/**
 * Get auto-save data
 * @returns {Promise<object|null>}
 */
export async function getAutosave() {
  try {
    const autosaveJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTOSAVE);

    if (!autosaveJson) {
      return null;
    }

    return JSON.parse(autosaveJson);
  } catch (error) {
    console.error('Failed to get autosave:', error);
    return null;
  }
}

/**
 * Clear auto-save data
 * @returns {Promise<boolean>}
 */
export async function clearAutosave() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
    return true;
  } catch (error) {
    console.error('Failed to clear autosave:', error);
    return false;
  }
}

/**
 * Save user settings
 * @param {object} settings - Settings object
 * @returns {Promise<boolean>}
 */
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      ...settings,
      lastUpdated: Date.now(),
    }));

    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Load user settings
 * @returns {Promise<object>}
 */
export async function loadSettings() {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (!settingsJson) {
      return getDefaultSettings();
    }

    return { ...getDefaultSettings(), ...JSON.parse(settingsJson) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Get default settings
 * @returns {object}
 */
function getDefaultSettings() {
  return {
    theme: 'dark',
    soundEnabled: true,
    musicEnabled: false,
    hapticsEnabled: true,
    notificationsEnabled: true,
    autoSaveEnabled: true,
    difficulty: 'normal',
    gameSpeed: 1,
  };
}

/**
 * Save gameplay statistics (persists across games)
 * @param {object} stats - Statistics to merge
 * @returns {Promise<boolean>}
 */
export async function saveStatistics(stats) {
  try {
    const existingStats = await loadStatistics();

    const mergedStats = {
      ...existingStats,
      gamesPlayed: (existingStats.gamesPlayed || 0) + (stats.newGame ? 1 : 0),
      totalWeeksPlayed: (existingStats.totalWeeksPlayed || 0) + (stats.weeksAdvanced || 0),
      totalRevenue: (existingStats.totalRevenue || 0) + (stats.revenue || 0),
      bestWeekRevenue: Math.max(existingStats.bestWeekRevenue || 0, stats.weekRevenue || 0),
      locationsOpened: (existingStats.locationsOpened || 0) + (stats.locationsOpened || 0),
      staffHired: (existingStats.staffHired || 0) + (stats.staffHired || 0),
      eventsHandled: (existingStats.eventsHandled || 0) + (stats.eventsHandled || 0),
      lastPlayed: Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(mergedStats));

    return true;
  } catch (error) {
    console.error('Failed to save statistics:', error);
    return false;
  }
}

/**
 * Load gameplay statistics
 * @returns {Promise<object>}
 */
export async function loadStatistics() {
  try {
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);

    if (!statsJson) {
      return {};
    }

    return JSON.parse(statsJson);
  } catch (error) {
    console.error('Failed to load statistics:', error);
    return {};
  }
}

/**
 * Export save data as JSON string (for backup/sharing)
 * @param {number} slot - Slot number (1-5)
 * @returns {Promise<string|null>}
 */
export async function exportSave(slot) {
  try {
    const saveData = await loadGame(slot);

    if (!saveData) {
      return null;
    }

    return JSON.stringify({
      ...saveData,
      exportedAt: Date.now(),
      version: '2.0.0',
    });
  } catch (error) {
    console.error('Failed to export save:', error);
    return null;
  }
}

/**
 * Import save data from JSON string
 * @param {string} jsonData - JSON string of save data
 * @param {number} slot - Slot to import into
 * @returns {Promise<boolean>}
 */
export async function importSave(jsonData, slot) {
  try {
    const saveData = JSON.parse(jsonData);

    // Validate imported data
    if (!saveData.game || !saveData.setup) {
      console.error('Invalid import data structure');
      return false;
    }

    await saveGame(slot, saveData.game, saveData.setup);

    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}

export default {
  saveGame,
  loadGame,
  deleteSave,
  getSaveSlots,
  autoSave,
  getAutosave,
  clearAutosave,
  saveSettings,
  loadSettings,
  saveStatistics,
  loadStatistics,
  exportSave,
  importSave,
};
