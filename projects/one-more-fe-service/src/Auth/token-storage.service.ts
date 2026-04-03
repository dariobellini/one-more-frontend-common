import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Constants } from '../Constants';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private constants = inject(Constants);
  private jwtToken: string | null = null;

  async init(): Promise<void> {
    const jwtResult = await Preferences.get({ key: this.constants.UserApiJwt() });
    this.jwtToken = jwtResult.value;
  }

  getJwtSync(): string | null {
    return this.jwtToken;
  }

  async setTokens(jwt: string): Promise<void> {
    this.jwtToken = jwt;
    await Preferences.set({ key: this.constants.UserApiJwt(), value: jwt });
  }

  async clearTokens(): Promise<void> {
    this.jwtToken = null;
    await Preferences.remove({ key: this.constants.UserApiJwt() });
  }

  async initialize(): Promise<void> {
        const { value } = await Preferences.get({ key: 'auth_token' });
        this.jwtToken = value;
    }
}
