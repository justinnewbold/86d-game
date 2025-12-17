import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initial setup state
const initialSetup = {
  cuisine: null,
  capital: 75000,
  name: '',
  location: 'urban_neighborhood',
  market: 'same_city',
  goal: 'survive',
  experience: 'none',
  difficulty: 'normal',
};

// Game store with persistence
export const useGameStore = create(
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

      // Notifications
      notifications: [],

      // Settings
      currentTheme: 'dark',
      difficulty: 'normal',
      gameSpeed: 'pause',
      soundEnabled: true,
      autoSaveEnabled: true,
      showTips: true,

      // Actions
      setScreen: (screen) => set({ screen }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setSetup: (setup) => set((state) => ({
        setup: typeof setup === 'function' ? setup(state.setup) : setup
      })),
      setGame: (game) => set((state) => ({
        game: typeof game === 'function' ? game(state.game) : game
      })),
      setActiveLocationId: (id) => set({ activeLocationId: id }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setScenario: (scenario) => set({ scenario }),
      setScenarioResult: (result) => set({ scenarioResult: result }),
      setAiMessage: (message) => set({ aiMessage: message }),
      setAiLoading: (loading) => set({ aiLoading: loading }),
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
      resetGame: () => set({
        screen: 'welcome',
        onboardingStep: 0,
        setup: { ...initialSetup },
        game: null,
        activeLocationId: null,
        scenario: null,
        scenarioResult: null,
        aiMessage: '',
      }),
    }),
    {
      name: '86d-game-storage',
      partialize: (state) => ({
        // Only persist these fields
        setup: state.setup,
        game: state.game,
        activeLocationId: state.activeLocationId,
        currentTheme: state.currentTheme,
        soundEnabled: state.soundEnabled,
        autoSaveEnabled: state.autoSaveEnabled,
        showTips: state.showTips,
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
