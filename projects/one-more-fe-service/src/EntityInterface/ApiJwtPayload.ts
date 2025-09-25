export interface ApiJwtPayload {
  name: string;
  roles: string[];
  exp: number; // scadenza in timestamp UNIX
}