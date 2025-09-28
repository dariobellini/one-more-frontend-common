export interface ApiJwtPayload {
  sub: string,
  name: string;
  idSoggetto: number,
  idAttivitaList: number[],
  roles: string[];
  isVerified: boolean;
  exp: number; // scadenza in timestamp UNIX
}