import { Injectable, EventEmitter, inject } from '@angular/core';
import { ApiJwtPayload } from '../EntityInterface/ApiJwtPayload';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { jwtDecode } from 'jwt-decode';
import { TokenStorageService } from './token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constants = inject(Constants);
    tokenStorage = inject(TokenStorageService);
    constructor() { }

    public tokenChanged: EventEmitter<string> = new EventEmitter();

    async initializeTokenStorage(): Promise<void> {
        await this.tokenStorage.init();
    }

    getToken(): string | null {
        return this.tokenStorage.getJwtSync();
    }

    getRefreshToken(): string | null {
        return this.tokenStorage.getRefreshTokenSync();
    }

    getTokenPayload(): ApiJwtPayload | null {
        var token = this.getToken();
        if (token)
            return this.getDecodedToken(token);
        else return null;
    }

    async setToken(jwt: JwtResponseDto) {
        await this.tokenStorage.setTokens(jwt.jwt, jwt.refreshToken ?? null);
    }

    async clearToken(): Promise<void> {
        await this.tokenStorage.clearTokens();
    }

    getDecodedToken(token: string): ApiJwtPayload | null {
        try {
            const decoded: any = jwtDecode(token);
            //const idAttivitaList = (decoded["id-attivita-list"] as string).split("-").map(s => s.trim());

            const jwt: ApiJwtPayload = {
                sub: decoded.sub,
                exp: decoded.exp,
                name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                roles: Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
                    ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                    : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]].filter(Boolean),
                idSoggetto: decoded["id-soggetto"]
                //idAttivitaList: idAttivitaList.map(num => parseInt(num.trim(), 10))
            };
            return jwt;
        } catch (error) {
            return null;
        }
    }

    // NOTE: token refresh is handled by NewAuthService to avoid circular
    // dependency between TokenService and NewAuthService. TokenService keeps
    // only synchronous helpers for checking token presence/expiry.

    /**
     * Synchronous check whether the current JWT exists and is not expired.
     * Kept synchronous for callers that need a quick boolean without IO.
     */
    hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<ApiJwtPayload>(token);
            const now = Math.floor(Date.now() / 1000); // in seconds
            return decoded.exp > now;
        } catch (e) {
            return false;
        }
    }

    getRolesFromToken(): string[] {
        const token = this.getToken();
        if (!token) return [];

        try {
            const decoded = this.getDecodedToken(token);
            if (decoded?.roles) return decoded.roles;
            else return [];

        } catch {
            return [];
        }
    }

}
