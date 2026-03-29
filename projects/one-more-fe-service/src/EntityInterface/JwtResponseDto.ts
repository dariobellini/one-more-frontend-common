export class JwtResponseDto {
    jwt: string;
    refreshToken: string | null;

    constructor(jwt: string, refreshToken: string | null) {
        this.jwt = jwt;
        this.refreshToken = refreshToken;
    }
}