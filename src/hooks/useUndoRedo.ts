// ============================================
// UNDO/REDO SYSTEM HOOK
// ============================================

import { useState, useCallback, useRef } from 'react';
import type { GameCommand } from '../types/game';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoOptions {
  maxHistory?: number;
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T, command?: GameCommand) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: GameCommand[];
  clearHistory: () => void;
  jumpToState: (index: number) => void;
}

/**
 * Hook for managing undo/redo functionality with command history
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const { maxHistory = 50 } = options;

  const [undoRedoState, setUndoRedoState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const commandHistory = useRef<GameCommand[]>([]);

  const setState = useCallback((newState: T, command?: GameCommand) => {
    setUndoRedoState((prev) => {
      const newPast = [...prev.past, prev.present].slice(-maxHistory);

      if (command) {
        commandHistory.current = [
          ...commandHistory.current.slice(-maxHistory),
          command,
        ];
      }

      return {
        past: newPast,
        present: newState,
        future: [], // Clear redo stack on new action
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setUndoRedoState((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const previousState = prev.past[prev.past.length - 1];

      return {
        past: newPast,
        present: previousState,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setUndoRedoState((prev) => {
      if (prev.future.length === 0) return prev;

      const [nextState, ...newFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setUndoRedoState((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
    commandHistory.current = [];
  }, []);

  const jumpToState = useCallback((index: number) => {
    setUndoRedoState((prev) => {
      const allStates = [...prev.past, prev.present, ...prev.future];
      if (index < 0 || index >= allStates.length) return prev;

      const targetState = allStates[index];
      const newPast = allStates.slice(0, index);
      const newFuture = allStates.slice(index + 1);

      return {
        past: newPast,
        present: targetState,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: undoRedoState.present,
    setState,
    undo,
    redo,
    canUndo: undoRedoState.past.length > 0,
    canRedo: undoRedoState.future.length > 0,
    history: commandHistory.current,
    clearHistory,
    jumpToState,
  };
}

/**
 * Create a game command for history tracking
 */
export function createGameCommand(
  type: string,
  payload: unknown,
  description: string
): GameCommand {
  return {
    type,
    payload,
    timestamp: Date.now(),
    description,
  };
}

/**
 * Common game command types
 */
export const CommandTypes = {
  ADVANCE_WEEK: 'ADVANCE_WEEK',
  HIRE_STAFF: 'HIRE_STAFF',
  FIRE_STAFF: 'FIRE_STAFF',
  BUY_EQUIPMENT: 'BUY_EQUIPMENT',
  SELL_EQUIPMENT: 'SELL_EQUIPMENT',
  TAKE_LOAN: 'TAKE_LOAN',
  PAY_LOAN: 'PAY_LOAN',
  EXPAND_LOCATION: 'EXPAND_LOCATION',
  CLOSE_LOCATION: 'CLOSE_LOCATION',
  CHANGE_PRICE: 'CHANGE_PRICE',
  START_MARKETING: 'START_MARKETING',
  SCENARIO_CHOICE: 'SCENARIO_CHOICE',
} as const;

export type CommandType = typeof CommandTypes[keyof typeof CommandTypes];

export default useUndoRedo;
