import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Setup, Scenario, Screen, Tab, GameSpeed, Location } from '../types';
import {
  VersionedSaveGame,
  createVersionedSave,
  migrateSave,
  needsMigration,
  CURRENT_SAVE_VERSION,
} from '../utils/saveGameMigration';

// Initial setup state
const initialSetup: Setup = {
  cuisine: null,
  capital: 75000,
  name: '',
  location: 'urban_neighborhood',
  market: 'same_city',
  goal: 'survive',
  experience: 'none',
  difficulty: 'normal',
  city: '',
  state: '',
};

// AI conversation message type
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
}

export interface GameStoreState {
  // Screen state
  screen: Screen;
  onboardingStep: number;

  // Setup state
  setup: Setup;

  // Game state
  game: GameState | null;
  activeLocationId: number | null;

  // UI state
  activeTab: Tab;
  scenario: Scenario | null;
  scenarioResult: { success: boolean; outcome: unknown } | null;
  aiMessage: string;
  aiLoading: boolean;
  aiConversationHistory: ConversationMessage[];

  // Notifications
  notifications: Notification[];

  // Settings
  currentTheme: string;
  difficulty: string;
  gameSpeed: GameSpeed;
  soundEnabled: boolean;
  autoSaveEnabled: boolean;
  showTips: boolean;

  // Save games
  savedGames: VersionedSaveGame[];

  // Actions
  setScreen: (screen: Screen) => void;
  setOnboardingStep: (step: number) => void;
  setSetup: (setup: Setup | ((prev: Setup) => Setup)) => void;
  setGame: (game: GameState | null | ((prev: GameState | null) => GameState | null)) => void;
  setActiveLocationId: (id: number | null) => void;
  setActiveTab: (tab: Tab) => void;
  setScenario: (scenario: Scenario | null) => void;
  setScenarioResult: (result: { success: boolean; outcome: unknown } | null) => void;
  setAiMessage: (message: string) => void;
  setAiLoading: (loading: boolean) => void;
  setAiConversationHistory: (updater: (prev: ConversationMessage[]) => ConversationMessage[]) => void;
  setGameSpeed: (speed: GameSpeed) => void;
  setTheme: (theme: string) => void;
  addNotification: (type: string, message: string) => void;
  getActiveLocation: () => Location | null;
  resetSetup: () => void;
  resetGame: () => void;

  // Save game actions
  saveGame: (slot: number) => void;
  loadGame: (save: VersionedSaveGame) => void;
  deleteSave: (slot: number) => void;
  exportSave: (slot: number) => string | null;
  importSave: (jsonString: string) => boolean;
}

// Game store with persistence
export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // Screen state
      screen: 'welcome',
      onboardingStep: 0,

      // Setup state
      setup: { ...initialSetup },

      // Game state
      game: null,
      activeLocationId: null,

      // UI state
      activeTab: 'overview',
      scenario: null,
      scenarioResult: null,
      aiMessage: '',
      aiLoading: false,
      aiConversationHistory: [],

      // Notifications
      notifications: [],

      // Settings
      currentTheme: 'dark',
      difficulty: 'normal',
      gameSpeed: 'pause',
      soundEnabled: true,
      autoSaveEnabled: true,
      showTips: true,

      // Save games
      savedGames: [],

      // Actions
      setScreen: (screen) => set({ screen }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setSetup: (setup) =>
        set((state) => ({
          setup: typeof setup === 'function' ? setup(state.setup) : setup,
        })),
      setGame: (game) =>
        set((state) => ({
          game: typeof game === 'function' ? game(state.game) : game,
        })),
      setActiveLocationId: (id) => set({ activeLocationId: id }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setScenario: (scenario) => set({ scenario }),
      setScenarioResult: (result) => set({ scenarioResult: result }),
      setAiMessage: (message) => set({ aiMessage: message }),
      setAiLoading: (loading) => set({ aiLoading: loading }),
      setAiConversationHistory: (updater) =>
        set((state) => ({
          aiConversationHistory: updater(state.aiConversationHistory),
        })),
      setGameSpeed: (speed) => set({ gameSpeed: speed }),
      setTheme: (theme) => set({ currentTheme: theme }),

      // Notification actions
      addNotification: (type, message) => {
        const id = Date.now();
        set((state) => ({
          notifications: [...state.notifications, { id, type, message }],
        }));
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }, 4000);
      },

      // Game helpers
      getActiveLocation: () => {
        const { game, activeLocationId } = get();
        if (!game || !game.locations) return null;
        return game.locations.find((l) => l.id === activeLocationId) || game.locations[0];
      },

      // Reset actions
      resetSetup: () => set({ setup: { ...initialSetup } }),
      resetGame: () =>
        set({
          screen: 'welcome',
          onboardingStep: 0,
          setup: { ...initialSetup },
          game: null,
          activeLocationId: null,
          scenario: null,
          scenarioResult: null,
          aiMessage: '',
          aiConversationHistory: [],
        }),

      // Save game actions with versioning
      saveGame: (slot) => {
        const { setup, game } = get();
        if (!game) return;

        const versionedSave = createVersionedSave(slot, setup as any, game as any);
        set((state) => ({
          savedGames: [
            ...state.savedGames.filter((s) => s.slot !== slot),
            versionedSave,
          ].sort((a, b) => a.slot - b.slot),
        }));
      },

      loadGame: (save) => {
        // Migrate save if needed
        const migratedSave = needsMigration(save) ? migrateSave(save) : save;

        set({
          setup: migratedSave.setup as any,
          game: migratedSave.game as any,
          activeLocationId:
            (migratedSave.game as any)?.locations?.length > 0
              ? (migratedSave.game as any).locations[0].id
              : null,
          screen: 'dashboard',
          aiConversationHistory: [],
        });
      },

      deleteSave: (slot) => {
        set((state) => ({
          savedGames: state.savedGames.filter((s) => s.slot !== slot),
        }));
      },

      exportSave: (slot) => {
        const { savedGames } = get();
        const save = savedGames.find((s) => s.slot === slot);
        if (!save) return null;
        return JSON.stringify(save, null, 2);
      },

      importSave: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!parsed.slot || !parsed.setup || !parsed.game) {
            return false;
          }
          const migratedSave = migrateSave(parsed);
          set((state) => ({
            savedGames: [
              ...state.savedGames.filter((s) => s.slot !== migratedSave.slot),
              migratedSave,
            ].sort((a, b) => a.slot - b.slot),
          }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: '86d-game-storage',
      version: 1, // Add version for store migration
      partialize: (state) => ({
        // Only persist these fields
        setup: state.setup,
        game: state.game,
        activeLocationId: state.activeLocationId,
        currentTheme: state.currentTheme,
        soundEnabled: state.soundEnabled,
        autoSaveEnabled: state.autoSaveEnabled,
        showTips: state.showTips,
        savedGames: state.savedGames,
      }),
    }
  )
);

// Selector hooks for common state slices
export const useScreen = () => useGameStore((state) => state.screen);
export const useSetup = () => useGameStore((state) => state.setup);
export const useGame = () => useGameStore((state) => state.game);
export const useActiveLocation = () => useGameStore((state) => state.getActiveLocation());
export const useNotifications = () => useGameStore((state) => state.notifications);

export default useGameStore;
