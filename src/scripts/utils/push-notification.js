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

  async sendSubscriptionToServer(subscription) {
  console.log('[Push] Sending subscription to server...');

  try {
    const token = localStorage.getItem("accessToken");

    if (!token) throw new Error("No token found");

    // ubah subscription ke object biasa
    const plainSub = subscription.toJSON();

    // hapus field yang tidak diterima server Dicoding
    delete plainSub.expirationTime;

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plainSub),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Push] Server subscription failed:', result);
      throw new Error(result.message || 'Failed to subscribe');
    }

    console.log('[Push] Subscription sent successfully:', result);
    return result;
  } catch (err) {
    console.error('[Push] Could not send subscription to server:', err);
    throw err;
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