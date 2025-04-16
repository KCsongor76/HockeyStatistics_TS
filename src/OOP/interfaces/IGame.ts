import {IGameAction} from "./IGameAction";
import {IScoreData} from "./IScoreData";
import ITeamWithRoster from "./ITeamWithRoster";
import {IChampionship} from "./IChampionship";

export interface IGame {
    id: string;
    championship: IChampionship;
    actions: IGameAction[];
    timestamp: string;
    score: { home: IScoreData; away: IScoreData };
    teams: {
        home: ITeamWithRoster,
        away: ITeamWithRoster
    };
    selectedImage: string;
}