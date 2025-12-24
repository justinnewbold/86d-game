// ============================================
// CLOUD SAVE SYNC SERVICE
// ============================================

import { Platform } from 'react-native';
import type { GameState, Setup, SaveSlot } from '../types/game';

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';

// Cloud provider types
export type CloudProvider = 'firebase' | 'supabase' | 'custom' | 'none';

// Sync configuration
interface CloudSyncConfig {
  enabled: boolean;
  provider: CloudProvider;
  autoSync: boolean;
  syncInterval: number; // ms
  endpoint?: string;
  apiKey?: string;
}

// Cloud save data
interface CloudSaveData {
  userId: string;
  slots: SaveSlot[];
  lastSync: string;
  deviceId: string;
  version: string;
}

// Conflict resolution
interface SyncConflict {
  localSave: SaveSlot;
  cloudSave: SaveSlot;
  localTimestamp: number;
  cloudTimestamp: number;
}

// Default configuration
let config: CloudSyncConfig = {
  enabled: false,
  provider: 'none',
  autoSync: true,
  syncInterval: 60000, // 1 minute
};

let syncStatus: SyncStatus = 'idle';
let lastSyncTime: number | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Generate device ID
 */
const getDeviceId = (): string => {
  if (Platform.OS === 'web') {
    let deviceId = localStorage.getItem('86d_device_id');
    if (!deviceId) {
      deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('86d_device_id', deviceId);
    }
    return deviceId;
  }
  // For native, use a unique identifier
  return `native-${Platform.OS}-${Date.now()}`;
};

/**
 * Configure cloud sync
 */
export const configureCloudSync = (newConfig: Partial<CloudSyncConfig>): void => {
  config = { ...config, ...newConfig };

  if (config.enabled && config.autoSync) {
    startAutoSync();
  } else {
    stopAutoSync();
  }
};

/**
 * Get current sync status
 */
export const getSyncStatus = (): SyncStatus => syncStatus;

/**
 * Get last sync time
 */
export const getLastSyncTime = (): number | null => lastSyncTime;

/**
 * Start auto-sync interval
 */
const startAutoSync = (): void => {
  if (syncInterval) return;

  syncInterval = setInterval(() => {
    if (config.enabled && syncStatus !== 'syncing') {
      syncToCloud();
    }
  }, config.syncInterval);
};

/**
 * Stop auto-sync interval
 */
const stopAutoSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

/**
 * Sync local saves to cloud
 */
export const syncToCloud = async (): Promise<{ success: boolean; error?: string }> => {
  if (!config.enabled || config.provider === 'none') {
    return { success: false, error: 'Cloud sync not configured' };
  }

  syncStatus = 'syncing';

  try {
    // Get local saves
    const localSaves = await getLocalSaves();

    // Prepare cloud data
    const cloudData: CloudSaveData = {
      userId: config.apiKey || 'anonymous',
      slots: localSaves,
      lastSync: new Date().toISOString(),
      deviceId: getDeviceId(),
      version: '1.0.0',
    };

    // Send to cloud based on provider
    switch (config.provider) {
      case 'custom':
        if (config.endpoint) {
          await syncWithCustomEndpoint(config.endpoint, cloudData);
        }
        break;
      case 'firebase':
        // Firebase implementation would go here
        console.log('Firebase sync not implemented');
        break;
      case 'supabase':
        // Supabase implementation would go here
        console.log('Supabase sync not implemented');
        break;
    }

    syncStatus = 'success';
    lastSyncTime = Date.now();
    return { success: true };
  } catch (error) {
    syncStatus = 'error';
    return { success: false, error: String(error) };
  }
};

/**
 * Sync with custom endpoint
 */
const syncWithCustomEndpoint = async (endpoint: string, data: CloudSaveData): Promise<void> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
};

/**
 * Fetch saves from cloud
 */
export const fetchFromCloud = async (): Promise<{ success: boolean; saves?: SaveSlot[]; error?: string }> => {
  if (!config.enabled || config.provider === 'none') {
    return { success: false, error: 'Cloud sync not configured' };
  }

  syncStatus = 'syncing';

  try {
    let cloudSaves: SaveSlot[] = [];

    switch (config.provider) {
      case 'custom':
        if (config.endpoint) {
          const response = await fetch(config.endpoint, {
            method: 'GET',
            headers: {
              ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
            },
          });

          if (response.ok) {
            const data = await response.json();
            cloudSaves = data.slots || [];
          }
        }
        break;
      // Other providers would be implemented similarly
    }

    syncStatus = 'success';
    lastSyncTime = Date.now();
    return { success: true, saves: cloudSaves };
  } catch (error) {
    syncStatus = 'error';
    return { success: false, error: String(error) };
  }
};

/**
 * Get local saves from storage
 */
const getLocalSaves = async (): Promise<SaveSlot[]> => {
  const saves: SaveSlot[] = [];

  for (let slot = 1; slot <= 5; slot++) {
    const key = `86d_save_slot_${slot}`;
    let data: string | null = null;

    if (Platform.OS === 'web') {
      data = localStorage.getItem(key);
    } else {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      data = await AsyncStorage.default.getItem(key);
    }

    if (data) {
      try {
        saves.push(JSON.parse(data));
      } catch {
        // Invalid save data
      }
    }
  }

  return saves;
};

/**
 * Handle sync conflict
 */
export const resolveConflict = (
  conflict: SyncConflict,
  resolution: 'local' | 'cloud' | 'newest'
): SaveSlot => {
  switch (resolution) {
    case 'local':
      return conflict.localSave;
    case 'cloud':
      return conflict.cloudSave;
    case 'newest':
      return conflict.localTimestamp > conflict.cloudTimestamp
        ? conflict.localSave
        : conflict.cloudSave;
  }
};

/**
 * Export save as shareable code/QR data
 */
export const exportSaveAsCode = (save: SaveSlot): string => {
  try {
    const data = JSON.stringify(save);
    // Base64 encode for sharing
    if (Platform.OS === 'web') {
      return btoa(encodeURIComponent(data));
    }
    // For native, use Buffer
    return Buffer.from(data).toString('base64');
  } catch {
    return '';
  }
};

/**
 * Import save from code
 */
export const importSaveFromCode = (code: string): SaveSlot | null => {
  try {
    let data: string;
    if (Platform.OS === 'web') {
      data = decodeURIComponent(atob(code));
    } else {
      data = Buffer.from(code, 'base64').toString('utf8');
    }
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Check if cloud sync is available
 */
export const isCloudSyncAvailable = (): boolean => {
  return config.enabled && config.provider !== 'none';
};

/**
 * Cleanup
 */
export const cleanup = (): void => {
  stopAutoSync();
};

export default {
  configureCloudSync,
  getSyncStatus,
  getLastSyncTime,
  syncToCloud,
  fetchFromCloud,
  resolveConflict,
  exportSaveAsCode,
  importSaveFromCode,
  isCloudSyncAvailable,
  cleanup,
};
