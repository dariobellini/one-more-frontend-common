import { Injectable, EventEmitter, inject } from '@angular/core';
import { ApiJwtPayload } from '../EntityInterface/ApiJwtPayload';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { jwtDecode } from 'jwt-decode';
import { TokenStorageService } from './token-storage.service';
import { NewAuthService } from './new-auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constants = inject(Constants);
    tokenStorage = inject(TokenStorageService);
    newAuthService = inject(NewAuthService);
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
        // this.tokenChanged.emit(jwt.jwt);
        await void this.tokenStorage.setTokens(jwt.jwt, jwt.refreshToken);
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
                isVerified: decoded["is-verified"] === "true" || decoded["is-verified"] === true || decoded["is-verified"] === "True",
                idSoggetto: decoded["id-soggetto"]
                //idAttivitaList: idAttivitaList.map(num => parseInt(num.trim(), 10))
            };
            return jwt;
        } catch (error) {
            console.error("Errore nella decodifica JWT:", error);
            return null;
        }
    }

    /**
     * Check token validity and optionally refresh if it's about to expire.
     * This is an async helper that callers should use when they can await
     * (for example before performing important API calls). It will attempt
     * a refresh only when the token expires within `thresholdSeconds`.
     *
     * @param thresholdSeconds seconds before expiry to trigger a refresh (default 30s)
     */
    async hasValidTokenOrRefresh(thresholdSeconds = 30): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<ApiJwtPayload>(token);
            const now = Math.floor(Date.now() / 1000);

            // If token is valid for longer than threshold, we're good.
            if (decoded.exp > now + thresholdSeconds) return true;
        } catch (e) {
            // fallthrough to attempt refresh
        }

        // token missing or expiring soon/expired -> attempt refresh
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            await this.clearToken();
            return false;
        }

        try {
            const jwt = await firstValueFrom(this.newAuthService.refreshJwt());
            return !!(jwt && jwt.jwt);
        } catch (err) {
            await this.clearToken();
            return false;
        }
    }

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
