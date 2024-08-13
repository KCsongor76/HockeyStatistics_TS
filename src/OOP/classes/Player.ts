import {Team} from "./Team";
import {Position} from "../enums/Position";

export class Player {

    private readonly _id: number;
    private readonly _name: string;
    private _position: Position;
    private _jerseyNumber: number;
    private _team: Team;

    constructor(id: number, name: string, position: Position, jerseyNumber: number, team: Team) {
        this._id = id;
        this._name = name;
        this._position = position;
        this._jerseyNumber = jerseyNumber;
        this._team = team;
    }

    get id(): number {
        return this._id;
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