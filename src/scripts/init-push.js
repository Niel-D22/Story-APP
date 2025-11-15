// File: src/scripts/init-push.js
import PushNotification from './utils/push-notification.js';

class PushNotificationInit {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      console.log('[Push Init] Already initialized');
      return;
    }

    console.log('[Push Init] Starting initialization...');

    try {
      // Cek support browser
      if (!PushNotification.isSupported()) {
        console.warn('[Push Init] Push notification not supported');
        return;
      }

      // Tunggu service worker ready
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
        console.log('[Push Init] Service Worker ready');
      }

      // Cek apakah user sudah login
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('[Push Init] User not logged in, skipping push setup');
        return;
      }

      // Cek permission saat ini
      const currentPermission = Notification.permission;
      console.log('[Push Init] Current permission:', currentPermission);

      if (currentPermission === 'granted') {
        // Langsung subscribe jika sudah granted
        await this.subscribe();
      } else if (currentPermission === 'default') {
        // Tampilkan prompt untuk request permission
        await this.showPermissionPrompt();
      } else {
        console.log('[Push Init] Permission denied');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[Push Init] Initialization error:', error);
    }
  }

  async subscribe() {
    try {
      console.log('[Push Init] Subscribing to push service...');
      const subscription = await PushNotification.subscribe();
      console.log('[Push Init] Subscription successful:', subscription);
      
      // Simpan status di localStorage
      localStorage.setItem('pushNotificationEnabled', 'true');
      
      return subscription;
    } catch (error) {
      console.error('[Push Init] Subscription error:', error);
      throw error;
    }
  }

  async showPermissionPrompt() {
    // Buat UI prompt custom (opsional, bisa langsung requestPermission)
    const shouldAsk = confirm(
      'Aktifkan notifikasi untuk mendapatkan update story terbaru?'
    );

    if (shouldAsk) {
      const granted = await PushNotification.requestPermission();
      if (granted) {
        await this.subscribe();
      }
    }
  }

  // Method untuk test notification
  async testNotification() {
    try {
      await PushNotification.testNotification();
      console.log('[Push Init] Test notification sent');
    } catch (error) {
      console.error('[Push Init] Test notification error:', error);
    }
  }

  // Method untuk unsubscribe
  async unsubscribe() {
    try {
      await PushNotification.unsubscribe();
      localStorage.removeItem('pushNotificationEnabled');
      console.log('[Push Init] Unsubscribed successfully');
    } catch (error) {
      console.error('[Push Init] Unsubscribe error:', error);
    }
  }

  // Cek apakah sudah subscribe
  async isSubscribed() {
    return await PushNotification.isSubscribed();
  }
}

export default new PushNotificationInit();