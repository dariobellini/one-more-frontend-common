import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from 'firebase/auth';
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Constants } from '../Constants';
import { ApiJwtPayload } from '../EntityInterface/ApiJwtPayload';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { Role } from '../Enum/Role';

@Injectable({
    providedIn: 'root'
})

export class NewAuthService {

    googleProvider = new GoogleAuthProvider();

    private loggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());
    private isUser$ = new BehaviorSubject<boolean>(this.isUser());
    private isShop$ = new BehaviorSubject<boolean>(this.isShop());

    constructor(private constants: Constants) { }

    setToken(token: JwtResponseDto) {
        localStorage.setItem(this.constants.UserApiJwt(), token.jwt);
        localStorage.setItem(this.constants.UserApiRefreshToken(), token.refreshToken);
        this.loggedIn$.next(this.hasValidToken());
        this.isUser$.next(this.isUser());
        this.isShop$.next(this.isShop());
    }

    isLoggedIn(): Observable<boolean> {
        return this.loggedIn$.asObservable().pipe(
            tap(value => console.log('check isloggedIn:', value)));
    }

    loggedUserIsUser(): Observable<boolean> {
        return this.isUser$.asObservable().pipe(
            tap(value => console.log('check isUser:', value)));
    }

    loggedUserIsShop(): Observable<boolean> {
        return this.isShop$.asObservable().pipe(
            tap(value => console.log('check isShop:', value)));
    }

    logOut(): void {
        // rimuovi token
        localStorage.removeItem(this.constants.UserApiJwt());
        localStorage.removeItem(this.constants.UserApiRefreshToken());

        // aggiorna stati osservabili
        this.loggedIn$.next(false);
        this.isUser$.next(false);
        this.isShop$.next(false);
    }

    //#region  private methods

    private hasValidToken(): boolean {
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

    private getRolesFromToken(): string[] {
        const token = this.getToken();
        if (!token) return [];

        try {
            const decoded = this.getDecodedToken(token);
            console.log(decoded);
            if (decoded?.roles) return decoded.roles;
            else return [];

        } catch {
            return [];
        }
    }
    private isUser(): boolean {
        const roles = this.getRolesFromToken();
        return roles.includes(Role[Role.user]);
    }
    private isShop(): boolean {
        const roles = this.getRolesFromToken();
        return roles.includes(Role[Role.shop]);
    }

    private getToken(): string | null {
        return localStorage.getItem(this.constants.UserApiJwt());
    }

    private getDecodedToken(token: string): ApiJwtPayload | null {
        try {
            const decoded: any = jwtDecode(token);

            return {
                sub: decoded.sub,
                exp: decoded.exp,
                name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                roles: Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
                    ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                    : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]].filter(Boolean)
            };
        } catch (error) {
            console.error("Errore nella decodifica JWT:", error);
            return null;
        }
    }

    //#endregion
}
