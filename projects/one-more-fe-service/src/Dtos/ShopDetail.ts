export interface ShopDetailDto {
    title: string;
    description: string;
    email: string;
    vatNumber: string;
    placeId: string;
    longitude: number;
    latitude: number;
    rating: number;
    ratingCount: number;
    telephone: string;
    distance?: number;
}