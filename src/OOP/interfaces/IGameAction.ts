import {ActionType} from "../enums/ActionType";
import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";

export interface IGameAction {
    type: ActionType;
    team: ITeam;
    player: IPlayer
    period: number;
    time: number;
    x: number;
    y: number;
    assists?: IPlayer[];
}