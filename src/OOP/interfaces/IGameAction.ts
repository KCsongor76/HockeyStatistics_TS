import {ActionType} from "../enums/ActionType";
import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";
import ITeamRoster from "./ITeamRoster";

export interface IGameAction {
    type: ActionType;
    team: ITeamRoster;
    player: IPlayer
    period: number;
    time: number;
    x: number;
    y: number;
    assists?: IPlayer[];
}