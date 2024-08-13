import {Team} from "./Team";
import {Player} from "./Player";
import {GameType} from "../enums/GameType";
import {PlayoffPeriod, RegularPeriod} from "../enums/Period";

export class GameAction {
    private _team: Team;
    private _period: RegularPeriod | PlayoffPeriod;
    private _time: number;
    private _type: GameType;
    private _player: Player;
    private _x: number;
    private _y: number;


    constructor(team: Team, period: RegularPeriod | PlayoffPeriod, time: number, type: GameType, player: Player, x: number, y: number) {
        this._team = team;
        this._period = period;
        this._time = time;
        this._type = type;
        this._player = player;
        this._x = x;
        this._y = y;
    }
}