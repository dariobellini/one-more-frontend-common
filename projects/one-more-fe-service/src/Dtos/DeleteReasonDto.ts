export class DeleteReasonDto {
    idReasonDelete: number;
    description: string;

    constructor(data: DeleteReasonDto) {
        this.idReasonDelete = data.idReasonDelete;
        this.description = data.description;
    }
}
