// Helper untuk Push Notification
import CONFIG from '../config.js';

// VAPID Public Key dari API Dicoding
const VAPID_PUBLIC_KEY = 'BN7-r0Svv7CsTi18-OPYtJLVW0bfuZ1x1UhGcZOITSBBH4Z8zvfCHhrD2PrkqE3-RR_2zGX_A_p3V5qP5mjkJJg';

class PushNotification {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  // Convert VAPID key dari base64 ke Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Cek apakah browser support push notification
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request permission untuk notifikasi
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notification tidak didukung di browser ini');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe ke push service
  async subscribe() {
    try {
      // Pastikan SW sudah ready
      this.registration = await navigator.serviceWorker.ready;

      // Cek apakah sudah subscribe
      let subscription = await this.registration.pushManager.getSubscription();

      // Jika belum, buat subscription baru
      if (!subscription) {
        const vapidKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
      }

      this.subscription = subscription;
      console.log('[Push] Subscription created:', subscription);

      // ✅ PERBAIKAN: Aktifkan kirim subscription ke server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('[Push] Subscribe error:', error);
      throw error;
    }
  }

  // Unsubscribe dari push service
  async unsubscribe() {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Push] Unsubscribed successfully');
        this.subscription = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error);
      throw error;
    }
  }

  // Cek status subscription
  async isSubscribed() {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('[Push] Check subscription error:', error);
      return false;
    }
  }

  // ✅ PERBAIKAN: Kirim subscription ke server dengan endpoint yang benar
  async sendSubscriptionToServer(subscription) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) {
      throw new Error('User not authenticated');
    }

    const subscriptionToSend = subscription.toJSON();
    delete subscriptionToSend.expirationTime;

    try {
      // ✅ PERBAIKAN: Gunakan endpoint yang benar sesuai dokumentasi Dicoding
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      body: JSON.stringify(subscriptionToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Push] Server subscription failed:', errorData);
        throw new Error(`Failed to subscribe: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('[Push] Subscription sent to server successfully:', result);
      return result;
    } catch (error) {
      console.error('[Push] Could not send subscription to server:', error);
      throw error;
    }
  }

  // Test push notification (untuk development)
  async testNotification() {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    await this.registration.showNotification('Test Notifikasi', {
      body: 'Ini adalah test notifikasi dari Story Map',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      actions: [
        { action: 'open', title: 'Buka' },
        { action: 'close', title: 'Tutup' },
      ],
    });
  }
}

export default new PushNotification();