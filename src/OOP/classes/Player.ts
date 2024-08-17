import {Team} from "./Team";
import {Position} from "../enums/Position";

export class Player {

    private readonly _name: string;
    private _position: Position;
    private _jerseyNumber: number;
    private _team: Team;

    constructor(name: string = "", position: Position = Position.GOALIE, jerseyNumber: number = 1, team: Team = new Team()) {
        this._name = name;
        this._position = position;
        this._jerseyNumber = jerseyNumber;
        this._team = team;
    }

    get name(): string {
        return this._name;
    }

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position = value;
    }

    get jerseyNumber(): number {
        return this._jerseyNumber;
    }

    set jerseyNumber(value: number) {
        this._jerseyNumber = value;
    }

    get team(): Team {
        return this._team;
    }

    set team(value: Team) {
        this._team = value;
    }
}