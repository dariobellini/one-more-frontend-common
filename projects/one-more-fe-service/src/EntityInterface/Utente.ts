export class Utente {
  id:number = 0;
  uid:string;
  displayName:string | undefined;
  email:string | undefined;
  ipAddress:string = '';
  isEmailLogin:boolean;
  isGoogleLogin:boolean;
  isFacebookLogin:boolean;
  registrationDate:string | null;
  lastLoginDate:string | null;
  errore:string = '';
}

export class UserSession {
  constructor(
    public uid : string,
    public email : string,
    public idAttivita : number,
    public idSoggetto : number,
    public token : string,
    public photoURL?: string,
    public typeLog?: number,
    public displayName?: string,
    public nome?: string,
    public cognome?: string
  ){}
}

export interface ProfileUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  token?:string;
  nome?:string;
  cognome?:string;
}