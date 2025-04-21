import {ActionType} from "../enums/ActionType";
import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";
import ITeamWithRoster from "./ITeamWithRoster";

export interface IGameAction {
    type: ActionType;
    team: ITeamWithRoster;
    player: IPlayer
    period: number;
    time: number;
    x: number;
    y: number;
    assists?: IPlayer[];
}