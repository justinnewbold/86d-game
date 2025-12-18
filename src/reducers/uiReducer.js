// ============================================
// UI STATE REDUCER
// ============================================
// Handles all UI-related state changes (modals, tabs, screens)

export const UI_ACTIONS = {
  // Screen navigation
  SET_SCREEN: 'SET_SCREEN',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_ACTIVE_LOCATION: 'SET_ACTIVE_LOCATION',

  // Modal management
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',

  // Tutorial & onboarding
  SET_TUTORIAL_STEP: 'SET_TUTORIAL_STEP',
  SET_ONBOARDING_STEP: 'SET_ONBOARDING_STEP',
  COMPLETE_TUTORIAL: 'COMPLETE_TUTORIAL',

  // Settings
  SET_THEME: 'SET_THEME',
  SET_GAME_SPEED: 'SET_GAME_SPEED',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  TOGGLE_SOUND: 'TOGGLE_SOUND',
  TOGGLE_MUSIC: 'TOGGLE_MUSIC',
  TOGGLE_HAPTICS: 'TOGGLE_HAPTICS',

  // Notifications
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',

  // AI Mentor
  SET_AI_MESSAGE: 'SET_AI_MESSAGE',
  SET_AI_LOADING: 'SET_AI_LOADING',

  // Misc
  SET_SELECTED_STAFF: 'SET_SELECTED_STAFF',
  SET_SELECTED_ITEM: 'SET_SELECTED_ITEM',
};

// Modal types enum
export const MODALS = {
  STAFF: 'staff',
  CUISINE: 'cuisine',
  LOCATION: 'location',
  MARKETING: 'marketing',
  DELIVERY: 'delivery',
  LOAN: 'loan',
  EQUIPMENT: 'equipment',
  UPGRADE: 'upgrade',
  EVENT: 'event',
  SETTINGS: 'settings',
  SAVE: 'save',
  SELL_LOCATION: 'sellLocation',
  FRANCHISE: 'franchise',
  TRAINING: 'training',
  VIRTUAL_BRAND: 'virtualBrand',
  VENDOR: 'vendor',
  ECONOMY: 'economy',
  MILESTONE: 'milestone',
  CONFIRM: 'confirm',
  ANALYTICS: 'analytics',
};

const initialUIState = {
  // Screen & navigation
  screen: 'welcome', // 'welcome', 'onboarding', 'game', 'gameOver'
  activeTab: 'overview', // 'overview', 'staff', 'ops', 'finance', 'empire'
  activeLocationId: 1,

  // Tutorial
  tutorialStep: 0,
  tutorialComplete: false,
  onboardingStep: 0,

  // Modals (all closed by default)
  openModals: {},

  // Settings
  theme: 'dark',
  gameSpeed: 1,
  difficulty: 'normal',
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,

  // Notifications
  notifications: [],

  // AI mentor
  aiMessage: '',
  aiLoading: false,

  // Selection state
  selectedStaff: null,
  selectedItem: null,

  // Confirm dialog
  confirmDialog: null,
};

export function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTIONS.SET_SCREEN:
      return { ...state, screen: action.payload };

    case UI_ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };

    case UI_ACTIONS.SET_ACTIVE_LOCATION:
      return { ...state, activeLocationId: action.payload };

    case UI_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        openModals: { ...state.openModals, [action.payload]: true },
      };

    case UI_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        openModals: { ...state.openModals, [action.payload]: false },
      };

    case UI_ACTIONS.CLOSE_ALL_MODALS:
      return { ...state, openModals: {} };

    case UI_ACTIONS.SET_TUTORIAL_STEP:
      return { ...state, tutorialStep: action.payload };

    case UI_ACTIONS.SET_ONBOARDING_STEP:
      return { ...state, onboardingStep: action.payload };

    case UI_ACTIONS.COMPLETE_TUTORIAL:
      return { ...state, tutorialComplete: true, tutorialStep: -1 };

    case UI_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };

    case UI_ACTIONS.SET_GAME_SPEED:
      return { ...state, gameSpeed: action.payload };

    case UI_ACTIONS.SET_DIFFICULTY:
      return { ...state, difficulty: action.payload };

    case UI_ACTIONS.TOGGLE_SOUND:
      return { ...state, soundEnabled: !state.soundEnabled };

    case UI_ACTIONS.TOGGLE_MUSIC:
      return { ...state, musicEnabled: !state.musicEnabled };

    case UI_ACTIONS.TOGGLE_HAPTICS:
      return { ...state, hapticsEnabled: !state.hapticsEnabled };

    case UI_ACTIONS.ADD_NOTIFICATION: {
      const notification = {
        id: Date.now(),
        ...action.payload,
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [...state.notifications, notification].slice(-5), // Keep last 5
      };
    }

    case UI_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case UI_ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };

    case UI_ACTIONS.SET_AI_MESSAGE:
      return { ...state, aiMessage: action.payload, aiLoading: false };

    case UI_ACTIONS.SET_AI_LOADING:
      return { ...state, aiLoading: action.payload };

    case UI_ACTIONS.SET_SELECTED_STAFF:
      return { ...state, selectedStaff: action.payload };

    case UI_ACTIONS.SET_SELECTED_ITEM:
      return { ...state, selectedItem: action.payload };

    default:
      return state;
  }
}

export { initialUIState };
