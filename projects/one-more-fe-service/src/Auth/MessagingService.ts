import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../Constants';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly apiUrl = 'https://api-cqdlel7gea-uc.a.run.app'; // URL del backend

  constructor(private http: HttpClient, private constants:Constants) {}

  // Ottenere il token FCM (mobile o web)
  async getFCMToken(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive === 'granted') {
        const token = await FirebaseMessaging.getToken();
        return token.token ?? null;
      }
    } else {
      console.warn('Notifiche web disabilitate per motivi di sicurezza.');
    }
    return null;
  }

  apiGetFCMToken(id: number | undefined): Observable<string> {
    return this.http.get(this.constants.BasePath() + '/Soggetto/get-fcmToken/' + id, { responseType: 'text' });
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
