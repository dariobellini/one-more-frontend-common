import { Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom, Observer} from 'rxjs';
import { filter} from 'rxjs/operators';
import { DeleteUtente, ProfileUser, UserSession, Utente } from '../EntityInterface/Utente';
import { GoogleAuthProvider, User, UserCredential, createUserWithEmailAndPassword, deleteUser, getAdditionalUserInfo, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { FacebookAuthProvider} from 'firebase/auth'
import 'firebase/compat/auth';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service'
import { Constants } from '../Constants';
import { inject } from '@angular/core';
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  userSession: UserSession | null;
  position !: GeolocationPosition;
  utente! : DeleteUtente;
  isShowedSplash : boolean = false;
  isReautenticated : boolean = false;
  idPage! : number;

  /////////////////////// FIREBASE ///////////////////////  

  private currentUser$ = authState(this.firebaseAut).pipe(
    filter(u => !!u)
  )
  authService: any;
  
  constructor(private cookieService:CookieService, 
              private http:HttpClient, 
              private firebaseAut: Auth, 
              private firestore: Firestore,
              private constants: Constants) { 

    this.userSession = this.getUserSessionFromCookie();
    if(this.userSession){
      this.isLoggedInSubject.next(true);
    }
    else {
      this.isLoggedInSubject.next(false);
    }
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

  getCurrentUserFromAuth(): User | null {
    return this.firebaseAut.currentUser;
  }

  async logOut(): Promise<void>{
    this.deleteUserSessionFromCookie();
    return signOut(this.firebaseAut);
  }

  async login(email: string, password: string): Promise<{ userCredential: UserCredential, token: string }> {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAut, email, password);
    const token = await userCredential.user.getIdToken();
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
      
    return Promise.resolve(newProfile);
  }

  async refreshToken(userSession: UserSession): Promise<boolean> {
    try {
      const currentUser = await firstValueFrom(this.currentUser$); // Converti l'osservabile in una promessa
  
      if (currentUser) {
        const refreshedToken = await currentUser.getIdToken(true);
        if (refreshedToken) {
          userSession.token = refreshedToken;
          this.saveUserSessionToCookie(userSession);
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
            this.deleteUserSessionFromCookie();
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

    /////////////////////////////////////////////////////////  

    //////////////////////COOKIE////////////////////////////

    saveUserSessionToCookie(userSession: UserSession) {
      // Salva i dati della sessione dell'utente nei cookie come un unico oggetto JSON
      this.cookieService.set('userSession', JSON.stringify(userSession));
    }
    
    getUserSessionFromCookie(): UserSession | null { 
      // Verifica se il cookie della sessione dell'utente esiste
      if (this.cookieService.check('userSession')) {
        // Recupera i dati della sessione dell'utente dai cookie
        const userSessionString = this.cookieService.get('userSession');
        // Deserializza l'oggetto JSON in un oggetto UserSession
        const userSession: UserSession = JSON.parse(userSessionString);
        return userSession;
      } else {
        // Se il cookie non esiste, restituisci null
        return null;
      }
    }
    
    deleteUserSessionFromCookie() {
      // Rimuovi il cookie della sessione dell'utente
      this.cookieService.delete('userSession');
    }

    ////////////////////////////////////////////////////////////


  isAuthenticated() {
    return this.isLoggedInSubject.value;
  }

  createUserSession(email: string, uid : string, token : string, idAttivita : number, idUser: number, photoURL:string, typeLog: number, displayName: string, nome:string, cognome:string){
    this.userSession = new UserSession(uid, email, idAttivita, idUser, token, photoURL, typeLog, displayName, nome, cognome);
    console.log(this.userSession);
    this.saveUserSessionToCookie(this.userSession);
    this.isLoggedInSubject.next(true);
  }

  setIdAttivitaUserSession(id: number) {
    if (this.userSession != null && this.userSession != undefined) {
      this.userSession.idAttivita = id;
      try {
        this.saveUserSessionToCookie(this.userSession);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Errore durante il salvataggio della sessione:', error);
      }
    }
  }

  deleteUserSession(){
    this.userSession = null;
    this.deleteUserSessionFromCookie();
    this.isLoggedInSubject.next(false);
  }

  getUser(){
      return this.userSession = this.getUserSessionFromCookie();
  }
  
  apiInsertNewUtente(utente: Utente): Observable<any> {
    return this.http.post<Utente>(this.constants.BasePath()+'/Soggetto/insert-utente', utente);
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

  setIsShowedSplash(isVisible : boolean){
    this.isShowedSplash = isVisible;
  }

  getIsShowedSplash(){
    return this.isShowedSplash;
  }

  setLastIdPageInSession(idPage: number){
    this.idPage = idPage;
  }

  getLastIdPageFromSession(){
    return this.idPage;
  }
}
