import {Player} from "./Player";
import {Championship} from "./Championship";

export class Team {
    private readonly _id: number
    private _name: string
    private _championship: Championship | Championship[]
    private _players: Player[] = []


    constructor(id: number = 0, name: string = "", championship: Championship = new Championship()) {
        this._id = id
        this._name = name
        this._championship = championship
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

    get championship(): Championship | Championship[] {
        return this._championship;
    }

    set championship(value: Championship | Championship[]) {
        this._championship = value;
    }

    get players(): Player[] {
        return this._players;
    }

    set players(value: Player[]) {
        this._players = value;
    }

    addPlayer(player: Player): void {
        this._players.push(player)
    }

    removePlayer(playerId: number): Player | undefined {
        const index = this._players.findIndex(player => player.id === playerId);
        if (index > -1) {
            return this._players.splice(index, 1)[0];
        }
        return undefined;
    }

    transferPlayer(player: Player, toTeam: Team): void {
        this.removePlayer(player.id);
        toTeam.addPlayer(player);
    }
}