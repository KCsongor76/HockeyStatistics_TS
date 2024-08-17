import {Player} from "./Player";
import {Championship} from "./Championship";
import {TeamColor} from "../interfaces/TeamColor";

export class Team {
    private readonly _id: string
    private _name: string
    private _logo: string;
    private _homeColor: TeamColor;
    private _awayColor: TeamColor;
    private _championships: Championship[]
    private _players: Player[] = []

    constructor(id: string = "", name: string = "", logo: string = "", homeColor: TeamColor = {
        primary: "",
        secondary: ""
    }, awayColor: TeamColor = {
        primary: "",
        secondary: ""
    }, championships: Championship[] = [], players: Player[] = []) {
        this._id = id;
        this._name = name;
        this._logo = logo;
        this._homeColor = homeColor;
        this._awayColor = awayColor;
        this._championships = championships;
        this._players = players;
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

    get logo(): string {
        return this._logo;
    }

    set logo(value: string) {
        this._logo = value;
    }

    get homeColor(): TeamColor {
        return this._homeColor;
    }

    set homeColor(value: TeamColor) {
        this._homeColor = value;
    }

    get awayColor(): TeamColor {
        return this._awayColor;
    }

    set awayColor(value: TeamColor) {
        this._awayColor = value;
    }

    get championships(): Championship[] {
        return this._championships;
    }

    set championships(value: Championship[]) {
        this._championships = value;
    }

    get players(): Player[] {
        return this._players;
    }

    set players(value: Player[]) {
        this._players = value;
    }

    toPlainObject() {
        return {
            name: this.name,
            logo: this.logo,
            homeColor: this.homeColor,
            awayColor: this.awayColor,
            championships: this.championships //.map(ch => ch.id), // assuming you just need the championship IDs
        };
    }
}