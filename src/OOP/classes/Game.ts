// Game.ts
import {IGame} from "../interfaces/IGame";
import {Championship} from "./Championship";
import {GameAction} from "./GameAction";
import {ScoreData} from "./ScoreData";
import {TeamWithRoster} from "./TeamWithRoster";
import {Player} from "./Player";
import {ActionType} from "../enums/ActionType";

export class Game implements IGame, Iterable<GameAction> {
    readonly id: string;
    readonly championship: Championship;
    readonly actions: GameAction[];
    readonly timestamp: string;
    readonly score: {
        home: ScoreData;
        away: ScoreData
    };
    readonly teams: {
        home: TeamWithRoster,
        away: TeamWithRoster
    };
    readonly selectedImage: string;

    constructor(
        id: string,
        championship: Championship,
        actions: GameAction[],
        timestamp: string,
        score: { home: ScoreData; away: ScoreData },
        teams: { home: TeamWithRoster, away: TeamWithRoster },
        selectedImage: string
    ) {
        this.id = id;
        this.championship = championship;
        this.actions = actions;
        this.timestamp = timestamp;
        this.score = score;
        this.teams = teams;
        this.selectedImage = selectedImage;
    }

    static fromPlainObject(obj: any): Game {
        // Create maps for teams and players for quick lookup
        const teams = new Map<string, TeamWithRoster>();
        const players = new Map<string, Player>();

        // Process home team
        const homeTeam = TeamWithRoster.fromPlainObject(obj.teams.home);
        teams.set(homeTeam.id, homeTeam);
        homeTeam.players.forEach(p => players.set(p.id, p));
        homeTeam.roster.forEach(p => players.set(p.id, p));

        // Process away team
        const awayTeam = TeamWithRoster.fromPlainObject(obj.teams.away);
        teams.set(awayTeam.id, awayTeam);
        awayTeam.players.forEach(p => players.set(p.id, p));
        awayTeam.roster.forEach(p => players.set(p.id, p));

        return new Game(
            obj.id,
            Championship.fromPlainObject(obj.championship),
            obj.actions.map((a: any) => GameAction.fromPlainObject(a, teams, players)),
            obj.timestamp,
            {
                home: ScoreData.fromPlainObject(obj.score.home),
                away: ScoreData.fromPlainObject(obj.score.away)
            },
            {
                home: homeTeam,
                away: awayTeam
            },
            obj.selectedImage
        );
    }

    toPlainObject(): IGame {
        return {
            id: this.id,
            championship: this.championship.toPlainObject(),
            actions: this.actions.map(a => a.toPlainObject()),
            timestamp: this.timestamp,
            score: {
                home: this.score.home.toPlainObject(),
                away: this.score.away.toPlainObject()
            },
            teams: {
                home: this.teams.home.toPlainObject(),
                away: this.teams.away.toPlainObject()
            },
            selectedImage: this.selectedImage
        };
    }

    toString(): string {
        const date = new Date(this.timestamp);
        const formattedDate = date.toLocaleDateString();
        return `${this.teams?.home.name} ${this.score?.home.goals} vs ${this.score?.away.goals} ${this.teams?.away.name} (${formattedDate})`;
    }

    equals(other: Game): boolean {
        if (!(other instanceof Game)) return false;
        return this.id === other.id;
    }

    // Iterator implementation to iterate through game actions in chronological order
    [Symbol.iterator](): Iterator<GameAction> {
        // Sort actions by period and time
        const sortedActions = [...this.actions].sort(GameAction.compareByTime);
        let index = 0;

        return {
            next(): IteratorResult<GameAction> {
                if (index < sortedActions.length) {
                    return {
                        value: sortedActions[index++],
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

    // Get all actions of a specific type
    getActionsByType(type: ActionType): GameAction[] {
        return this.actions.filter(action => action.type === type);
    }

    // Get all actions by a specific player
    getActionsByPlayer(playerId: string): GameAction[] {
        return this.actions.filter(action => action.player.id === playerId);
    }

    // Get all actions by a specific team
    getActionsByTeam(teamId: string): GameAction[] {
        return this.actions.filter(action => action.team.id === teamId);
    }

    // Get actions by period
    getActionsByPeriod(period: number): GameAction[] {
        return this.actions.filter(action => action.period === period);
    }

    // Get a timeline of all game actions
    getTimeline(): GameAction[] {
        return [...this.actions].sort(GameAction.compareByTime);
    }

    // Get the game duration in minutes (assuming the last action is the game end)
    getDuration(): number {
        if (this.actions.length === 0) return 0;

        const sortedActions = [...this.actions].sort(GameAction.compareByTime);
        const lastAction = sortedActions[sortedActions.length - 1];

        return lastAction.period * 20 + Math.floor(lastAction.time / 60); // Assuming 20-minute periods
    }

    // Calculate additional statistics
    getStatistics() {
        return {
            totalGoals: this.score.home.goals + this.score.away.goals,
            totalShots: this.score.home.shots + this.score.away.shots,
            homeShootingPercentage: this.score.home.getShootingPercentage(),
            awayShootingPercentage: this.score.away.getShootingPercentage(),
            homeGoalScorers: this.getGoalScorers(this.teams.home.id),
            awayGoalScorers: this.getGoalScorers(this.teams.away.id)
        };
    }

    // Get goal scorers for a team
    private getGoalScorers(teamId: string): { player: Player, goals: number }[] {
        const goals = this.actions.filter(
            action => action.type === ActionType.GOAL && action.team.id === teamId
        );

        const scorers = new Map<string, { player: Player, goals: number }>();

        goals.forEach(goal => {
            const playerId = goal.player.id;
            if (scorers.has(playerId)) {
                scorers.get(playerId)!.goals++;
            } else {
                scorers.set(playerId, {player: goal.player, goals: 1});
            }
        });

        return Array.from(scorers.values())
            .sort((a, b) => b.goals - a.goals);
    }
}