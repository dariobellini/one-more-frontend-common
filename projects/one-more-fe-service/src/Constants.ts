//const BASE_PATH: string = "http://192.168.8.151:4200";


//Decommentare per Debug:
const BASE_PATH: string = "http://localhost:5000";

//const BASE_PATH: string = "http://192.168.8.151:4200";
//const BASE_PATH: string = "http://192.168.79.110:4200";
//const BASE_PATH: string = "https://one-more-service-api.it/api";
const USER_API_JWT: string = "readeal-jwt";
const USER_API_REFRESH_TOKEN: string = "readeal-refresh-token";

export class Constants {

    public BasePath() {

        return BASE_PATH;
    }
    public UserApiJwt() {

        return USER_API_JWT;
    }
    public UserApiRefreshToken() {

        return USER_API_REFRESH_TOKEN;
    }

    public Suffix_Photo_Thumbnail(): string {
        return "_small.webp";
    }
    public Suffix_Photo_Detail(): string {
        return "_medium.webp";
    }
}