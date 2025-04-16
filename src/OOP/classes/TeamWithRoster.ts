// TeamRoster.ts
import {Team} from "./Team";
import {Player} from "./Player";
import {TeamColor} from "./TeamColor";
import {Championship} from "./Championship";
import ITeamWithRoster from "../interfaces/ITeamWithRoster";
import {Position} from "../enums/Position";


export class TeamWithRoster extends Team implements ITeamWithRoster {
    readonly roster: Player[];

    constructor(
        id: string,
        name: string,
        logo: string,
        homeColor: TeamColor,
        awayColor: TeamColor,
        championships: Championship[] = [],
        players: Player[] = [],
        roster: Player[] = []
    ) {
        super(id, name, logo, homeColor, awayColor, championships, players);
        this.roster = roster;
    }

    static fromPlainObject(obj: any): TeamWithRoster {
        return new TeamWithRoster(
            obj.id,
            obj.name,
            obj.logo,
            TeamColor.fromPlainObject(obj.homeColor),
            TeamColor.fromPlainObject(obj.awayColor),
            obj.championships ? obj.championships.map((c: any) => Championship.fromPlainObject(c)) : [],
            obj.players ? obj.players.map((p: any) => Player.fromPlainObject(p)) : [],
            obj.roster ? obj.roster.map((p: any) => Player.fromPlainObject(p)) : []
        );
    }

    toPlainObject(): ITeamWithRoster {
        return {
            ...super.toPlainObject(),
            roster: this.roster.map(p => p.toPlainObject())
        };
    }

    toString(): string {
        return `${super.toString()} with ${this.roster.length} active players`;
    }

    // Override iterator to iterate through the roster instead of all players
    [Symbol.iterator](): Iterator<Player> {
        let index = 0;
        const roster = this.roster;

        return {
            next(): IteratorResult<Player> {
                if (index < roster.length) {
                    return {
                        value: roster[index++],
                        done: false
                    };
                } else {
                    return {
                        value: null as any,
                        done: true
                    };
                }
            }
        };
    }

    // Get a subset of players for a specific position
    getPlayersByPosition(position: Position): Player[] {
        return this.roster.filter(player => player.position === position);
    }

    // Get active roster size
    getRosterSize(): number {
        return this.roster.length;
    }

    // Compare two rosters by size
    static compareByRosterSize(a: TeamWithRoster, b: TeamWithRoster): number {
        return a.roster.length - b.roster.length;
    }
}