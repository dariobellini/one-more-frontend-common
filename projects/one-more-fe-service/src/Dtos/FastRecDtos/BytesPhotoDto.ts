export class BytesPhotoDto {
    title?: string;
    bytes?: string;

    constructor(data?: Partial<BytesPhotoDto>) {
        if (data) {
            this.title = data.title;
            this.bytes = data.bytes;
        }
    }
}