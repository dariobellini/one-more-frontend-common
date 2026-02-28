import { inject, Injectable } from '@angular/core';
import { EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from 'firebase/auth';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { BehaviorSubject, filter, finalize, firstValueFrom, Observable, shareReplay, tap, throwError } from 'rxjs';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { Role } from '../Enum/Role';
import { DeleteUtente, UserSession } from '../EntityInterface/Utente';
import { Firestore } from '@angular/fire/firestore';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ShopListDto } from '../Dtos/Responses/shops/ShopListDto'; 
import { HttpClient, HttpParams } from '@angular/common/http';
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
  
  private readonly shopsSubject = new BehaviorSubject<ShopListDto[] | null>(null);
  shops$: Observable<ShopListDto[] | null> = this.shopsSubject.asObservable();
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

  constructor() {}

  setStatusUserVerified(): void {
  this.loggedIn$.next(this.tokenService.hasValidToken());
  this.isShop$.next(this.isShop());
  this.isVerified$.next(this.isVerified());
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
  // aggiorna stati osservabili
  this.loggedIn$.next(false);
  this.isShop$.next(false);
  this.isVerified$.next(false);
  this.clearShops();

  // best effort: può fallire se refresh token mancante o già revocato
    try {
      await firstValueFrom(this.logoutApi());
    } catch (e) {
      console.warn('logoutApi failed (ignored):', e);
    }

    try {
      await this.tokenService.clearToken();
    } catch (e) {
      console.warn('clearToken failed (ignored):', e);
    }

    try {
      await signOut(this.firebaseAuth);
    } catch (e) {
      console.warn('firebase signOut failed (ignored):', e);
    }
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

  async checkEmailVerification(): Promise<boolean> {
    const user = await this.getCurrentUserFromAuth();
    
    if (!user) return false;
    if (!user.providerData || user.providerData.length === 0) return false;
    
    const isPasswordProvider =
      user.providerData.length === 1 &&
      user.providerData[0].providerId === 'password';
    
    if (isPasswordProvider) {
      return user.emailVerified === true;
    }
  
    // google / facebook / multi-provider
    return true;
  }

  async checkProviderLogin(): Promise<string> {

    const user = await this.getCurrentUserFromAuth();
    
    if(user){
      if(user && user.providerData.length == 0) 
        return '';
      if(user.providerData.length == 1 && user.providerData[0].providerId == "password")
        return user.email ?? '';
      else if(user.providerData.some(p => p.providerId === 'google.com'))
        return 'google.com';
      else if(user.providerData.some(p => p.providerId === 'facebook.com'))
        return 'facebook.com';
    }
    else return '';
    return '';
  }

  async getEmail(): Promise<string | null> {
    const user = await this.getCurrentUserFromAuth();
    console.log('Current user:', user);
    return user?.email || null;
  }

  async login(email: string, password: string): Promise<JwtResponseDto | undefined> {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    const token = await userCredential.user.getIdToken();
    const readealJwt = await firstValueFrom(this.UsernamePasswordLogin(token));

    if (readealJwt) {
      await this.tokenService.setToken(readealJwt);
      this.setStatusUserVerified();
      await this.favoritesApiService.Favorite();
    }

    return Promise.resolve(readealJwt);
  }

  passwordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.firebaseAuth, email);
  }

  async reauthenticateWithPassword(userEmail: string, userPassword: string): Promise<boolean> {
  const user = this.firebaseAuth.currentUser;
  if (!user) return false;

  await user.reload();

  try {
    const credential = EmailAuthProvider.credential(userEmail, userPassword);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error('Errore reauth password:', error);
    return false;
  }
}

async reauthenticateWithGooglePopup(): Promise<boolean> {
  const user = this.firebaseAuth.currentUser;
  if (!user) return false;

  await user.reload();

  try {
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider);
    return true;
  } catch (error) {
    console.error('Errore reauth google:', error);
    return false;
  }
}

async reauthenticateWithFacebookPopup(): Promise<boolean> {
  const user = this.firebaseAuth.currentUser;
  if (!user) return false;

  await user.reload();

  try {
    const provider = new FacebookAuthProvider();
    await reauthenticateWithPopup(user, provider);
    return true;
  } catch (error) {
    console.error('Errore reauth facebook:', error);
    return false;
  }
}

/**
 * Fallback: se typeLog non c’è o non torna, prova dai providerId di Firebase.
 * Se è password, non può chiedere qui la password -> ritorna false.
 */
async reauthenticateBestEffort(): Promise<boolean> {
  const user = this.firebaseAuth.currentUser;
  if (!user) return false;

  await user.reload();

  const providerIds = (user.providerData ?? []).map(p => p.providerId);

  if (providerIds.includes('google.com')) {
    return this.reauthenticateWithGooglePopup();
  }

  if (providerIds.includes('facebook.com')) {
    return this.reauthenticateWithFacebookPopup();
  }

  if (providerIds.includes('password')) {
    return false;
  }

  return false;
}

  hasShops$: Observable<boolean> = this.shops$.pipe(
    map(list => (list?.length ?? 0) > 0),
    distinctUntilChanged()
  );

  setShops(list: ShopListDto[]): void {
    this.shopsSubject.next(list ?? []);
  }

  clearShops(): void {
    this.shopsSubject.next([]);
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
      await this.tokenService.setToken(readealJwt);
      this.setStatusUserVerified();
      await this.favoritesApiService.Favorite();
    }


    return Promise.resolve(readealJwt);
  }

  refreshJwt(): Observable<JwtResponseDto> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    this.refreshInFlight$ = this.http
      .post<JwtResponseDto>(`${this.constants.BasePath()}/Auth/refresh-jwt`, { refreshToken })
      .pipe(
        tap(async (jwt) => await this.tokenService.setToken(jwt)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight$;
  }

  logoutApi(): Observable<CommonResDto> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/logout`, { refreshToken });
  }

  private apiServiceLogin(idToken: string, userType: number): Observable<JwtResponseDto> {
    const url = `${this.constants.BasePath()}/auth/service-login?idToken=${idToken}&userType=${userType}`;
    return this.http.get<JwtResponseDto>(url);
  }

  Delete(idReason: number): Observable<CommonResDto> {
      const params = new HttpParams()
        .set('idReason', idReason);
      return this.http.delete<CommonResDto>(this.constants.BasePath() + '/auth/delete', { params });
  }
}
