import {Team} from "./Team";
import {Position} from "../enums/Position";

export class Player {

    private readonly _id: string;
    private _name: string;
    private _position: Position;
    private _jerseyNumber: number;
    private _teamId: string;

    constructor(id: string = "", name: string = "", position: Position = Position.GOALIE, jerseyNumber: number = 1, teamId: string = "") {
        this._id = id;
        this._name = name;
        this._position = position;
        this._jerseyNumber = jerseyNumber;
        this._teamId = teamId;
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

    get teamId(): string {
        return this._teamId;
    }

    set teamId(value: string) {
        this._teamId = value;
    }

    toPlainObject = () => {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            jerseyNumber: this.jerseyNumber,
            teamId: this.teamId
        }
    }
}