export class Championship {
    private readonly _id: number;
    private _name: string

    constructor(id: number = 0, name: string = '') {
        this._id = id;
        this._name = name;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
}