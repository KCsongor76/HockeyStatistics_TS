import {Team} from "./Team";
import {Championship} from "./Championship";
import {GameAction} from "./GameAction";

export class Game {

    private _id: number;
    private _homeTeam: Team;
    private _awayTeam: Team;
    private _homeScore: number;
    private _awayScore: number;
    private _date: Date;
    private imageTop: number;
    private championship: Championship;
    private gameActions: GameAction[];


    constructor(id: number, homeTeam: Team, awayTeam: Team, homeScore: number, awayScore: number, date: Date, imageTop: number, championship: Championship, gameActions: GameAction[]) {
        this._id = id;
        this._homeTeam = homeTeam;
        this._awayTeam = awayTeam;
        this._homeScore = homeScore;
        this._awayScore = awayScore;
        this._date = date;
        this.imageTop = imageTop;
        this.championship = championship;
        this.gameActions = gameActions;
    }
}