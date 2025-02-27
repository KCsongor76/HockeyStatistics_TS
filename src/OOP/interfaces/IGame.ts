import {IGameAction} from "./IGameAction";
import {IScoreData} from "./IScoreData";
import ITeamRoster from "./ITeamRoster";

export interface IGame {
    id: string;
    actions: IGameAction[];
    timestamp: string;
    score: { home: IScoreData; away: IScoreData };
    teams: {
        home: ITeamRoster,
        away: ITeamRoster
    };
    selectedImage: string;
}