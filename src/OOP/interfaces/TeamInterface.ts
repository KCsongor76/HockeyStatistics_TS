import {PlayerInterface} from "./PlayerInterface";
import {ChampionshipInterface} from "./ChampionshipInterface";

export interface TeamInterface {
    id: string;
    name: string;
    championshipIds: string[];
    players?: PlayerInterface[];
}