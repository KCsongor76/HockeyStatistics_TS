import {IGameAction} from "./IGameAction";
import {IScoreData} from "./IScoreData";
import {ITeam} from "./ITeam";

export interface IGame {
    id: string;
    actions: IGameAction[];
    timestamp: string;
    score: { home: IScoreData; away: IScoreData };
    teams: {
        // home: ReturnType<Team['toPlainObject']>;
        // away: ReturnType<Team['toPlainObject']>;
        home: ITeam,
        away: ITeam
    };
    selectedImage: string;
}