import {IPlayer} from "./IPlayer";
import {IScoreData} from "./IScoreData";

export interface IPlayerWithStats extends IPlayer {
    stats: IScoreData
}