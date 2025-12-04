import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistoryState<T>(initialState: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCommittedRef = useRef<boolean>(false);

  const setState = useCallback((newState: T | ((prev: T) => T), skipHistory = false, immediateCommit = false) => {
    setHistory((currentHistory) => {
      const actualNewState =
        typeof newState === 'function'
          ? (newState as (prev: T) => T)(currentHistory.present)
          : newState;

      if (skipHistory) {
        // 只更新 present，不记录历史
        return {
          ...currentHistory,
          present: actualNewState,
        };
      }

      // 立即提交历史，不走防抖（例如拖动结束）
      if (immediateCommit) {
        if (Object.is(currentHistory.present, actualNewState)) {
          return currentHistory;
        }
        hasCommittedRef.current = true;
        return {
          past: [...currentHistory.past, currentHistory.present],
          present: actualNewState,
          future: [],
        };
      }

      // 防抖：300ms内只记录一次历史
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        setHistory((h) => {
          // 只有 present 变化时才入历史
          if (Object.is(h.present, actualNewState)) return h;
          hasCommittedRef.current = true;
          return {
            past: [...h.past, h.present],
            present: actualNewState,
            future: [],
          };
        });
      }, 300);
      // 立即更新 present，但不立即入历史
      return {
        ...currentHistory,
        present: actualNewState,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) return currentHistory;
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) return currentHistory;
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);
      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = hasCommittedRef.current && history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
