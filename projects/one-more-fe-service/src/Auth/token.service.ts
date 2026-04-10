import { Injectable, EventEmitter, inject } from '@angular/core';
import { ApiJwtPayload } from '../EntityInterface/ApiJwtPayload';
import { jwtDecode } from 'jwt-decode';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class TokenService {

    tokenStorage = inject(TokenStorageService);

    public tokenChanged: EventEmitter<string> = new EventEmitter();

    getToken(): string | null {
      return this.tokenStorage.getJwtSync();
    }

    async setToken(jwt: string) {
        await this.tokenStorage.setTokens(jwt);
    }

    async clearToken(): Promise<void> {
        await this.tokenStorage.clearTokens();
    }

    getDecodedToken(token: string): ApiJwtPayload | null {
      try {
        const decoded: any = jwtDecode(token);
        return {
          sub: decoded.sub,
          exp: decoded.exp,
          name: decoded.name || decoded.email,
          roles: Array.isArray(decoded.roles) ? decoded.roles : (decoded.roles ? [decoded.roles] : []),
          idSoggetto: decoded.uid
        };
      } catch {
        return null;
      }
    }

    hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<ApiJwtPayload>(token);
            const now = Math.floor(Date.now() / 1000); 
            
            return decoded.exp > now;
        } catch (e) {
            return false;
        }
    }

    getRolesFromToken(): string[] {
      const token = this.getToken();
      if (!token) return [];
      const decoded = this.getDecodedToken(token);
      return decoded?.roles || [];
    }

}
