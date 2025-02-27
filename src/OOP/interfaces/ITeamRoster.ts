import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";

export default interface ITeamRoster extends ITeam {
    roster: IPlayer[];
}