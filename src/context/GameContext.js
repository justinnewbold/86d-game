// ============================================
// GAME CONTEXT
// ============================================
// Provides game state and actions to all components

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import {
  gameReducer,
  GAME_ACTIONS,
  initialGameState,
  uiReducer,
  UI_ACTIONS,
  MODALS,
  initialUIState,
  setupReducer,
  SETUP_ACTIONS,
  initialSetupState,
} from '../reducers';

const GameContext = createContext(null);

// Custom hook to use game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Haptic feedback helper
const triggerHaptic = (type = 'light', enabled = true) => {
  if (!enabled || Platform.OS === 'web') return;

  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [0, 50, 30, 50],
    error: [0, 100, 50, 100],
    warning: [0, 30, 20, 30],
  };

  Vibration.vibrate(patterns[type] || 10);
};

export function GameProvider({ children }) {
  // Reducers
  const [game, dispatchGame] = useReducer(gameReducer, initialGameState);
  const [ui, dispatchUI] = useReducer(uiReducer, initialUIState);
  const [setup, dispatchSetup] = useReducer(setupReducer, initialSetupState);

  // Refs for game loop
  const gameLoopRef = useRef(null);

  // ============================================
  // GAME ACTIONS
  // ============================================

  const initGame = useCallback((gameData) => {
    dispatchGame({ type: GAME_ACTIONS.INIT_GAME, payload: gameData });
    dispatchUI({ type: UI_ACTIONS.SET_SCREEN, payload: 'game' });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const resetGame = useCallback(() => {
    dispatchGame({ type: GAME_ACTIONS.RESET_GAME });
    dispatchSetup({ type: SETUP_ACTIONS.RESET_SETUP });
    dispatchUI({ type: UI_ACTIONS.SET_SCREEN, payload: 'welcome' });
  }, []);

  const advanceWeek = useCallback((weekData) => {
    dispatchGame({ type: GAME_ACTIONS.ADVANCE_WEEK, payload: weekData });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const updateLocation = useCallback((locationId, updates) => {
    dispatchGame({
      type: GAME_ACTIONS.UPDATE_LOCATION,
      payload: { locationId, updates },
    });
  }, []);

  // ============================================
  // STAFF ACTIONS
  // ============================================

  const hireStaff = useCallback((locationId, staff) => {
    dispatchGame({
      type: GAME_ACTIONS.HIRE_STAFF,
      payload: { locationId, staff },
    });
    triggerHaptic('success', ui.hapticsEnabled);
    addNotification('success', `Hired ${staff.name} as ${staff.role}`);
  }, [ui.hapticsEnabled]);

  const fireStaff = useCallback((locationId, staffId, severance = 0) => {
    dispatchGame({
      type: GAME_ACTIONS.FIRE_STAFF,
      payload: { locationId, staffId, severance },
    });
    triggerHaptic('warning', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const trainStaff = useCallback((locationId, staffId, training, cost) => {
    dispatchGame({
      type: GAME_ACTIONS.TRAIN_STAFF,
      payload: { locationId, staffId, training, cost },
    });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const setManager = useCallback((locationId, staff) => {
    dispatchGame({
      type: GAME_ACTIONS.SET_MANAGER,
      payload: { locationId, staff },
    });
    triggerHaptic('success', ui.hapticsEnabled);
    addNotification('success', `${staff.name} is now the manager!`);
  }, [ui.hapticsEnabled]);

  // ============================================
  // EQUIPMENT & UPGRADES
  // ============================================

  const buyEquipment = useCallback((locationId, equipmentId, cost) => {
    dispatchGame({
      type: GAME_ACTIONS.BUY_EQUIPMENT,
      payload: { locationId, equipmentId, cost },
    });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const buyUpgrade = useCallback((locationId, upgradeId, cost, reputationBonus) => {
    dispatchGame({
      type: GAME_ACTIONS.BUY_UPGRADE,
      payload: { locationId, upgradeId, cost, reputationBonus },
    });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  // ============================================
  // MENU ACTIONS
  // ============================================

  const toggle86 = useCallback((locationId, itemId) => {
    dispatchGame({
      type: GAME_ACTIONS.TOGGLE_86,
      payload: { locationId, itemId },
    });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const addMenuItem = useCallback((locationId, item) => {
    dispatchGame({
      type: GAME_ACTIONS.ADD_MENU_ITEM,
      payload: { locationId, item },
    });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  // ============================================
  // MARKETING & DELIVERY
  // ============================================

  const toggleMarketing = useCallback((locationId, channelId) => {
    dispatchGame({
      type: GAME_ACTIONS.TOGGLE_MARKETING,
      payload: { locationId, channelId },
    });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const toggleDelivery = useCallback((locationId, platformId, setupCost, isActive) => {
    dispatchGame({
      type: GAME_ACTIONS.TOGGLE_DELIVERY,
      payload: { locationId, platformId, setupCost, isActive },
    });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const launchVirtualBrand = useCallback((locationId, brandId, cost) => {
    dispatchGame({
      type: GAME_ACTIONS.LAUNCH_VIRTUAL_BRAND,
      payload: { locationId, brandId, cost },
    });
    triggerHaptic('success', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  // ============================================
  // FINANCIAL ACTIONS
  // ============================================

  const addLoan = useCallback((loan) => {
    dispatchGame({ type: GAME_ACTIONS.ADD_LOAN, payload: loan });
    triggerHaptic('medium', ui.hapticsEnabled);
    addNotification('info', `Loan approved: ${loan.amount}`);
  }, [ui.hapticsEnabled]);

  // ============================================
  // EXPANSION ACTIONS
  // ============================================

  const addLocation = useCallback((location) => {
    dispatchGame({ type: GAME_ACTIONS.ADD_LOCATION, payload: location });
    triggerHaptic('success', ui.hapticsEnabled);
    addNotification('success', `Opened new location: ${location.name}`);
  }, [ui.hapticsEnabled]);

  const closeLocation = useCallback((locationId, closingCost) => {
    dispatchGame({
      type: GAME_ACTIONS.CLOSE_LOCATION,
      payload: { locationId, closingCost },
    });
    triggerHaptic('warning', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const sellLocation = useCallback((locationId, salePrice) => {
    dispatchGame({
      type: GAME_ACTIONS.SELL_LOCATION,
      payload: { locationId, salePrice },
    });
    triggerHaptic('success', ui.hapticsEnabled);
    addNotification('success', `Sold location for ${salePrice}`);
  }, [ui.hapticsEnabled]);

  const addFranchise = useCallback((franchise) => {
    dispatchGame({ type: GAME_ACTIONS.ADD_FRANCHISE, payload: franchise });
    triggerHaptic('success', ui.hapticsEnabled);
    addNotification('success', `New franchise partner: ${franchise.name}`);
  }, [ui.hapticsEnabled]);

  // ============================================
  // UI ACTIONS
  // ============================================

  const setScreen = useCallback((screen) => {
    dispatchUI({ type: UI_ACTIONS.SET_SCREEN, payload: screen });
  }, []);

  const setActiveTab = useCallback((tab) => {
    dispatchUI({ type: UI_ACTIONS.SET_ACTIVE_TAB, payload: tab });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const setActiveLocation = useCallback((locationId) => {
    dispatchUI({ type: UI_ACTIONS.SET_ACTIVE_LOCATION, payload: locationId });
  }, []);

  const openModal = useCallback((modalName) => {
    dispatchUI({ type: UI_ACTIONS.OPEN_MODAL, payload: modalName });
    triggerHaptic('light', ui.hapticsEnabled);
  }, [ui.hapticsEnabled]);

  const closeModal = useCallback((modalName) => {
    dispatchUI({ type: UI_ACTIONS.CLOSE_MODAL, payload: modalName });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatchUI({ type: UI_ACTIONS.CLOSE_ALL_MODALS });
  }, []);

  const addNotification = useCallback((type, message) => {
    const notificationId = Date.now();
    dispatchUI({
      type: UI_ACTIONS.ADD_NOTIFICATION,
      payload: { type, message, id: notificationId },
    });

    // Auto-remove after 4 seconds using the captured ID
    setTimeout(() => {
      dispatchUI({
        type: UI_ACTIONS.REMOVE_NOTIFICATION,
        payload: notificationId,
      });
    }, 4000);
  }, []);

  const setAiMessage = useCallback((message) => {
    dispatchUI({ type: UI_ACTIONS.SET_AI_MESSAGE, payload: message });
  }, []);

  const setGameSpeed = useCallback((speed) => {
    dispatchUI({ type: UI_ACTIONS.SET_GAME_SPEED, payload: speed });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatchUI({ type: UI_ACTIONS.SET_THEME, payload: theme });
  }, []);

  const toggleSound = useCallback(() => {
    dispatchUI({ type: UI_ACTIONS.TOGGLE_SOUND });
  }, []);

  const toggleHaptics = useCallback(() => {
    dispatchUI({ type: UI_ACTIONS.TOGGLE_HAPTICS });
  }, []);

  // ============================================
  // SETUP ACTIONS
  // ============================================

  const setSetupName = useCallback((name) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_NAME, payload: name });
  }, []);

  const setSetupCuisine = useCallback((cuisine) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_CUISINE, payload: cuisine });
  }, []);

  const setSetupCapital = useCallback((capital) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_CAPITAL, payload: capital });
  }, []);

  const setCustomCapital = useCallback((options) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_CUSTOM_CAPITAL, payload: options });
  }, []);

  const setSetupLocationType = useCallback((locationType) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_LOCATION_TYPE, payload: locationType });
  }, []);

  const setSetupDifficulty = useCallback((difficulty) => {
    dispatchSetup({ type: SETUP_ACTIONS.SET_DIFFICULTY, payload: difficulty });
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const activeLocation = useMemo(() => {
    return game.locations?.find(l => l.id === ui.activeLocationId) || game.locations?.[0] || null;
  }, [game.locations, ui.activeLocationId]);

  const totalCash = useMemo(() => {
    return (game.locations || []).reduce((sum, l) => sum + (l.cash || 0), 0) + (game.corporateCash || 0);
  }, [game.locations, game.corporateCash]);

  const totalStaff = useMemo(() => {
    return (game.locations || []).reduce((sum, l) => sum + (l.staff?.length || 0), 0);
  }, [game.locations]);

  const empireValuation = useMemo(() => {
    const locationsValue = (game.locations || []).reduce((sum, l) => {
      const weeklyProfit = l.lastWeekProfit || 0;
      const annualProfit = weeklyProfit * 52;
      const assetValue = (l.equipment?.length || 0) * 5000 + (l.upgrades?.length || 0) * 15000;
      return sum + Math.max(50000, annualProfit * 2.5 + assetValue);
    }, 0);

    const franchiseValue = (game.franchises || []).reduce((sum, f) => sum + (f.weeklyRoyalty || 0) * 52 * 5, 0);

    return locationsValue + franchiseValue + totalCash;
  }, [game.locations, game.franchises, totalCash]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = useMemo(() => ({
    // State
    game,
    ui,
    setup,

    // Computed
    activeLocation,
    totalCash,
    totalStaff,
    empireValuation,

    // Game actions
    initGame,
    resetGame,
    advanceWeek,
    updateLocation,

    // Staff actions
    hireStaff,
    fireStaff,
    trainStaff,
    setManager,

    // Equipment
    buyEquipment,
    buyUpgrade,

    // Menu
    toggle86,
    addMenuItem,

    // Marketing & delivery
    toggleMarketing,
    toggleDelivery,
    launchVirtualBrand,

    // Financial
    addLoan,

    // Expansion
    addLocation,
    closeLocation,
    sellLocation,
    addFranchise,

    // UI actions
    setScreen,
    setActiveTab,
    setActiveLocation,
    openModal,
    closeModal,
    closeAllModals,
    addNotification,
    setAiMessage,
    setGameSpeed,
    setTheme,
    toggleSound,
    toggleHaptics,

    // Setup actions
    setSetupName,
    setSetupCuisine,
    setSetupCapital,
    setCustomCapital,
    setSetupLocationType,
    setSetupDifficulty,

    // Dispatch functions for advanced use
    dispatchGame,
    dispatchUI,
    dispatchSetup,

    // Constants
    MODALS,
    GAME_ACTIONS,
    UI_ACTIONS,
    SETUP_ACTIONS,
  }), [
    game, ui, setup,
    activeLocation, totalCash, totalStaff, empireValuation,
    initGame, resetGame, advanceWeek, updateLocation,
    hireStaff, fireStaff, trainStaff, setManager,
    buyEquipment, buyUpgrade,
    toggle86, addMenuItem,
    toggleMarketing, toggleDelivery, launchVirtualBrand,
    addLoan,
    addLocation, closeLocation, sellLocation, addFranchise,
    setScreen, setActiveTab, setActiveLocation,
    openModal, closeModal, closeAllModals,
    addNotification, setAiMessage, setGameSpeed, setTheme,
    toggleSound, toggleHaptics,
    setSetupName, setSetupCuisine, setSetupCapital, setCustomCapital,
    setSetupLocationType, setSetupDifficulty,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export { MODALS, GAME_ACTIONS, UI_ACTIONS, SETUP_ACTIONS };
