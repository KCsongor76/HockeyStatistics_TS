import {GameAction} from "../classes/GameAction";
import {ScoreData} from "../classes/ScoreData";
import {Team} from "../classes/Team";

export interface GameInterface {
    _id: string;
    _actions: GameAction[];
    _timestamp: string;
    _score: { home: ScoreData; away: ScoreData };
    _teams: {
        home: ReturnType<Team['toPlainObject']>;
        away: ReturnType<Team['toPlainObject']>;
    };
    _selectedImage: string;
}