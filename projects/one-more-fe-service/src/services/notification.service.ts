import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return null;

    const { receive } = await FirebaseMessaging.checkPermissions();
    if (receive === 'denied') return null;
    if (receive !== 'granted') {
      const { receive: newPerm } = await FirebaseMessaging.requestPermissions();
      if (newPerm !== 'granted') return null;
    }
    const { token } = await FirebaseMessaging.getToken();
    return token;
  }

  listenForegroundNotifications(): void {
    if (!Capacitor.isNativePlatform()) return;

    FirebaseMessaging.addListener('notificationReceived', () => {});
  }
}