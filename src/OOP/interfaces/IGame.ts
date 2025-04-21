import {IGameAction} from "./IGameAction";
import {IScoreData} from "./IScoreData";
import ITeamWithRoster from "./ITeamWithRoster";
import {IChampionship} from "./IChampionship";
import {GameType} from "../enums/GameType";

export interface IGame {
    id: string;
    type: GameType
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