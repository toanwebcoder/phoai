// IndexedDB wrapper for storing history with larger capacity

const DB_NAME = 'PhoAI_HistoryDB';
const DB_VERSION = 1;

export type HistoryType = 'scanner' | 'food-recognition' | 'price-check';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  timestamp: number;
  image: string; // base64 image (compressed)
  thumbnail: string; // smaller thumbnail for list view
  result: any;
  location?: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB not available in SSR'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for each history type
        const types: HistoryType[] = ['scanner', 'food-recognition', 'price-check'];

        types.forEach((type) => {
          if (!db.objectStoreNames.contains(type)) {
            const objectStore = db.createObjectStore(type, { keyPath: 'id' });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        });
      };
    });

    return this.dbPromise;
  }

  async getAll(type: HistoryType): Promise<HistoryItem[]> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(type, 'readonly');
      const objectStore = transaction.objectStore(type);
      const index = objectStore.index('timestamp');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(null, 'prev'); // Newest first
        const items: HistoryItem[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            items.push(cursor.value);
            cursor.continue();
          } else {
            resolve(items);
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error getting all items:', error);
      return [];
    }
  }

  async add(type: HistoryType, item: HistoryItem): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(type, 'readwrite');
      const objectStore = transaction.objectStore(type);

      return new Promise((resolve, reject) => {
        const request = objectStore.add(item);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  async delete(type: HistoryType, id: string): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(type, 'readwrite');
      const objectStore = transaction.objectStore(type);

      return new Promise((resolve, reject) => {
        const request = objectStore.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  async clear(type: HistoryType): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(type, 'readwrite');
      const objectStore = transaction.objectStore(type);

      return new Promise((resolve, reject) => {
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error clearing store:', error);
      throw error;
    }
  }

  async count(type: HistoryType): Promise<number> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(type, 'readonly');
      const objectStore = transaction.objectStore(type);

      return new Promise((resolve, reject) => {
        const request = objectStore.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error counting items:', error);
      return 0;
    }
  }

  // Get estimated storage usage
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }
}

// Singleton instance
export const indexedDBManager = new IndexedDBManager();
