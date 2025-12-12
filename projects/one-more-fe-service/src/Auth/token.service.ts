import { Injectable, EventEmitter } from '@angular/core';
import { ApiJwtPayload } from '../EntityInterface/ApiJwtPayload';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor(private constants: Constants
    ) { }

    public tokenChanged: EventEmitter<string> = new EventEmitter();

    getToken(): string | null {
        return localStorage.getItem(this.constants.UserApiJwt());
    }

    getTokenPayload(): ApiJwtPayload | null {
        var token = this.getToken();
        if (token)
            return this.getDecodedToken(token);
        else return null;
    }

    setToken(jwt: JwtResponseDto) {
        // this.tokenChanged.emit(jwt.jwt);
        localStorage.setItem(this.constants.UserApiJwt(), jwt.jwt);
        localStorage.setItem(this.constants.UserApiRefreshToken(), jwt.refreshToken);


        //   this.newAuthService.setStatusUserVerified();
    }

    getDecodedToken(token: string): ApiJwtPayload | null {
        try {
            const decoded: any = jwtDecode(token);
            const idAttivitaList = (decoded["id-attivita-list"] as string).split("-").map(s => s.trim());

            const jwt: ApiJwtPayload = {
                sub: decoded.sub,
                exp: decoded.exp,
                name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                roles: Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
                    ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                    : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]].filter(Boolean),
                isVerified: decoded["is-verified"] === "true" || decoded["is-verified"] === true || decoded["is-verified"] === "True",
                idSoggetto: decoded["id-soggetto"],
                idAttivitaList: idAttivitaList.map(num => parseInt(num.trim(), 10))
            };
            return jwt;
        } catch (error) {
            console.error("Errore nella decodifica JWT:", error);
            return null;
        }
    }

    hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<ApiJwtPayload>(token);
            const now = Math.floor(Date.now() / 1000); // in secondi
            return decoded.exp > now;
        } catch (e) {
            console.log(e);
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
