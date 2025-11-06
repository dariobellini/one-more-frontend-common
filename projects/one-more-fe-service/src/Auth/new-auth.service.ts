import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, FacebookAuthProvider, getAdditionalUserInfo, GoogleAuthProvider, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from 'firebase/auth';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { BehaviorSubject, filter, firstValueFrom, Observable, Observer, tap } from 'rxjs';
import { Constants } from '../Constants';
import { JwtResponseDto } from '../EntityInterface/JwtResponseDto';
import { Role } from '../Enum/Role';
import { DeleteUtente, ProfileUser, UserSession, Utente } from '../EntityInterface/Utente';
import { deleteDoc, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { StorageService } from '../storage.service';

import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})

export class NewAuthService {

    private currentUser$ = authState(this.firebaseAut).pipe(
        filter(u => !!u)
      )

    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    private loggedIn$ = new BehaviorSubject<boolean>(this.tokenService.hasValidToken());
    private isUser$ = new BehaviorSubject<boolean>(this.isUser());
    private isVerified$ = new BehaviorSubject<boolean>(this.isVerified());
    private isShop$ = new BehaviorSubject<boolean>(this.isShop());
    esito!: string;
    userSession!: UserSession | null;
    language: string | undefined;
    position !: GeolocationPosition;
    utente!: DeleteUtente;
    isReautenticated: boolean = false;
    idPage!: number;
    
    constructor(private constants: Constants,
                private firestore: Firestore,
                private firebaseAut: Auth,
                private http: HttpClient,
                private tokenService: TokenService
    ) { 

        this.userSession = this.getUserSession();
        if (this.userSession) {
          this.loggedIn$.next(true);
        }
        else {
          this.loggedIn$.next(false);
        }
    }

    
    setStatusUserVerified(): void {
      this.loggedIn$.next(this.tokenService.hasValidToken());
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

    loggedUserIsVerified(): Observable<boolean> {
        return this.isVerified$.asObservable().pipe(
            tap(value => console.log('check isVerified:', value)));
    }

    async getCurrentUserFromAuth(): Promise<User | null> {
      return await this.firebaseAut.currentUser;
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

        signOut(this.firebaseAut);
    }

    async resendVerificationEmail(): Promise<string> {
      try {
        const user = await this.getCurrentUserFromAuth();
        if (user && !user.emailVerified) {
          await sendEmailVerification(user);
          this.esito = "Email di verifica inviata";
          // Mostra un messaggio di conferma all'utente, ad esempio con un alert
        } else {
          this.esito = "L'utente è già verificato o non è autenticato.";
        }
      } catch (error) {
        this.esito = "Errore durante il reinvio dell'email di verifica si prega di riprovare tra qualche istante";
      }
      return this.esito;
    }

    saveUserSession(userSession: UserSession) {
        localStorage.setItem('userSession', JSON.stringify(userSession));
    }

    getUserSession(): UserSession | null {
        const userSessionString = localStorage.getItem('userSession');
        return userSessionString ? JSON.parse(userSessionString) : null;
    }

    createUserSession(email: string, uid: string, token: string, idAttivita: number, idUser: number, photoURL: string, typeLog: number, displayName: string, nome: string, cognome: string) {
      this.userSession = new UserSession(uid, email, idAttivita, idUser, token, photoURL, typeLog, displayName, nome, cognome);
      this.saveUserSession(this.userSession);
      this.loggedIn$.next(true);
    }

    setIdAttivitaUserSession(id: number) {
      if (this.userSession != null && this.userSession != undefined) {
        this.userSession.idAttivita = id;
        try {
          this.saveUserSession(this.userSession);
          this.loggedIn$.next(true);
        } catch (error) {
          console.error('Errore durante il salvataggio della sessione:', error);
        }
      }
    } 

    GetUserJwt(uId: string): Observable<string> {
      return this.http.get(this.constants.BasePath() + '/auth/get-jwt?uId=' + uId, {
        responseType: 'text' // Specifica che la risposta è una stringa
      });
    }

    apiCheckUtenteByProvider(utente: Utente): Observable<any> {
      return new Observable((observer: Observer<Utente>) => {
        this.http.post<Utente>(this.constants.BasePath() + '/Soggetto/check-utente', utente)
          .subscribe({
            next: (response: Utente) => {
              observer.next(response);
              observer.complete();
            },
            error: (err: any) => {
              observer.error(err);
            }
          });
      });
    }

    private UsernamePasswordLogin(idToken: string): Observable<JwtResponseDto> {
      return this.http.get<JwtResponseDto>(this.constants.BasePath() + '/auth/username-password-login?idToken=' + idToken);
    }

    signUp(email: string, password: string): Promise<{ userCredential: UserCredential, token: string }> {
      return createUserWithEmailAndPassword(this.firebaseAut, email, password)
        .then(async (userCredential: UserCredential) => {
          const token = await userCredential.user.getIdToken();
          return { userCredential, token };
        });
    }

    async login(email: string, password: string): Promise<JwtResponseDto | undefined> {
      const userCredential = await signInWithEmailAndPassword(this.firebaseAut, email, password);
      const token = await userCredential.user.getIdToken();
      const readealJwt = await firstValueFrom(this.UsernamePasswordLogin(token));

      if (readealJwt)
        this.tokenService.setToken(readealJwt);

      return Promise.resolve(readealJwt);
    }

    addUser(user: ProfileUser): Promise<void> {
      return setDoc(doc(this.firestore, "users", user.uid), {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL ?? '',
        nome: user.nome ?? '',
        cognome: user.cognome ?? '',
      });
    }

    passwordReset(email: string): Promise<void> {
      return sendPasswordResetEmail(this.firebaseAut, email);
    }

    async reauthenticateUser(userEmail: string, userPassword: string): Promise<boolean> {
        const user = this.firebaseAut.currentUser;
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
        const user = this.firebaseAut.currentUser;
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
            await signOut(this.firebaseAut);
            await deleteUser(user);

            // Elimina la sessione se tutto è andato a buon fine
            this.getUserSession();
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
    

    private isUser(): boolean {
        const roles = this.tokenService.getRolesFromToken();
        return roles.includes(Role[Role.user]);
    }
    private isVerified(): boolean {
         const token = this.tokenService.getToken();
        if (!token) return false;

        try {
            const decoded = this.tokenService.getDecodedToken(token);
            console.log(decoded);
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

    const userCredential = await signInWithPopup(this.firebaseAut, chosenProvider);

    const idToken = await userCredential.user.getIdToken();

    const readealJwt = await firstValueFrom(this.apiServiceLogin(idToken, userType));

    if (readealJwt)
      this.tokenService.setToken(readealJwt);

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

  private apiServiceLogin(idToken: string, userType: number): Observable<JwtResponseDto> {
    const url = `${this.constants.BasePath()}/auth/service-login?idToken=${idToken}&userType=${userType}`;
    return this.http.get<JwtResponseDto>(url);
}
}
