export interface CheckShopReqDto {
  shopId: number;
  validTexts?: number[] | null;
  notValidTexts?: number[] | null;
  validPhotoIds?: number[] | null;
  notValidPhotoIds?: number[] | null;
  reasonId?: number | null;
}
