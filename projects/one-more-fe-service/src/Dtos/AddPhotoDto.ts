export class AddPhotoDto {
    Upload: string;
    IsMain: boolean;
    Priority: number;

    constructor() {
        this.Upload = '';
        this.IsMain = false;
        this.Priority = 0;
    }
}