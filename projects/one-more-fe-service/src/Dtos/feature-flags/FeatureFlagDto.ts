export class FreatureFlagDto {
    key?: string;
    value?: string;

    constructor(data?: Partial<FreatureFlagDto>) {
        if (data) {
            this.key = data.key;
            this.value = data.value;
        }
    }
}