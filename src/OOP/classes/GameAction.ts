import {PlayoffPeriod, RegularPeriod} from "../enums/Period";
import {ActionType} from "../enums/ActionType";
import {IPlayer} from "../interfaces/IPlayer";
import {ITeam} from "../interfaces/ITeam";

export class GameAction {
    private _team: ITeam;
    private _period: RegularPeriod | PlayoffPeriod;
    private _time: number;
    private _type: ActionType;
    private _player: IPlayer;
    private _x: number;
    private _y: number;


    constructor(team: ITeam, period: RegularPeriod | PlayoffPeriod, time: number, type: ActionType, player: IPlayer, x: number, y: number) {
        this._team = team;
        this._period = period;
        this._time = time;
        this._type = type;
        this._player = player;
        this._x = x;
        this._y = y;
    }


    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get type(): ActionType {
        return this._type;
    }

    get team(): ITeam {
        return this._team;
    }

    /*static fromInterface(action: IGameAction) {
        return new GameAction(action.team, action.period, action.time, action.type, action.player, action.x, action.y);
    }*/
}