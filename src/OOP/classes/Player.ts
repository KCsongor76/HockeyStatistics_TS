// Player.ts
import {IPlayer} from "../interfaces/IPlayer";

export class Player implements IPlayer {
    readonly id: string;
    readonly name: string;
    readonly number: number;
    readonly position: string;
    readonly teamId: string;
    readonly jerseyNumber: number;

    constructor(id: string, name: string, number: number, position: string, teamId: string, jerseyNumber: number) {
        this.id = id;
        this.name = name;
        this.number = number;
        this.position = position;
        this.teamId = teamId;
        this.jerseyNumber = jerseyNumber;
    }

    static fromPlainObject(obj: any): Player {
        return new Player(
            obj.id,
            obj.name,
            obj.number,
            obj.position,
            obj.teamId,
            obj.jerseyNumber
        );
    }

    toPlainObject(): IPlayer {
        return {
            id: this.id,
            name: this.name,
            number: this.number,
            position: this.position,
            teamId: this.teamId,
            jerseyNumber: this.jerseyNumber
        };
    }

    toString(): string {
        return `${this.name} (#${this.jerseyNumber}) - ${this.position}`;
    }

    equals(other: Player): boolean {
        if (!(other instanceof Player)) return false;
        return this.id === other.id;
    }

    // Helper method to compare players by position
    static compareByPosition(a: Player, b: Player): number {
        return a.position.localeCompare(b.position);
    }

    // Helper method to compare players by jersey number
    static compareByJerseyNumber(a: Player, b: Player): number {
        return a.jerseyNumber - b.jerseyNumber;
    }
}