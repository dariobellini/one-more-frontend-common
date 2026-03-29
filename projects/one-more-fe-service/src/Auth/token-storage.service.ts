import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Constants } from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private constants = inject(Constants);
  private initialized = false;
  private jwtToken: string | null = null;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const jwtResult = await Preferences.get({ key: this.constants.UserApiJwt() });

    this.jwtToken = jwtResult.value;
    this.initialized = true;
  }

  getJwtSync(): string | null {
    return this.jwtToken;
  }

  /** @deprecated Il refresh token è ora gestito tramite cookie HttpOnly. Restituisce sempre null. */
  getRefreshTokenSync(): string | null {
    return null;
  }

  async setTokens(jwt: string, refreshToken: string | null): Promise<void> {
    this.jwtToken = jwt;

    await Preferences.set({ key: this.constants.UserApiJwt(), value: jwt });
  }

  async clearTokens(): Promise<void> {
    this.jwtToken = null;

    await Promise.all([
      Preferences.remove({ key: this.constants.UserApiJwt() }),
      // Rimuove anche l'eventuale refresh token salvato da versioni precedenti
      Preferences.remove({ key: this.constants.UserApiRefreshToken() })
    ]);
  }
}
