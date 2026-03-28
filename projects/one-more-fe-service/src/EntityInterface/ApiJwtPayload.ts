export interface ApiJwtPayload {
  sub: string,
  name: string;
  idSoggetto: number,
  roles: string[];
  exp: number; // scadenza in timestamp UNIX
}