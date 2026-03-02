import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'offline-habit-loop-device-id';

/**
 * Get or create a persistent device ID.
 * Stored in localStorage for persistence across sessions.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

