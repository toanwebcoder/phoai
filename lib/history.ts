// History management using IndexedDB for larger capacity

import { indexedDBManager, HistoryItem, HistoryType } from './indexedDB';
import { compressImage, createThumbnail, getBase64Size, formatBytes } from './imageCompression';

const MAX_HISTORY_ITEMS = 50; // Increased from 20 due to IndexedDB capacity
const MAX_IMAGE_SIZE_MB = 5; // 5MB limit for original upload
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Get all history items for a specific type
 */
export async function getHistory(type: HistoryType): Promise<HistoryItem[]> {
  try {
    const items = await indexedDBManager.getAll(type);
    return items.slice(0, MAX_HISTORY_ITEMS); // Limit to max items
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Save a new history item with image compression
 */
export async function saveToHistory(
  type: HistoryType,
  image: string,
  result: any,
  location?: string
): Promise<void> {
  try {
    // Validate original image size
    const originalSize = getBase64Size(image);
    if (originalSize > MAX_IMAGE_SIZE_BYTES) {
      console.warn(
        `Image too large: ${formatBytes(originalSize)}. Max allowed: ${MAX_IMAGE_SIZE_MB}MB`
      );
      // Continue anyway but compress more aggressively
    }

    // Compress image for storage
    const compressedImage = await compressImage(image, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
    });

    // Create thumbnail for list view
    const thumbnail = await createThumbnail(image, {
      thumbnailWidth: 300,
      thumbnailHeight: 300,
    });

    const compressedSize = getBase64Size(compressedImage);
    const thumbnailSize = getBase64Size(thumbnail);

    console.log('Image compression stats:', {
      original: formatBytes(originalSize),
      compressed: formatBytes(compressedSize),
      thumbnail: formatBytes(thumbnailSize),
      savedSpace: formatBytes(originalSize - compressedSize),
      compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%',
    });

    const newItem: HistoryItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      image: compressedImage,
      thumbnail,
      result,
      location,
    };

    // Add to IndexedDB
    await indexedDBManager.add(type, newItem);

    // Clean up old items if exceeding max
    const allItems = await indexedDBManager.getAll(type);
    if (allItems.length > MAX_HISTORY_ITEMS) {
      // Sort by timestamp and remove oldest items
      const sortedItems = allItems.sort((a, b) => b.timestamp - a.timestamp);
      const itemsToDelete = sortedItems.slice(MAX_HISTORY_ITEMS);

      for (const item of itemsToDelete) {
        await indexedDBManager.delete(type, item.id);
      }
    }

    // Log storage usage
    const storageEstimate = await indexedDBManager.getStorageEstimate();
    console.log('Storage usage:', {
      used: formatBytes(storageEstimate.usage),
      quota: formatBytes(storageEstimate.quota),
      percentage: ((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(2) + '%',
    });
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error;
  }
}

/**
 * Delete a specific history item by ID
 */
export async function deleteHistoryItem(type: HistoryType, id: string): Promise<void> {
  try {
    await indexedDBManager.delete(type, id);
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error;
  }
}

/**
 * Clear all history for a specific type
 */
export async function clearHistory(type: HistoryType): Promise<void> {
  try {
    await indexedDBManager.clear(type);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}

/**
 * Get total count of items
 */
export async function getHistoryCount(type: HistoryType): Promise<number> {
  try {
    return await indexedDBManager.count(type);
  } catch (error) {
    console.error('Error getting history count:', error);
    return 0;
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  usage: number;
  quota: number;
  usageFormatted: string;
  quotaFormatted: string;
  percentage: number;
}> {
  const estimate = await indexedDBManager.getStorageEstimate();

  return {
    usage: estimate.usage,
    quota: estimate.quota,
    usageFormatted: formatBytes(estimate.usage),
    quotaFormatted: formatBytes(estimate.quota),
    percentage: (estimate.usage / estimate.quota) * 100,
  };
}

// Export types for compatibility
export type { HistoryItem, HistoryType };
