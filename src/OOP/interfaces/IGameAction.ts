import {ActionType} from "../enums/ActionType";
import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";
import {IScoreData} from "./IScoreData";

export interface IGameAction {
    type: ActionType;
    team: ITeam;
    player: IPlayer
    // score: IScoreData;
    period: number;
    time: number;
    x: number;
    y: number;
}