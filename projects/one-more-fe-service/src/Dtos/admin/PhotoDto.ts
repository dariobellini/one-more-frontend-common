export interface PhotoDto {
  id: number;
  fileName: string | null;
  piority: number;
  timeStamp: Date | string;
  isMain: boolean;
}
