import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  constructor(private afMessaging: AngularFireMessaging) {}

  // Richiedi i permessi per le notifiche e recupera il token FCM
  async requestPermission(): Promise<string> {
    try {
      const token = await this.afMessaging.requestToken.pipe(take(1)).toPromise();
      return token || '';  // Restituisce il token se presente, altrimenti una stringa vuota
    } catch (error) {
      console.error('Errore nel richiedere il token FCM', error);
      return '';  // In caso di errore, restituisce una stringa vuota
    }
  }

  
  // Ascolta i messaggi ricevuti
  async receiveMessage() {
    this.afMessaging.messages
      .subscribe((message) => {
        console.log('Messaggio ricevuto:', message);
      });
  }
}