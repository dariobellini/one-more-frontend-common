export class AddUpdatePhotoDto {
    id?: number;          // presente solo se già salvata
    title?: string;
    fileName?: string;         // per preview immagini esistenti
    bytes?: string;       // solo per nuove foto
    isMain: boolean = false;
    isNew: boolean = false;       // discriminante
    isDeleted?: boolean = false; // per marcare le foto da eliminare

    constructor(data?: Partial<AddUpdatePhotoDto>) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.fileName = data.fileName;
            this.bytes = data.bytes;
            this.isMain = data.isMain ?? false;
            this.isNew = data.isNew ?? false;
            this.isDeleted = data.isDeleted ?? false;
        }
    }
}