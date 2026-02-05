import { ShopToCheckDto } from './ShopToCheckDto';

export interface ShopsToCheckResDto {
  outcome: boolean;
  description: string | null;
  shops: ShopToCheckDto[] | null;
}
