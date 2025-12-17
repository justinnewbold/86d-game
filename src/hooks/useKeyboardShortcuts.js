import { useEffect, useCallback } from 'react';

/**
 * Hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {boolean} enabled - Whether shortcuts are active
 *
 * Usage:
 * useKeyboardShortcuts({
 *   ' ': () => advanceWeek(),
 *   '1': () => setTab('overview'),
 *   '2': () => setTab('staff'),
 *   'Escape': () => closeModal(),
 * }, isEnabled);
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      const key = event.key;
      const handler = shortcuts[key];

      if (handler) {
        event.preventDefault();
        handler(event);
      }

      // Handle modifier keys
      if (event.ctrlKey || event.metaKey) {
        const modKey = `Ctrl+${key}`;
        const modHandler = shortcuts[modKey];
        if (modHandler) {
          event.preventDefault();
          modHandler(event);
        }
      }

      if (event.shiftKey) {
        const shiftKey = `Shift+${key}`;
        const shiftHandler = shortcuts[shiftKey];
        if (shiftHandler) {
          event.preventDefault();
          shiftHandler(event);
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);
};

// Common keyboard shortcut presets
export const GAME_SHORTCUTS = {
  ADVANCE_WEEK: ' ', // Space
  TAB_OVERVIEW: '1',
  TAB_STAFF: '2',
  TAB_OPS: '3',
  TAB_FINANCE: '4',
  TAB_EMPIRE: '5',
  CLOSE_MODAL: 'Escape',
  SAVE_GAME: 'Ctrl+s',
  PAUSE: 'p',
};

export default useKeyboardShortcuts;
