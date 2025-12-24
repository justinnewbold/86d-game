export { useKeyboardShortcuts, GAME_SHORTCUTS } from './useKeyboardShortcuts';
export type { ShortcutHandler, ShortcutMap, GameShortcut } from './useKeyboardShortcuts';

export { useConfirmDialog } from './useConfirmDialog';
export type { ConfirmDialogOptions, UseConfirmDialogReturn } from './useConfirmDialog';

export {
  processLocationWeek,
  getEconomicMultipliers,
  useGameAutoAdvance,
  calculateEmpireValuation,
} from './useGameLoop';

export { useUndoRedo, createGameCommand, CommandTypes } from './useUndoRedo';
export type { CommandType } from './useUndoRedo';

export { useThemeDetection, useThemeColors, commonThemeColors } from './useThemeDetection';
export type { ThemeMode } from './useThemeDetection';
