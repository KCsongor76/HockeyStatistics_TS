import {ITeamColor} from "./ITeamColor";
import {IPlayer} from "./IPlayer";
import {IChampionship} from "./IChampionship";
import {Season} from "../enums/Season";

export interface ITeam {
    id: string
    name: string
    logo: string
    homeColor: ITeamColor
    awayColor: ITeamColor
    championships: IChampionship[]
    players: IPlayer[]
    seasons: Season[]
}