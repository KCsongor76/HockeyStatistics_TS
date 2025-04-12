// Team.ts
import {ITeam} from "../interfaces/ITeam";
import {TeamColor} from "./TeamColor";
import {Player} from "./Player";
import {Championship} from "./Championship";
import {Position} from "../enums/Position";

export class Team implements ITeam, Iterable<Player> {
    readonly id: string;
    readonly name: string;
    readonly logo: string;
    readonly homeColor: TeamColor;
    readonly awayColor: TeamColor;
    readonly championships: Championship[];
    readonly players: Player[];

    constructor(
        id: string,
        name: string,
        logo: string,
        homeColor: TeamColor,
        awayColor: TeamColor,
        championships: Championship[] = [],
        players: Player[] = []
    ) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.homeColor = homeColor;
        this.awayColor = awayColor;
        this.championships = championships;
        this.players = players;
    }

    static fromPlainObject(obj: any): Team {
        return new Team(
            obj.id,
            obj.name,
            obj.logo,
            TeamColor.fromPlainObject(obj.homeColor),
            TeamColor.fromPlainObject(obj.awayColor),
            obj.championships ? obj.championships.map((c: any) => Championship.fromPlainObject(c)) : [],
            obj.players ? obj.players.map((p: any) => Player.fromPlainObject(p)) : []
        );
    }

    toPlainObject(): ITeam {
        return {
            id: this.id,
            name: this.name,
            logo: this.logo,
            homeColor: this.homeColor.toPlainObject(),
            awayColor: this.awayColor.toPlainObject(),
            championships: this.championships.map(c => c.toPlainObject()),
            players: this.players.map(p => p.toPlainObject())
        };
    }

    toString(): string {
        return `Team: ${this.name} (${this.id})`;
    }

    equals(other: Team): boolean {
        if (!(other instanceof Team)) return false;
        return this.id === other.id;
    }

    // Iterator implementation
    [Symbol.iterator](): Iterator<Player> {
        let index = 0;
        const players = this.players;

        return {
            next(): IteratorResult<Player> {
                if (index < players.length) {
                    return {
                        value: players[index++],
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

    // Get player by ID
    getPlayerById(id: string): Player | undefined {
        return this.players.find(player => player.id === id);
    }

    // Get player by jersey number
    getPlayerByJerseyNumber(number: number): Player | undefined {
        return this.players.find(player => player.jerseyNumber === number);
    }

    // Get players sorted by position
    getPlayersByPosition(position: Position): Player[] {
        return [...this.players].filter(player => player.position === position);
    }

    // Get players sorted by jersey number
    getPlayersByJerseyNumber(): Player[] {
        return [...this.players].sort(Player.compareByJerseyNumber);
    }

    // Get championship count
    getChampionshipCount(): number {
        return this.championships.length;
    }
}