import {ITeamColor} from "./ITeamColor";
import {IPlayer} from "./IPlayer";
import {IChampionship} from "./IChampionship";

export interface ITeam {
    id: string
    name: string
    logo: string
    homeColor: ITeamColor
    awayColor: ITeamColor
    championships: IChampionship[]
    players: IPlayer[]
}