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
  private refreshToken: string | null = null;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const [jwtResult, refreshResult] = await Promise.all([
      Preferences.get({ key: this.constants.UserApiJwt() }),
      Preferences.get({ key: this.constants.UserApiRefreshToken() })
    ]);

    this.jwtToken = jwtResult.value;
    this.refreshToken = refreshResult.value;
    this.initialized = true;
  }

  getJwtSync(): string | null {
    return this.jwtToken;
  }

  getRefreshTokenSync(): string | null {
    return this.refreshToken;
  }

  async setTokens(jwt: string, refreshToken: string): Promise<void> {
    this.jwtToken = jwt;
    this.refreshToken = refreshToken;

    await Promise.all([
      Preferences.set({ key: this.constants.UserApiJwt(), value: jwt }),
      Preferences.set({ key: this.constants.UserApiRefreshToken(), value: refreshToken })
    ]);
  }

  async clearTokens(): Promise<void> {
    this.jwtToken = null;
    this.refreshToken = null;

    await Promise.all([
      Preferences.remove({ key: this.constants.UserApiJwt() }),
      Preferences.remove({ key: this.constants.UserApiRefreshToken() })
    ]);
  }
}
