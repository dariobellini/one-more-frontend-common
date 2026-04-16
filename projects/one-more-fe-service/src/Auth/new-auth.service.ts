import { inject, Injectable } from '@angular/core';
import { 
  EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, 
  reauthenticateWithCredential, reauthenticateWithPopup, 
  sendPasswordResetEmail, signInWithEmailAndPassword, 
  signInWithPopup, User, signOut, getIdToken 
} from 'firebase/auth';
import { Auth, authState } from '@angular/fire/auth';
import { BehaviorSubject, filter, firstValueFrom, from, Observable } from 'rxjs';
import { map, distinctUntilChanged, take, switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Constants } from '../Constants';
import { Role } from '../Enum/Role';
import { ShopListDto } from '../Dtos/Responses/shops/ShopListDto';
import { TokenService } from './token.service';
import { FavoritesApiService } from '../services/favorites-api.service';
import { CommonResDto } from '../Dtos/Responses/CommonResDto';
import { SignUpReqDto } from '../Dtos/Requests/auth/SignUpReqDto';
import { CacheServiceV2 } from '../public-api';
import { NotificationService } from '../services/notification.service';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Injectable({ providedIn: 'root' })
export class NewAuthService {
  // Iniezioni
  private constants = inject(Constants);
  private firebaseAuth = inject(Auth);
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private favoritesApiService = inject(FavoritesApiService);
  private notificationService = inject(NotificationService);
  private cache = inject(CacheServiceV2);

  // Observable di Stato
  private readonly shopsSubject = new BehaviorSubject<ShopListDto[] | null>(null);
  shops$ = this.shopsSubject.asObservable();
  
  private loggedIn$ = new BehaviorSubject<boolean>(this.tokenService.hasValidToken());
  private isShop$ = new BehaviorSubject<boolean>(this.isShop());
  private canManagePromoSubject = new BehaviorSubject<boolean>(this.canManagePromo());
  private canValidateCouponSubject = new BehaviorSubject<boolean>(this.canValidateCoupon());

  canManagePromo$ = this.canManagePromoSubject.asObservable();
  canValidateCoupon$ = this.canValidateCouponSubject.asObservable();

  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();

  constructor() {
    void this.refreshLoginState();
  }

  // --- LOGICA DI LOGIN ---

  async login(email: string, password: string): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    await this.syncWithBackendAndRefresh(userCredential.user);
  }

  async ServiceLogIn(userType: number): Promise<void> {
  let userFirebase: User;

  if (Capacitor.isNativePlatform()) {
    let result;
    if (userType === 2) {
      result = await FirebaseAuthentication.signInWithGoogle();
    } else {
      result = await FirebaseAuthentication.signInWithFacebook();
    }

    // Autentica anche il Firebase JS SDK con le credenziali native
    const { GoogleAuthProvider, FacebookAuthProvider, signInWithCredential, OAuthCredential } = await import('firebase/auth');
    
    let credential;
    if (userType === 2) {
      credential = GoogleAuthProvider.credential(result.credential?.idToken);
    } else {
      credential = FacebookAuthProvider.credential(result.credential?.accessToken!);
    }
    
    const userCredential = await signInWithCredential(this.firebaseAuth, credential);
    userFirebase = userCredential.user;
  } else {
    const provider = userType === 2 ? this.googleProvider : this.facebookProvider;
    const userCredential = await signInWithPopup(this.firebaseAuth, provider);
    userFirebase = userCredential.user;
  }

  await this.syncWithBackendAndRefresh(userFirebase);
  await this.favoritesApiService.Favorite();
}

  private async syncWithBackendAndRefresh(user: User): Promise<void> {
    const idToken = await getIdToken(user);
    // Chiamata al tuo nuovo endpoint C#
    await firstValueFrom(
      this.http.get(`${this.constants.BasePath()}/Auth/login`, { params: { idToken } })
    );
    // Forza il refresh per ottenere i ruoli (Custom Claims) iniettati dal backend
    const updatedToken = await getIdToken(user, true);
    await this.tokenService.setToken(updatedToken);
    this.setStatusUserVerified();
  }

  // --- GESTIONE STATO ---

  setStatusUserVerified(): void {
    const hasToken = this.tokenService.hasValidToken();
    this.loggedIn$.next(hasToken);
    this.isShop$.next(this.isShop());
    this.canManagePromoSubject.next(this.canManagePromo());
    this.canValidateCouponSubject.next(this.canValidateCoupon());
  }

  private async refreshLoginState(): Promise<void> {
    // Recupera l'utente corrente da Firebase all'avvio
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const token = await getIdToken(user);
      await this.tokenService.setToken(token);
    }
    this.setStatusUserVerified();
  }

  // --- OPERAZIONI UTENTE ---

  async logOut(): Promise<void> {
    this.loggedIn$.next(false);
    this.isShop$.next(false);
    this.clearShops();
    await Preferences.remove({ key: 'last_fcm_token_sent' });
    
    try { await firstValueFrom(this.logoutApi()); } catch {}
    await this.tokenService.clearToken();
    await signOut(this.firebaseAuth);
  }

  private logoutApi(): Observable<CommonResDto> {
    return from(this.notificationService.requestPermissionAndGetToken()).pipe(
      switchMap(fcmToken => this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/logout`, { fcmToken }))
    );
  }

  signUp(req: SignUpReqDto): Observable<CommonResDto> {
    return this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/sign-up`, req);
  }

  passwordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.firebaseAuth, email);
  }

  // --- CONTROLLI RUOLI (Private) ---

  private isShop(): boolean {
    const roles = this.tokenService.getRolesFromToken();
    return roles.includes(Role[Role.shop]);
  }

  private canManagePromo(): boolean {
    const roles = this.tokenService.getRolesFromToken();
    return roles.includes(Role[Role.shop]) || roles.includes(Role[Role.staffPromo]) || roles.includes(Role[Role.staffBoth]);
  }

  private canValidateCoupon(): boolean {
    const roles = this.tokenService.getRolesFromToken();
    return roles.includes(Role[Role.shop]) || roles.includes(Role[Role.staffValidator]) || roles.includes(Role[Role.staffBoth]);
  }

  // --- METODI DI UTILITÀ ---

  async getCurrentUserFromAuth(): Promise<User | null> {
    return this.firebaseAuth.currentUser;
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  loggedUserIsShop(): Observable<boolean> {
    return this.isShop$.asObservable();
  }

  setShops(list: ShopListDto[]): void {
    this.shopsSubject.next(list ?? []);
  }

  clearShops(): void {
    this.shopsSubject.next([]);
  }

  Delete(idReason: number): Observable<CommonResDto> {
    const params = new HttpParams().set('idReason', idReason);
    return this.http.delete<CommonResDto>(`${this.constants.BasePath()}/Auth/delete`, { params });
  }

  async checkProviderLogin(): Promise<string> {

    const user = await this.getCurrentUserFromAuth();

    if (user) {
      if (user && user.providerData.length == 0)
        return '';
      if (user.providerData.length == 1 && user.providerData[0].providerId == "password")
        return user.email ?? '';
      else if (user.providerData.some(p => p.providerId === 'google.com'))
        return 'google.com';
      else if (user.providerData.some(p => p.providerId === 'facebook.com'))
        return 'facebook.com';
    }
    else return '';
    return '';
  }


  async reauthenticateWithPassword(userEmail: string, userPassword: string): Promise<boolean> {
    const user = this.firebaseAuth.currentUser;
    if (!user) return false;

    await user.reload();

    try {
      const credential = EmailAuthProvider.credential(userEmail, userPassword);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {return false;}
  }

  async reauthenticateWithGooglePopup(): Promise<boolean> {
    const user = this.firebaseAuth.currentUser;
    if (!user) return false;

    await user.reload();

    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      return true;
    } catch (error) {return false;}
  }

  async reauthenticateWithFacebookPopup(): Promise<boolean> {
    const user = this.firebaseAuth.currentUser;
    if (!user) return false;

    await user.reload();

    try {
      const provider = new FacebookAuthProvider();
      await reauthenticateWithPopup(user, provider);
      return true;
    } catch (error) {return false;}
  }

  async forceRefresh(): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const { getIdToken } = await import('firebase/auth');
      const newToken = await getIdToken(user, true); // 'true' forza il refresh dei Custom Claims
      await this.tokenService.setToken(newToken);
      this.setStatusUserVerified();
    }
  }

  async getEmail(): Promise<string | null> {
    const user = await this.getCurrentUserFromAuth();
    return user?.email || null;
  }

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

  async checkEmailVerification(): Promise<boolean> {
    const user = await firstValueFrom(
      authState(this.firebaseAuth).pipe(
        filter(u => u !== null), // aspetta che Firebase ripristini l'utente
        take(1)
      )
    );

    if (!user.providerData || user.providerData.length === 0) return false;

    const isPasswordProvider =
      user.providerData.length === 1 &&
      user.providerData[0].providerId === 'password';

    if (isPasswordProvider) {
      await user.reload();
      return user.emailVerified === true;
    }

    return true;
  }

  async apiCheckHaveRequest(): Promise<CommonResDto> {
    return await firstValueFrom(
      this.http.get<CommonResDto>(this.constants.BasePath() + '/Auth/check-have-request')
    );
  }

  async apiConfirmRequestStaff(shopId: number): Promise<CommonResDto> {
    return await firstValueFrom(
      this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/confirm-request-staff`, {}, { params: { shopId: shopId.toString() } })
    );
  }

  async apiRejectRequestStaff(shopId: number): Promise<CommonResDto> {
    return await firstValueFrom(this.http.post<CommonResDto>(`${this.constants.BasePath()}/Auth/reject-request-staff`, {}, { params: { shopId: shopId.toString() } })
    );
  }

  async apiCheckisPresent(email: string): Promise<any> {
    return await firstValueFrom(
      this.http.get(this.constants.BasePath() + '/Auth/check-isPresent', { params: { email: email } })
    );
  }

  async initFromCache(): Promise<void> {
    const cached = await this.cache.get<ShopListDto[]>(
      'user_shops',
      { category: 'api-cache' }
    );

    this.shopsSubject.next(cached ?? []);
  }
}