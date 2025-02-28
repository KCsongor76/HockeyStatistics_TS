import {IGameAction} from "./IGameAction";
import {IScoreData} from "./IScoreData";
import ITeamRoster from "./ITeamRoster";
import {IChampionship} from "./IChampionship";

export interface IGame {
    id: string;
    championship: IChampionship;
    actions: IGameAction[];
    timestamp: string;
    score: { home: IScoreData; away: IScoreData };
    teams: {
        home: ITeamRoster,
        away: ITeamRoster
    };
    selectedImage: string;
}