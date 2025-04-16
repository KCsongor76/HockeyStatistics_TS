// GameAction.ts
import {IGameAction} from "../interfaces/IGameAction";
import {ActionType} from "../enums/ActionType";
import {Player} from "./Player";
import {TeamWithRoster} from "./TeamWithRoster";

export class GameAction implements IGameAction {
    readonly type: ActionType;
    readonly team: TeamWithRoster;
    readonly player: Player;
    readonly period: number;
    readonly time: number;
    readonly x: number;
    readonly y: number;
    readonly assists?: Player[];

    constructor(
        type: ActionType,
        team: TeamWithRoster,
        player: Player,
        period: number,
        time: number,
        x: number,
        y: number,
        assists?: Player[]
    ) {
        this.type = type;
        this.team = team;
        this.player = player;
        this.period = period;
        this.time = time;
        this.x = x;
        this.y = y;
        this.assists = assists;
    }

    static fromPlainObject(obj: any, teamsMap: Map<string, TeamWithRoster>, playersMap: Map<string, Player>): GameAction {
        const team = teamsMap.get(obj.team.id) || TeamWithRoster.fromPlainObject(obj.team);
        const player = playersMap.get(obj.player.id) || Player.fromPlainObject(obj.player);
        const assists = obj.assists
            ? obj.assists.map((a: Player) => playersMap.get(a.id) || Player.fromPlainObject(a))
            : undefined;

        return new GameAction(
            obj.type,
            team,
            player,
            obj.period,
            obj.time,
            obj.x,
            obj.y,
            assists
        );
    }

    toPlainObject(): IGameAction {
        return {
            type: this.type,
            team: this.team.toPlainObject(),
            player: this.player.toPlainObject(),
            period: this.period,
            time: this.time,
            x: this.x,
            y: this.y,
            assists: this.assists ? this.assists.map(a => a.toPlainObject()) : undefined
        };
    }

    toString(): string {
        let actionDesc = `${this.type} by ${this.player.name} at ${this.formatTime()}`;
        if (this.assists && this.assists.length > 0) {
            actionDesc += ` (Assists: ${this.assists.map(a => a.name).join(', ')})`;
        }
        return actionDesc;
    }

    equals(other: GameAction): boolean {
        if (!(other instanceof GameAction)) return false;

        const sameBasics = this.type === other.type &&
            this.player.id === other.player.id &&
            this.team.id === other.team.id &&
            this.period === other.period &&
            this.time === other.time &&
            this.x === other.x &&
            this.y === other.y;

        // Check assists
        if (!sameBasics) return false;
        if (!this.assists && !other.assists) return true;
        if (!this.assists || !other.assists) return false;
        if (this.assists.length !== other.assists.length) return false;

        return this.assists.every(assist =>
            other.assists!.some(otherAssist => assist.id === otherAssist.id)
        );
    }

    // Format the time as MM:SS
    formatTime(): string {
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Calculate position on a standardized coordinate system (0-100)
    getPosition(): { xPercent: number, yPercent: number } {
        return {
            xPercent: (this.x * 100),
            yPercent: (this.y * 100)
        };
    }

    // Helper method to compare game actions by time
    static compareByTime(a: GameAction, b: GameAction): number {
        if (a.period !== b.period) {
            return a.period - b.period;
        }
        return a.time - b.time;
    }
}