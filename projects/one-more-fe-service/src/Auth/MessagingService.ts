import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';
import { environment } from '../../../../../src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  constants = inject(Constants);
  http = inject(HttpClient);
  private readonly apiUrl = 'https://api-cqdlel7gea-uc.a.run.app'; // URL del backend

  constructor() {}

  async getFCMToken(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      // ── Nativo (iOS / Android) ──
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive === 'granted') {
        const token = await FirebaseMessaging.getToken();
        return token.token ?? null;
      }
    } else {
      // ── Web browser ──
      try {
        const { receive } = await FirebaseMessaging.requestPermissions();
        if (receive !== 'granted') return null;

        const { token } = await FirebaseMessaging.getToken({
          vapidKey: environment.vapidKey  
        });
        return token ?? null;
      } catch (e) {
        console.warn('FCM web token non disponibile:', e);
        return null;
      }
    }
    return null;
  }

  apiGetFCMToken(id: number | undefined): Observable<string> {
    return this.http.get(this.constants.BasePath() + '/Soggetto/get-fcmToken/' + id, { responseType: 'text' });
  }

  async updateFcmToken(token: string): Promise<void> {
    await this.http.put(this.constants.BasePath() + '/user/update-fcm-token', { fcmToken: token }).toPromise();
  }

  // Funzione per inviare notifiche tramite il backend
  sendNotification(fcmToken: string, title: string, body: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-notification`, {
      fcmToken,
      title,
      body,
    });
  }
}
