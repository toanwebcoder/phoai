import { useState, useEffect, useCallback } from 'react';
import {
  getHistory,
  saveToHistory,
  deleteHistoryItem,
  clearHistory,
  HistoryItem,
  HistoryType,
} from '@/lib/history';

export function useHistory(type: HistoryType) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from IndexedDB (async)
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getHistory(type);
      setHistory(items);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Save a new item to history (async)
  const addToHistory = useCallback(
    async (image: string, result: any, location?: string) => {
      try {
        await saveToHistory(type, image, result, location);
        await loadHistory(); // Refresh the list
      } catch (error) {
        console.error('Error adding to history:', error);
      }
    },
    [type, loadHistory]
  );

  // Delete a specific item (async)
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteHistoryItem(type, id);
        await loadHistory(); // Refresh the list
      } catch (error) {
        console.error('Error deleting history item:', error);
      }
    },
    [type, loadHistory]
  );

  // Clear all history (async)
  const clearAll = useCallback(async () => {
    try {
      await clearHistory(type);
      await loadHistory(); // Refresh the list
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [type, loadHistory]);

  return {
    history,
    isLoading,
    addToHistory,
    deleteItem,
    clearAll,
    refreshHistory: loadHistory,
  };
}
