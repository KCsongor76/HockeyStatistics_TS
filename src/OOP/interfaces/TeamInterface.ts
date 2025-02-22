import {TeamColor} from "./TeamColor";
import {Championship} from "../classes/Championship";
import {Player} from "../classes/Player";

export interface TeamInterface {
    id: string
    name: string
    logo: string
    homeColor: TeamColor
    awayColor: TeamColor
    championships: Championship[]
    players: Player[]
}