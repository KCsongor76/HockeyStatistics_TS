import { IGame } from "../interfaces/IGame";
import { ActionType } from "../enums/ActionType";
import { GameType } from "../enums/GameType";

export class PlayerStats {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    shots: number;
    shootingPercentage: number;

    constructor(playerId: string, games: IGame[]) {
        this.gamesPlayed = 0;
        this.goals = 0;
        this.assists = 0;
        this.points = 0;
        this.shots = 0;
        this.shootingPercentage = 0;

        this.calculateStats(playerId, games);
    }

    private calculateStats(playerId: string, games: IGame[]) {
        games.forEach(game => {
            game.actions.forEach(action => {
                if (action.player.id === playerId) {
                    switch (action.type) {
                        case ActionType.GOAL:
                            this.goals++;
                            this.shots++;
                            break;
                        case ActionType.ASSIST:
                            this.assists++;
                            break;
                        case ActionType.SHOT:
                            this.shots++;
                            break;
                    }
                }
            });
        });

        this.gamesPlayed = games.length;
        this.points = this.goals + this.assists;
        this.shootingPercentage = this.shots > 0 ? (this.goals / this.shots) * 100 : 0;
    }

    getRegularSeasonStats(games: IGame[], playerId: string): PlayerStats {
        const regularGames = games.filter(game => game.type === GameType.REGULAR);
        return new PlayerStats(playerId, regularGames);
    }

    getPlayoffStats(games: IGame[], playerId: string): PlayerStats {
        const playoffGames = games.filter(game => game.type === GameType.PLAYOFF);
        return new PlayerStats(playerId, playoffGames);
    }
}