export class PhotoDto {
    title?: string;
    fileName?: string;
    isMain?: boolean;

    constructor(data?: Partial<PhotoDto>) {
        if (data) {
            this.title = data.title;
            this.fileName = data.fileName;
            this.isMain = data.isMain;
        }
    }
}