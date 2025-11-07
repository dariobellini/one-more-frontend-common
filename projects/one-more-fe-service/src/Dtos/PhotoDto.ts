export class PhotoDto {
    title?: string;
    upload?: string;
    isMain?: boolean;

    constructor(data?: Partial<PhotoDto>) {
        if (data) {
            this.title = data.title;
            this.upload = data.upload;
            this.isMain = data.isMain;
        }
    }
}