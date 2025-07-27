// TeamWithRoster.ts
import {Team} from "./Team";
import {Player} from "./Player";
import {Championship} from "./Championship";
import {ITeamColor} from "../interfaces/ITeamColor";
import ITeamWithRoster from "../interfaces/ITeamWithRoster";
import {IPlayer} from "../interfaces/IPlayer";
import {IChampionship} from "../interfaces/IChampionship";
import {Position} from "../enums/Position";
import {Season} from "../enums/Season";

export class TeamWithRoster extends Team {
    roster: Player[];

    constructor(
        name: string,
        logo: string,
        homeColor: ITeamColor,
        awayColor: ITeamColor,
        seasons: Season[],
        championships: Championship[],
        players: Player[] = [],
        roster: Player[] = [],
        id?: string
    ) {
        super(name, logo, homeColor, awayColor, seasons, championships, players, id);
        this.roster = roster;
    }

    static fromPlain(plain: ITeamWithRoster): TeamWithRoster {
        return new TeamWithRoster(
            plain.name,
            plain.logo,
            plain.homeColor,
            plain.awayColor,
            plain.seasons,
            plain.championships.map((c: IChampionship) => new Championship(c.id, c.name)),
            plain.players.map((p: IPlayer) => new Player(p.name, p.position as Position, p.jerseyNumber, p.teamId, p.id)),
            plain.roster.map((p: IPlayer) => new Player(p.name, p.position as Position, p.jerseyNumber, p.teamId, p.id)),
            plain.id
        );
    }

    toPlainObject(): ITeamWithRoster {
        const baseTeam = super.toPlainObject();
        return {
            ...baseTeam,
            roster: this.roster.map((p: Player) => p.toPlainObject()),
        };
    }
}