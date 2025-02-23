import {ITeamColor} from "./ITeamColor";
import {Championship} from "../classes/Championship";
import {Player} from "../classes/Player";

export interface ITeam {
    id: string
    name: string
    logo: string
    homeColor: ITeamColor
    awayColor: ITeamColor
    championships: Championship[]
    players: Player[]
}