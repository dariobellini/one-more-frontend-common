import { AdminCheckTextualFieldDto } from './AdminCheckTextualFieldDto';
import { PhotoDto } from './PhotoDto';

export interface ShopToCheckDto {
  shopId: number;
  texts: AdminCheckTextualFieldDto[] | null;
  photos: PhotoDto[] | null;
}
