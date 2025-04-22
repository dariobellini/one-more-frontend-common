// const BASE_PATH: string = "http://192.168.8.130:7253";
// const BASE_PATH: string = "http://192.168.1.56:7253";
//const BASE_PATH: string = "http://192.168.1.60:7253";

//Decommentare per Debug:
//const BASE_PATH: string = "http://localhost:5000";

// const BASE_PATH: string = "http://199.247.15.22";
const BASE_PATH: string = "https://one-more-service-api.it/api";
const USER_API_JWT : string = "user-api-jwt";


export class Constants {

    public BasePath() {

        return BASE_PATH;
    }
    public UserApiJwt() {

        return USER_API_JWT;
    }
}