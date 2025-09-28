export interface ApiJwtPayload {
  sub: string,
  name: string;
  roles: string[];
  exp: number; // scadenza in timestamp UNIX
}