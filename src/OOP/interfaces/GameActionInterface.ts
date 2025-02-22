import {ActionType} from "../enums/ActionType";
import {Team} from "../classes/Team";
import {ScoreData} from "../classes/ScoreData";
import {Player} from "../classes/Player";

export interface GameActionInterface {
    type: ActionType;
    team: Team;
    player: Player
    score: ScoreData;
    period: number;
    time: number;
    x: number;
    y: number;
}