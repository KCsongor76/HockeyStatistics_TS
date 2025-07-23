import { IGame } from "../interfaces/IGame";
import { GameType } from "../enums/GameType";

export class TeamStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    shots: number;
    turnovers: number;
    shootingPercentage: number;

    constructor(teamId: string, games: IGame[]) {
        this.gamesPlayed = 0;
        this.wins = 0;
        this.losses = 0;
        this.goalsFor = 0;
        this.goalsAgainst = 0;
        this.shots = 0;
        this.turnovers = 0;
        this.shootingPercentage = 0;

        this.calculateStats(teamId, games);
    }

    private calculateStats(teamId: string, games: IGame[]) {
        games.forEach(game => {
            const isHomeTeam = game.teams.home.id === teamId;
            const teamSide = isHomeTeam ? 'home' : 'away';
            const opponentSide = isHomeTeam ? 'away' : 'home';

            this.gamesPlayed++;
            this.goalsFor += game.score[teamSide].goals;
            this.goalsAgainst += game.score[opponentSide].goals;
            this.shots += game.score[teamSide].shots;
            this.turnovers += game.score[teamSide].turnovers;

            if (game.score[teamSide].goals > game.score[opponentSide].goals) {
                this.wins++;
            } else {
                this.losses++;
            }
        });

        this.shootingPercentage = this.shots > 0 ? (this.goalsFor / this.shots) * 100 : 0;
    }

    getRegularSeasonStats(teamId: string, games: IGame[]): TeamStats {
        const regularGames = games.filter(game => game.type === GameType.REGULAR);
        return new TeamStats(teamId, regularGames);
    }

    getPlayoffStats(teamId: string, games: IGame[]): TeamStats {
        const playoffGames = games.filter(game => game.type === GameType.PLAYOFF);
        return new TeamStats(teamId, playoffGames);
    }
}