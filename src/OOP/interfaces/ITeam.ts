import {ITeamColor} from "./ITeamColor";
import {Championship} from "../classes/Championship";
import {IPlayer} from "./IPlayer";

export interface ITeam {
    id: string
    name: string
    logo: string
    homeColor: ITeamColor
    awayColor: ITeamColor
    championships: Championship[]
    players: IPlayer[]
}