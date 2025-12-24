// ============================================
// SAVE GAME VERSIONING & MIGRATION
// ============================================

import { GameState, SetupState } from '../types/game';

// Current save game schema version
export const CURRENT_SAVE_VERSION = '2.4.0';

// Version history for migration paths
const VERSION_HISTORY = ['1.0.0', '2.0.0', '2.1.0', '2.2.0', '2.3.0', '2.3.1', '2.4.0'];

export interface VersionedSaveGame {
  version: string;
  slot: number;
  date: string;
  setup: SetupState;
  game: GameState;
  checksum?: string;
}

// Generate a simple checksum for data integrity
export const generateChecksum = (data: object): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// Verify checksum
export const verifyChecksum = (save: VersionedSaveGame): boolean => {
  if (!save.checksum) return true; // Old saves without checksum are valid
  const dataToCheck = { setup: save.setup, game: save.game };
  return generateChecksum(dataToCheck) === save.checksum;
};

// Create a new versioned save
export const createVersionedSave = (
  slot: number,
  setup: SetupState,
  game: GameState
): VersionedSaveGame => {
  const save: VersionedSaveGame = {
    version: CURRENT_SAVE_VERSION,
    slot,
    date: new Date().toISOString(),
    setup,
    game,
  };
  save.checksum = generateChecksum({ setup, game });
  return save;
};

// Compare versions
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
};

// Migration functions for each version upgrade
const migrations: Record<string, (save: VersionedSaveGame) => VersionedSaveGame> = {
  // Migration from 1.x to 2.0.0
  '2.0.0': (save) => {
    // Add locations array if missing (pre-multi-location)
    if (!save.game.locations && (save.game as any).cash !== undefined) {
      const legacyGame = save.game as any;
      save.game = {
        ...save.game,
        locations: [{
          id: 1,
          name: save.setup.name || 'Original Location',
          locationType: save.setup.location || 'urban_neighborhood',
          market: 'same_city',
          isGhostKitchen: false,
          cash: legacyGame.cash || 0,
          totalRevenue: legacyGame.totalRevenue || 0,
          totalProfit: legacyGame.totalProfit || 0,
          weeklyHistory: legacyGame.weeklyHistory || [],
          staff: legacyGame.staff || [],
          menu: legacyGame.menu || [],
          equipment: legacyGame.equipment || [],
          upgrades: legacyGame.upgrades || [],
          marketing: legacyGame.marketing || { channels: ['social_organic'], socialFollowers: 50 },
          delivery: legacyGame.delivery || { platforms: [], orders: 0 },
          virtualBrands: [],
          reputation: legacyGame.reputation || 50,
          morale: legacyGame.morale || 70,
          covers: legacyGame.covers || 30,
          weeksOpen: legacyGame.week || 0,
          manager: null,
          managerAutonomy: 0.5,
          rent: legacyGame.rent || 3000,
          avgTicket: legacyGame.avgTicket || 15,
          foodCostPct: legacyGame.foodCostPct || 0.28,
          lastWeekRevenue: 0,
          lastWeekProfit: 0,
          lastWeekCovers: 0,
        }],
        corporateCash: legacyGame.corporateCash || legacyGame.cash * 0.3 || 0,
        franchises: [],
        corporateStaff: [],
      };
    }
    return save;
  },

  // Migration from 2.0.0 to 2.1.0
  '2.1.0': (save) => {
    // Add stats object if missing
    if (!save.game.stats) {
      save.game.stats = {
        peakWeeklyRevenue: 0,
        peakWeeklyProfit: 0,
        totalCustomersServed: 0,
        employeesHired: save.game.locations?.reduce((sum, l) => sum + (l.staff?.length || 0), 0) || 0,
        employeesFired: 0,
        scenariosWon: 0,
        scenariosLost: 0,
        locationsOpened: save.game.locations?.length || 1,
        locationsClosed: 0,
        franchisesSold: 0,
      };
    }
    return save;
  },

  // Migration from 2.1.0 to 2.2.0
  '2.2.0': (save) => {
    // Add Phase 6 fields if missing
    if (!save.game.investors) save.game.investors = [];
    if (!save.game.ownedProperties) save.game.ownedProperties = [];
    if (!save.game.foodTrucks) save.game.foodTrucks = [];
    if (!save.game.mediaAppearances) save.game.mediaAppearances = [];
    if (!save.game.brandDeals) save.game.brandDeals = [];
    if (!save.game.economicCondition) save.game.economicCondition = 'stable';
    return save;
  },

  // Migration from 2.2.0 to 2.3.0
  '2.3.0': (save) => {
    // Add Phase 9 realism fields if missing
    if (!save.game.weather) {
      save.game.weather = { current: 'partly_cloudy', forecast: [], weeksOfBadWeather: 0 };
    }
    if (!save.game.reviews) save.game.reviews = {};
    if (!save.game.healthInspection) {
      save.game.healthInspection = { lastGrade: 'A', lastScore: 95, lastDate: null, violations: [] };
    }
    if (save.game.maintenanceLevel === undefined) save.game.maintenanceLevel = 0.5;
    return save;
  },

  // Migration from 2.3.0 to 2.3.1 (bug fixes, no schema changes)
  '2.3.1': (save) => save,

  // Migration from 2.3.1 to 2.4.0 (current)
  '2.4.0': (save) => {
    // Add any new fields for 2.4.0
    // Ensure all locations have proper defaults
    if (save.game.locations) {
      save.game.locations = save.game.locations.map(loc => ({
        ...loc,
        economicRevenueMultiplier: loc.economicRevenueMultiplier ?? 1,
        economicCostMultiplier: loc.economicCostMultiplier ?? 1,
      }));
    }
    return save;
  },
};

// Migrate save to current version
export const migrateSave = (save: VersionedSaveGame): VersionedSaveGame => {
  const saveVersion = save.version || '1.0.0';

  if (compareVersions(saveVersion, CURRENT_SAVE_VERSION) >= 0) {
    // Already at or ahead of current version
    return save;
  }

  let migratedSave = { ...save };

  // Find the starting index in version history
  let startIndex = VERSION_HISTORY.findIndex(v => compareVersions(v, saveVersion) > 0);
  if (startIndex === -1) startIndex = 0;

  // Apply all migrations from the save version to current
  for (let i = startIndex; i < VERSION_HISTORY.length; i++) {
    const targetVersion = VERSION_HISTORY[i];
    if (migrations[targetVersion]) {
      migratedSave = migrations[targetVersion](migratedSave);
      migratedSave.version = targetVersion;
    }
  }

  // Update checksum after migration
  migratedSave.checksum = generateChecksum({ setup: migratedSave.setup, game: migratedSave.game });

  return migratedSave;
};

// Check if save needs migration
export const needsMigration = (save: VersionedSaveGame): boolean => {
  const saveVersion = save.version || '1.0.0';
  return compareVersions(saveVersion, CURRENT_SAVE_VERSION) < 0;
};

// Export save as JSON string
export const exportSave = (save: VersionedSaveGame): string => {
  return JSON.stringify(save, null, 2);
};

// Import save from JSON string
export const importSave = (jsonString: string): VersionedSaveGame | null => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.slot || !parsed.setup || !parsed.game) {
      return null;
    }
    // Migrate if needed
    return migrateSave(parsed);
  } catch {
    return null;
  }
};
