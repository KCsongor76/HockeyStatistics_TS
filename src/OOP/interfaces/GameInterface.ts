import {Team} from "../classes/Team";
import {Championship} from "../classes/Championship";
import {GameAction} from "../classes/GameAction";

export interface GameInterface {
    id: number;
    homeTeam: Team;
    awayTeam: Team;
    homeScore: number;
    awayScore: number;
    date: Date;
    imageTop: number;
    championship: Championship;
    gameActions: GameAction[];
}