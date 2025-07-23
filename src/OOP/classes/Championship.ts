import {IChampionship} from "../interfaces/IChampionship";

export class Championship {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    toPlainObject(): IChampionship {
        return {
            id: this.id,
            name: this.name
        }
    }

    static fromPlain(plain: IChampionship): Championship {
        return new Championship(plain.id, plain.name);
    }
}