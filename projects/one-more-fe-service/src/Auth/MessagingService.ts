import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Constants } from '../Constants';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private http = inject(HttpClient);
  private constants = inject(Constants);

  // Salva il token nel tuo DB tramite l'API
  async updateFcmToken(token: string): Promise<void> {
    const url = `${this.constants.BasePath()}/user/update-fcm-token`;
    return firstValueFrom(this.http.put<void>(url, { fcmToken: token }));
  }

  async deleteSpecificToken(token: string): Promise<void> {
    const url = `${this.constants.BasePath()}/user/delete-fcm-token`;
    return firstValueFrom(this.http.put<void>(url, { fcmToken: token }));
  }
}
