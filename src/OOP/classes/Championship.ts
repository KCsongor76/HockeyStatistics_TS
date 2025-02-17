export class Championship {
    private _name: string
    private readonly _id: string;


    constructor(name: string = "", id: string = "") {
        this._name = name;
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    /*equals(other: Championship): boolean {
        return other != null && this.id === other.id;
    }*/



}