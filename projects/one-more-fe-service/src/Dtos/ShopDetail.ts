export interface ShopDetailDto {
    description: string;
    email: string;
    vatCountry: string;
    vatNumber: string;
    placeId: string;
    longitude: number;
    latitude: number;
    rating: number;
    ratingCount: number;
    lastUpdateRating?: string;
    telephone: string;
    distance?: number;
}