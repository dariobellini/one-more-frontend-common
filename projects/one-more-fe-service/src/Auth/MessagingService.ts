import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Constants } from '../Constants';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JWT } from 'google-auth-library';  // Per autenticazione OAuth 2.0
import * as fs from 'fs';

@Injectable({
  providedIn: 'root',
})

export class MessagingService {

  private readonly apiUrl = 'https://api-cqdlel7gea-uc.a.run.app';

  constructor(private http:HttpClient, private constants:Constants) {
    this.initializeFirebase();
  }

  // Inizializza Firebase per il Web e richiede il token
  async initializeFirebase() {
    if (Capacitor.isNativePlatform()) {
      // Se stai su una piattaforma mobile (iOS/Android)
      this.requestPermission();
    } else {
      // Se stai sul web, usa il Firebase Messaging Web SDK
      this.setupFirebaseWeb();
    }
  }

  // Richiedi i permessi e ottieni il token per piattaforme mobili (Capacitor)
  async requestPermission(): Promise<string> {
    try {
      // Usa il plugin Capacitor Firebase Messaging per i dispositivi mobili
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive === 'granted') {
        const token = await FirebaseMessaging.getToken();
        return token.token ?? '';
      } else {
        console.warn('Permessi per le notifiche non concessi.');
        return '';
      }
    } catch (error) {
      console.error('Errore durante la richiesta del token Firebase:', error);
      return '';
    }
  }

  async setupFirebaseWeb(): Promise<string | undefined> {
    const messaging = getMessaging(); // Ottieni l'istanza di Firebase Messaging

    // Richiedi i permessi di notifica dal browser
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        const token = await getToken(messaging, { vapidKey: 'BDmytqrcw7qZmf-w8cOtIJwe9j9Q9qsglAcMalIscFuXQnUEINgu-4ORVelhxunmwHVy1ho7fwx9-eynPUZqF5c' }); // Usa la tua VAPID_KEY
        return token;
      } catch (error) {
        console.error('Errore nel richiedere il token Web FCM:', error);
        return '';  // Restituisci una stringa vuota in caso di errore
      }
    } else {
      console.warn('Permessi per le notifiche non concessi nel web.');
      return '';  // Restituisci una stringa vuota se i permessi non sono concessi
    }

    // Ascolta i messaggi in foreground per il web
    onMessage(messaging, (payload: any) => {
      console.log('Messaggio ricevuto in foreground (web):', payload);
    });

    return undefined; // Restituisci 'undefined' se non raggiungi altre condizioni
  }

  apiGetFCMToken(id: number | undefined): Observable<string> {
    return this.http.get(this.constants.BasePath() + '/Soggetto/get-fcmToken/' + id, { responseType: 'text' });
  }

  // Metodo per inviare la notifica usando OAuth 2.0 con le credenziali di servizio
  async sendNotification(fcmToken: string, title: string, body: string) {
    return this.http.post('https://api-cqdlel7gea-uc.a.run.app/send-notification', {
      fcmToken,
      title,
      body
    }).toPromise();
  }
}
