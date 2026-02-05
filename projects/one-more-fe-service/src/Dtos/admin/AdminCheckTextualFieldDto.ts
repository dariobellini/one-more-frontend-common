export enum AdminCheckShopTextualFieldType {
  Unknown = 0,
  Title = 1,
  Description = 2
}

export interface AdminCheckTextualFieldDto {
  id: number;
  text: string | null;
  type: AdminCheckShopTextualFieldType;
  shopId: number;
}
