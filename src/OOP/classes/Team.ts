import {ITeamColor} from "../interfaces/ITeamColor";
import {IChampionship} from "../interfaces/IChampionship";
import {IPlayer} from "../interfaces/IPlayer";

export class Team {
    private readonly _id: string
    private _name: string
    private _logo: string;
    private _homeColor: ITeamColor;
    private _awayColor: ITeamColor;
    private _championships: IChampionship[]
    private _players: IPlayer[] = []

    constructor(id: string = "", name: string = "", logo: string = "", homeColor: ITeamColor = {
        primary: "",
        secondary: ""
    }, awayColor: ITeamColor = {
        primary: "",
        secondary: ""
    }, championships: IChampionship[] = [], players: IPlayer[] = []) {
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

    get homeColor(): ITeamColor {
        return this._homeColor;
    }

    set homeColor(value: ITeamColor) {
        this._homeColor = value;
    }

    get awayColor(): ITeamColor {
        return this._awayColor;
    }

    set awayColor(value: ITeamColor) {
        this._awayColor = value;
    }

    get championships(): IChampionship[] {
        return this._championships;
    }

    set championships(value: IChampionship[]) {
        this._championships = value;
    }

    get players(): IPlayer[] {
        return this._players;
    }

    set players(value: IPlayer[]) {
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