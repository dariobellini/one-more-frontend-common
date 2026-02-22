import { inject, Injectable } from '@angular/core';
import { deleteUser, EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from 'firebase/auth';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { BehaviorSubject, filter, finalize, firstValueFrom, Observable, shareReplay, tap, throwError } from 'rxjs';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { Role } from '../Enum/Role';
import { DeleteUtente, UserSession, Utente } from '../EntityInterface/Utente';
import { deleteDoc, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';

import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { FavoritesApiService } from '../services/favorites-api.service';
import { CommonResDto } from '../Dtos/Responses/CommonResDto';
import { SignUpReqDto } from '../Dtos/Requests/auth/SignUpReqDto';

@Injectable({
  providedIn: 'root'
})

export class NewAuthService {

  constants = inject(Constants);
  firestore = inject(Firestore);
  firebaseAuth = inject(Auth);
  http = inject(HttpClient);
  tokenService = inject(TokenService);
  favoritesApiService = inject(FavoritesApiService);

  private currentUser$ = authState(this.firebaseAuth).pipe(
    filter(u => !!u)
  )

  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  private loggedIn$ = new BehaviorSubject<boolean>(this.tokenService.hasValidToken());
  private isVerified$ = new BehaviorSubject<boolean>(this.isVerified());
  private isShop$ = new BehaviorSubject<boolean>(this.isShop());
  esito!: string;
  userSession!: UserSession | null;
  language: string | undefined;
  position !: GeolocationPosition;
  utente!: DeleteUtente;
  isReautenticated: boolean = false;
  idPage!: number;
  private refreshInFlight$: Observable<JwtResponseDto> | null = null;

  constructor() { }

  setStatusUserVerified(): void {
    this.loggedIn$.next(this.tokenService.hasValidToken());
    this.isShop$.next(this.isShop());
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  loggedUserIsVerified(): Observable<boolean> {
    return this.isVerified$.asObservable();
  }

  async getCurrentUserFromAuth(): Promise<User | null> {
    return await this.firebaseAuth.currentUser;
  }

  loggedUserIsShop(): Observable<boolean> {
    return this.isShop$.asObservable();
  }

  async logOut(): Promise<void> {

    console.log('Logout iniziato'); // Log per debug
    // rimuovi token
    // aggiorna stati osservabili
    this.loggedIn$.next(false);
    this.isShop$.next(false);
    this.isVerified$.next(false);
    //chiama API logout

    await this.logoutApi().toPromise();

    localStorage.removeItem(this.constants.UserApiJwt());
    localStorage.removeItem(this.constants.UserApiRefreshToken());
    await signOut(this.firebaseAuth);

    console.log('Logout finito'); // Log per debug
  }

  getUserSession(): UserSession | null {
    const userSessionString = localStorage.getItem('userSession');
    return userSessionString ? JSON.parse(userSessionString) : null;
  }

  GetUserJwt(uId: string): Observable<string> {
    return this.http.get(this.constants.BasePath() + '/auth/get-jwt?uId=' + uId, {
      responseType: 'text' // Specifica che la risposta è una stringa
    });
  }

  private UsernamePasswordLogin(idToken: string): Observable<JwtResponseDto> {
    return this.http.get<JwtResponseDto>(this.constants.BasePath() + '/auth/username-password-login?idToken=' + idToken);
  }

  signUp(req: SignUpReqDto): Observable<CommonResDto> {
    return this.http.post<CommonResDto>(
      this.constants.BasePath() + '/auth/sign-up',
      req
    );
  }

  async login(email: string, password: string): Promise<JwtResponseDto | undefined> {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    const token = await userCredential.user.getIdToken();
    const readealJwt = await firstValueFrom(this.UsernamePasswordLogin(token));

    if (readealJwt) {
      this.tokenService.setToken(readealJwt);
      this.setStatusUserVerified();
      await this.favoritesApiService.Favorite();
    }

    return Promise.resolve(readealJwt);
  }

  passwordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.firebaseAuth, email);
  }

  async reauthenticateUser(userEmail: string, userPassword: string): Promise<boolean> {
    const user = this.firebaseAuth.currentUser;
    this.isReautenticated = false;
    if (user) {
      const credential = EmailAuthProvider.credential(userEmail, userPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        this.isReautenticated = true;
      } catch (error) {
        console.error('Errore durante la ri-autenticazione:', error);
        this.isReautenticated = false;
      }
    }
    return this.isReautenticated;
  }

  async deleteUserAccount(): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    let userDocData: any; // Variabile per tenere i dati del documento utente
    try {
      if (user) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);

        // Controlla se il documento esiste e ottieni i dati per un possibile ripristino
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          userDocData = userDocSnap.data(); // Salva i dati in caso di rollback
        } else {
          throw new Error('Documento utente non trovato.');
        }

        // Elimina il documento
        await deleteDoc(userDocRef);

        // Prova a fare il signOut e a eliminare l'utente
        await signOut(this.firebaseAuth);
        await deleteUser(user);

        this.logOut();
      } else {
        throw new Error('Errore: Nessun utente autenticato.');
      }
    } catch (error) {

      // Rollback: ripristina il documento se il deleteUser fallisce
      if (user && userDocData) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userDocRef, userDocData);
      }
      throw error; // Rilancia l'errore per gestirlo nel metodo chiamante
    }
  }

  //#region  private methods

  private isVerified(): boolean {
    const token = this.tokenService.getToken();
    if (!token) return false;

    try {
      const decoded = this.tokenService.getDecodedToken(token);
      if (decoded?.isVerified) return decoded.isVerified;
      else return false;

    } catch {
      return false;
    }
  }
  private isShop(): boolean {
    const roles = this.tokenService.getRolesFromToken();
    return roles.includes(Role[Role.shop]);
  }

  //#endregion


  async ServiceLogIn(userType: number): Promise<JwtResponseDto | undefined> {

    let chosenProvider;
    if (userType === 2) {
      chosenProvider = this.googleProvider;
    } else if (userType === 3) {
      chosenProvider = this.facebookProvider;
    } else {
      throw new Error('Provider non gestito!');
    }

    const userCredential = await signInWithPopup(this.firebaseAuth, chosenProvider);

    const idToken = await userCredential.user.getIdToken();

    const readealJwt = await firstValueFrom(this.apiServiceLogin(idToken, userType));

    if (readealJwt) {
      this.tokenService.setToken(readealJwt);
      this.setStatusUserVerified();
      await this.favoritesApiService.Favorite();
    }


    return Promise.resolve(readealJwt);
  }

  apiInsertNewUtente(utente: Utente): Observable<any> {
    return this.http.post<Utente>(this.constants.BasePath() + '/Soggetto/insert-utente', utente);
  }

  apiDeleteUtente(user: UserSession | null, reason: string | null): Observable<any> {
    const utente = new DeleteUtente();
    if (user) {
      utente.email = user.email ? user.email : '';
      utente.id = user.idSoggetto ? user.idSoggetto : 0;
      utente.uid = user.uid ? user.uid : '';
      utente.reason = reason ? reason : '';
    }

    const options = {
      body: utente
    };

    return this.http.delete<DeleteUtente>(this.constants.BasePath() + '/Soggetto/delete-utente', options);
  }

  refreshJwt(): Observable<JwtResponseDto> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = localStorage.getItem(this.constants.UserApiRefreshToken());

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    this.refreshInFlight$ = this.http
      .post<JwtResponseDto>(`${this.constants.BasePath()}/Auth/refresh-jwt`, { refreshToken })
      .pipe(
        tap((jwt) => this.tokenService.setToken(jwt)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight$;
  }

  logoutApi(): Observable<CommonResDto> {
    const refreshToken = localStorage.getItem(this.constants.UserApiRefreshToken());

    console.log('Logout API chiamato. Refresh token:', refreshToken); // Log per debug
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/logout`, { refreshToken });
  }

  private apiServiceLogin(idToken: string, userType: number): Observable<JwtResponseDto> {
    const url = `${this.constants.BasePath()}/auth/service-login?idToken=${idToken}&userType=${userType}`;
    return this.http.get<JwtResponseDto>(url);
  }
}
