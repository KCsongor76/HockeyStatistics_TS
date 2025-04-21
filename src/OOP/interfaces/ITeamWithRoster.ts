import {ITeam} from "./ITeam";
import {IPlayer} from "./IPlayer";

export default interface ITeamWithRoster extends ITeam {
    roster: IPlayer[];
}