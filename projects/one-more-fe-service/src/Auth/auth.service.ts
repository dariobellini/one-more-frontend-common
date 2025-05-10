import { Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom, Observer} from 'rxjs';
import { filter} from 'rxjs/operators';
import { DeleteUtente, ProfileUser, UserSession, Utente } from '../EntityInterface/Utente';
import { GoogleAuthProvider, User, UserCredential, createUserWithEmailAndPassword, deleteUser, getAdditionalUserInfo, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { FacebookAuthProvider} from 'firebase/auth'
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Constants } from '../Constants';
import { TranslateService } from '@ngx-translate/core';
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private languageSubject = new BehaviorSubject<string>('IT'); // Stato iniziale
  language$ = this.languageSubject.asObservable(); // Observable per ascoltare i cambiamenti
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  userSession: UserSession | null;
  language: string | undefined;
  position !: GeolocationPosition;
  utente! : DeleteUtente;
  isReautenticated : boolean = false;
  idPage! : number;
  esito!: string;

  /////////////////////// FIREBASE ///////////////////////  

  private currentUser$ = authState(this.firebaseAut).pipe(
    filter(u => !!u)
  )
  authService: any;
  
  constructor(private http:HttpClient, 
              private firebaseAut: Auth, 
              private firestore: Firestore,
              private constants: Constants,
              private translate: TranslateService) { 

    this.userSession = this.getUserSession();
    if(this.userSession){
      this.isLoggedInSubject.next(true);
    }
    else {
      this.isLoggedInSubject.next(false);
    }

    const savedLang = this.getLanguageSession();
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    this.languageSubject.next(savedLang);
  }

  async getCurrentUser(uid: string): Promise<ProfileUser | undefined> {
    const userDocRef = doc(this.firestore, 'users', uid);
  
    try {
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const user: ProfileUser = {
          uid: userData['uid'],
          displayName: userData['displayName'],
          email: userData['email'],
          photoURL: userData['photoURL'] || '',
          nome: userData['nome'] || '',
          cognome: userData['cognome'] || '',
        };
        return user;
      } else {
        return undefined;
      }
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUserFromAuth(): Promise<User | null> {
    return await this.firebaseAut.currentUser;
  }

  async logOut(): Promise<void>{
    this.deleteUserSession();
    return signOut(this.firebaseAut);
  }

  async login(email: string, password: string): Promise<{ userCredential: UserCredential, token: string }> {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAut, email, password);
    const token = await userCredential.user.getIdToken();
    const apiJwt = await this.GetUserJwt(userCredential.user.uid).toPromise();
    localStorage.setItem(this.constants.UserApiJwt(), apiJwt ?? '');
    return { userCredential, token };
  }

  signUp(email: string, password: string): Promise<{ userCredential: UserCredential, token: string }> {
    return createUserWithEmailAndPassword(this.firebaseAut, email, password)
      .then(async (userCredential: UserCredential) => {
        const token = await userCredential.user.getIdToken();
        return { userCredential, token };
      });
  }

  setDisplayName(user: User, name: string): Promise<void>{
    return updateProfile(user, {displayName: name});
  }

  addUser(user:ProfileUser): Promise<void>{
    return setDoc(doc(this.firestore, "users", user.uid), {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL ?? '',
      nome: user.nome ?? '',
      cognome: user.cognome ?? '',
    });
  }

  passwordReset(email: string): Promise<void>{
    return sendPasswordResetEmail(this.firebaseAut, email);
  }

  googleProvider = new GoogleAuthProvider();

   async GoogleLogIn(): Promise<ProfileUser | null>{
    const userCredential =  await signInWithPopup(this.firebaseAut, this.googleProvider);
    const additionalInfo = getAdditionalUserInfo(userCredential);

    const{
      user: { uid, email, displayName}
    } = userCredential;

    const token = await userCredential.user.getIdToken();

    const newProfile = {
      uid,
      email: email ?? '',
      displayName: displayName ?? '',
      token: token ?? ''
    }

    const apiJwt = await this.GetUserJwt(userCredential.user.uid).toPromise();
    localStorage.setItem(this.constants.UserApiJwt(), apiJwt ?? '');

    return Promise.resolve(newProfile);
  }

  facebookProvider = new FacebookAuthProvider();

   async FacebookLogIn(): Promise<ProfileUser | null>{
    const userCredential =  await signInWithPopup(this.firebaseAut, this.facebookProvider);
    const additionalInfo = getAdditionalUserInfo(userCredential);

      const{
        user: { uid, email, displayName}
      } = userCredential;
  
      const token = await userCredential.user.getIdToken();

      const newProfile = {
        uid,
        email: email ?? '',
        displayName: displayName ?? '',
        token: token ?? ''
      }
      
    const apiJwt = await this.GetUserJwt(userCredential.user.uid).toPromise();
    localStorage.setItem(this.constants.UserApiJwt(), apiJwt ?? '');

    return Promise.resolve(newProfile);
  }

  async refreshToken(userSession: UserSession): Promise<boolean> {
    try {
      const currentUser = await firstValueFrom(this.currentUser$); // Converti l'osservabile in una promessa
  
      if (currentUser) {
        const refreshedToken = await currentUser.getIdToken(true);
        if (refreshedToken) {
          userSession.token = refreshedToken;
          this.saveUserSession(userSession);
          return true;  
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('Errore durante il refresh del token:', error);
      return false;
    }
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
            this.deleteUserSession();
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

    /////////////////////////////////////////////////////////  

    saveUserSession(userSession: UserSession) {
      localStorage.setItem('userSession', JSON.stringify(userSession));
    }

    getUserSession(): UserSession | null {
      const userSessionString = localStorage.getItem('userSession');
      return userSessionString ? JSON.parse(userSessionString) : null;
    }

    deleteUserSession() {
      this.userSession = null;
      localStorage.removeItem('userSession');
      this.isLoggedInSubject.next(false);
    }

    saveLanguageSession(language: string) {
      localStorage.setItem('language', language);
      this.translate.use(language); // Cambia la lingua
      this.languageSubject.next(language); // Notifica i componenti che la lingua è cambiata
    }
  
    getLanguageSession(): string {
      return localStorage.getItem('language') || 'it';
    }
  
    deleteLanguageSession() {
      localStorage.removeItem('language');
    }

  isAuthenticated() {
    return this.isLoggedInSubject.value;
  }

  createUserSession(email: string, uid : string, token : string, idAttivita : number, idUser: number, photoURL:string, typeLog: number, displayName: string, nome:string, cognome:string){
    this.userSession = new UserSession(uid, email, idAttivita, idUser, token, photoURL, typeLog, displayName, nome, cognome);
    this.saveUserSession(this.userSession);
    this.isLoggedInSubject.next(true);
  }

  setIdAttivitaUserSession(id: number) {
    if (this.userSession != null && this.userSession != undefined) {
      this.userSession.idAttivita = id;
      try {
        this.saveUserSession(this.userSession);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Errore durante il salvataggio della sessione:', error);
      }
    }
  }

  getUser(){
      return this.userSession = this.getUserSession();
  }
  
  apiInsertNewUtente(utente: Utente): Observable<any> {
    return this.http.post<Utente>(this.constants.BasePath()+'/Soggetto/insert-utente', utente);
  }

  GetUserJwt(uId: string): Observable<string> {
    return this.http.get(this.constants.BasePath() + '/auth/get-jwt?uId=' + uId, {
      responseType: 'text' // Specifica che la risposta è una stringa
    });
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

  apiCheckUtenteByProvider(utente: Utente): Observable<any> {
    return new Observable((observer: Observer<Utente>) => {
      this.http.post<Utente>(this.constants.BasePath()+'/Soggetto/check-utente', utente)
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

  apiCheckUtenteLogin(utente: Utente): Observable<any> {
    return this.http.post<Utente>(this.constants.BasePath()+'/Soggetto/check-utente', utente);
  }

  setIsShowedSplashFalse(){
    localStorage.setItem('splashShown', "false");
  }

  setIsShowedSplash(){
    localStorage.setItem('splashShown', "true");
  }

  getIsShowedSplash() {
    return localStorage.getItem('splashShown') === "true";
  }

  setLastIdPageInSession(idPage: number){
    this.idPage = idPage;
  }

  getLastIdPageFromSession(){
    return this.idPage;
  }
}
