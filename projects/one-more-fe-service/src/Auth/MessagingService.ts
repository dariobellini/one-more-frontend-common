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

  apiTestPush(title: string, message: string): Observable<any> {
  const url = `${this.constants.BasePath()}/user/test-push`;
  return this.http.post(url, {}, {
    params: {
      title: title,
      message: message
    }
  });
}
}
