import {IChampionship} from "../interfaces/IChampionship";

export class Championship implements IChampionship {
    readonly id: string;
    readonly name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static fromPlainObject(obj: IChampionship): Championship {
        return new Championship(obj.id, obj.name);
    }

    toPlainObject(): IChampionship {
        return {
            id: this.id,
            name: this.name
        };
    }

    toString(): string {
        return `Championship: ${this.name} (${this.id})`;
    }

    equals(other: Championship): boolean {
        if (!(other instanceof Championship)) return false;
        return this.id === other.id;
    }


}