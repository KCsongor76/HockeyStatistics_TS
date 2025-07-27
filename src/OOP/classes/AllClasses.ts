import {IChampionship} from "../interfaces/IChampionship";
import {Season} from "../enums/Season";
import {IGameAction} from "../interfaces/IGameAction";
import {IScoreData} from "../interfaces/IScoreData";
import {GameType} from "../enums/GameType";
import {ITeamColor} from "../interfaces/ITeamColor";
import {IGame} from "../interfaces/IGame";
import {PlayoffPeriod, RegularPeriod} from "../enums/Period";
import {ActionType} from "../enums/ActionType";
import {Position} from "../enums/Position";
import {PlayerService} from "../services/PlayerService";
import {TeamService} from "../services/TeamService";
import {IPlayer} from "../interfaces/IPlayer";
import {ITeam} from "../interfaces/ITeam";
import {deleteObject, ref} from "firebase/storage";
import {storage} from "../../firebaseConfig";
import ITeamWithRoster from "../interfaces/ITeamWithRoster";


export class Championship {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    toPlainObject(): IChampionship {
        return {
            id: this.id,
            name: this.name,
        }
    }

    static fromPlain(plain: IChampionship): Championship {
        return new Championship(
            plain.id,
            plain.name,
        );
    }
}

export class Game {
    id: string = "";
    timestamp: string = "";
    season: Season;
    championship: Championship = new Championship("", "");
    actions: IGameAction[] = [];
    teams: {
        home: TeamWithRoster,
        away: TeamWithRoster
    } = {
        home: new TeamWithRoster("", "", {} as ITeamColor, {} as ITeamColor, [], [], [], [], ""),
        away: new TeamWithRoster("", "", {} as ITeamColor, {} as ITeamColor, [], [], [], [], ""),
    };

    score: {
        home: IScoreData,
        away: IScoreData
    } = {
        home: {
            goals: 0,
            shots: 0,
            turnovers: 0
        } as IScoreData,
        away: {
            goals: 0,
            shots: 0,
            turnovers: 0
        } as IScoreData,
    };
    type: GameType;
    selectedImage: string = "";


    constructor(id: string, timestamp: string, season: Season, championship: Championship, actions: IGameAction[], teams: {
        home: TeamWithRoster;
        away: TeamWithRoster
    }, score: {
        home: IScoreData;
        away: IScoreData
    }, type: GameType, selectedImage: string = "") {
        this.id = id;
        this.timestamp = timestamp;
        this.season = season;
        this.championship = championship;
        this.actions = actions;
        this.teams = teams;
        this.score = score;
        this.type = type;
        this.selectedImage = selectedImage;
    }

    // In Game class
    get homeTeam(): Team {
        return this.teams.home;
    }

    get awayTeam(): Team {
        return this.teams.away;
    }

    get homeScore(): number {
        return this.score.home.goals;
    }

    get awayScore(): number {
        return this.score.away.goals;
    }

    // todo
    static fromPlain(plain: IGame): Game {
        return new Game(
            plain.id,
            plain.timestamp,
            plain.season as Season,
            Championship.fromPlain(plain.championship),
            plain.actions.map(action => GameAction.fromPlain(action)),
            {
                home: TeamWithRoster.fromPlain(plain.teams.home),
                away: TeamWithRoster.fromPlain(plain.teams.away)
            },
            {
                home: plain.score.home,
                away: plain.score.away
            },
            plain.type,
            plain.selectedImage
        );
    }

    toPlainObject(): IGame {
        return {
            id: this.id,
            season: this.season,
            championship: this.championship.toPlainObject(),
            timestamp: this.timestamp,
            actions: this.actions.map(action => GameAction.fromPlain(action).toPlainObject()),
            teams: {
                home: this.teams.home.toPlainObject(),
                away: this.teams.away.toPlainObject()
            },
            score: {
                home: this.score.home,
                away: this.score.away
            },
            type: this.type,
            selectedImage: this.selectedImage
        };
    }

}


export class GameAction {
    team: TeamWithRoster;
    period: RegularPeriod | PlayoffPeriod;
    time: number;
    type: ActionType;
    player: Player;
    x: number;
    y: number;


    constructor(team: TeamWithRoster, period: RegularPeriod | PlayoffPeriod, time: number, type: ActionType, player: Player, x: number, y: number) {
        this.team = team;
        this.period = period;
        this.time = time;
        this.type = type;
        this.player = player;
        this.x = x;
        this.y = y;
    }

    static fromPlain(gameAction: IGameAction): GameAction {
        return new GameAction(
            TeamWithRoster.fromPlain(gameAction.team),
            gameAction.period,
            gameAction.time,
            gameAction.type,
            Player.fromPlain(gameAction.player),
            gameAction.x,
            gameAction.y
        )
    }

    toPlainObject(): IGameAction {
        return {
            team: this.team.toPlainObject(),
            period: this.period,
            time: this.time,
            type: this.type,
            player: this.player.toPlainObject(),
            x: this.x,
            y: this.y
        }
    }

    static calculateActionTimeSeconds(action: IGameAction, gameType: GameType): number {
        let periodStart = 0;
        let periodDuration = 0;

        if (gameType === GameType.PLAYOFF) {
            periodDuration = 1200; // 20 minutes
            periodStart = action.period <= 3
                ? (action.period - 1) * 1200
                : 3600 + (action.period - 4) * 1200;
        } else {
            if (action.period <= 3) {
                periodDuration = 1200;
                periodStart = (action.period - 1) * 1200;
            } else if (action.period === 4) { // OT
                periodDuration = 300;
                periodStart = 3600;
            } else if (action.period === 5) { // SO
                periodDuration = 0;
                periodStart = 3900;
            }
        }

        const elapsedInPeriod = periodDuration - action.time;
        return periodStart + elapsedInPeriod;
    }
}


export class GameState {
    period: number;
    time: number;
    isTimerRunning: boolean;
    homeScore: IScoreData;
    awayScore: IScoreData;
    actions: IGameAction[];
    periodLabel: string;
    isGameOver: boolean;

    constructor(initialState: {
        period: number;
        time: number;
        isTimerRunning: boolean;
        homeScore: IScoreData;
        awayScore: IScoreData;
        actions: IGameAction[];
        periodLabel: string;
        isGameOver: boolean;
    }) {
        this.period = initialState.period;
        this.time = initialState.time;
        this.isTimerRunning = initialState.isTimerRunning;
        this.homeScore = {...initialState.homeScore};
        this.awayScore = {...initialState.awayScore};
        this.actions = [...initialState.actions];
        this.periodLabel = initialState.periodLabel;
        this.isGameOver = initialState.isGameOver;
    }

    updateScore(teamId: string, actionType: ActionType, homeTeamId: string) {
        const score = teamId === homeTeamId ? this.homeScore : this.awayScore;

        switch (actionType) {
            case ActionType.GOAL:
                score.goals += 1;
                score.shots += 1;
                break;
            case ActionType.SHOT:
                score.shots += 1;
                break;
            case ActionType.TURNOVER:
                score.turnovers += 1;
                break;
        }
    }

    addAction(action: IGameAction) {
        this.actions.push(action);
    }
}


export class GameUtils {
    static formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    static getPeriodLabel(num: number, gameType: GameType): string {
        if (gameType === GameType.REGULAR) {
            switch (num) {
                case RegularPeriod.FIRST:
                    return "1st";
                case RegularPeriod.SECOND:
                    return "2nd";
                case RegularPeriod.THIRD:
                    return "3rd";
                case RegularPeriod.OT:
                    return "OT";
                case RegularPeriod.SO:
                    return "SO";
                default:
                    return `${num}`;
            }
        } else {
            switch (num) {
                case PlayoffPeriod.FIRST:
                    return "1st";
                case PlayoffPeriod.SECOND:
                    return "2nd";
                case PlayoffPeriod.THIRD:
                    return "3rd";
                case PlayoffPeriod.OT1:
                    return "OT1";
                case PlayoffPeriod.OT2:
                    return "OT2";
                case PlayoffPeriod.OT3:
                    return "OT3";
                case PlayoffPeriod.OT4:
                    return "OT4";
                case PlayoffPeriod.OT5:
                    return "OT5";
                default:
                    return `${num}`;
            }
        }
    }
}


export class Player {
    id: string;
    name: string;
    position: Position;
    jerseyNumber: number;
    teamId: string;

    constructor(name: string, position: Position, jerseyNumber: number, teamId: string, id?: string) {
        this.id = id || "0";
        this.name = name;
        this.position = position;
        this.jerseyNumber = jerseyNumber;
        this.teamId = teamId;
    }

    static async create(
        name: string,
        position: Position,
        jerseyNumber: number,
        teamId: string
    ): Promise<Player> {
        const player = new Player(name, position, jerseyNumber, teamId);
        await PlayerService.addPlayerToTeam(teamId, player);
        return player;
    }

    static async isJerseyNumberAvailable(teamId: string, jerseyNumber: number): Promise<boolean> {
        const existingPlayers = await PlayerService.getPlayersByTeam(teamId);
        return !existingPlayers.some(p => p.jerseyNumber === jerseyNumber);
    }

    async transferToTeam(newTeam: Team): Promise<void> {
        const oldTeamId = this.teamId;
        this.teamId = newTeam.id;
        await TeamService.transferPlayer(oldTeamId, newTeam.id, this as unknown as IPlayer);
    }

    static getPlayerStats(players: IPlayer[], actions: IGameAction[], teamId?: string) {
        return players.map(player => {
            const playerActions = actions.filter(a =>
                a.player.id === player.id &&
                (!teamId || a.team.id === teamId)
            );

            return {
                ...player,
                goals: playerActions.filter(a => a.type === ActionType.GOAL).length,
                shots: playerActions.filter(a => [ActionType.SHOT, ActionType.GOAL].includes(a.type)).length,
                turnovers: playerActions.filter(a => a.type === ActionType.TURNOVER).length
            };
        });
    }

    static fromPlain(player: IPlayer): Player {
        return new Player(
            player.name,
            player.position as Position,
            player.jerseyNumber,
            player.teamId,
            player.id
        )
    }

    toPlainObject(): IPlayer {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            jerseyNumber: this.jerseyNumber,
            teamId: this.teamId,
        }
    }
}


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


export class ScoreData {
    private _goals: number;
    private _shots: number;
    private _turnovers: number;

    constructor(goals: number, shots: number, turnovers: number) {
        this._goals = goals;
        this._shots = shots;
        this._turnovers = turnovers;
    }

    get goals(): number {
        return this._goals;
    }

    get shots(): number {
        return this._shots;
    }

    get turnovers(): number {
        return this._turnovers;
    }

    set goals(value: number) {
        this._goals = value;
    }

    set shots(value: number) {
        this._shots = value;
    }

    set turnovers(value: number) {
        this._turnovers = value;
    }

    /*static fromInterface(score: IScoreData): ScoreData {
        return new ScoreData(score.goals, score.shots, score.turnovers);
    }*/
}


export class Team {
    id: string;
    name: string;
    logo: string;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    championships: Championship[];
    players: Player[];
    seasons: Season[];

    constructor(
        name: string,
        logo: string,
        homeColor: ITeamColor,
        awayColor: ITeamColor,
        seasons: Season[],
        championships: Championship[],
        players?: Player[],
        id?: string
    ) {
        this.id = id || "0";
        this.name = name;
        this.logo = logo;
        this.homeColor = homeColor;
        this.awayColor = awayColor;
        this.seasons = seasons;
        this.championships = championships;
        this.players = players || [];
    }

    static fromPlain(plain: ITeam): Team {
        return new Team(
            plain.name,
            plain.logo,
            plain.homeColor,
            plain.awayColor,
            plain.seasons as Season[] || [],
            plain.championships.map((c: IChampionship) => new Championship(c.id, c.name)),
            plain.players.map((p: IPlayer) => new Player(p.name, p.position as Position, p.jerseyNumber, p.teamId, p.id)),
            plain.id
        );
    }

    // Add this method to convert to plain object for serialization
    toPlainObject(): ITeam {
        return {
            id: this.id,
            name: this.name,
            logo: this.logo,
            homeColor: this.homeColor,
            awayColor: this.awayColor,
            seasons: this.seasons,
            championships: this.championships.map((c: Championship) => c.toPlainObject()),
            players: this.players.map((p: Player) => p.toPlainObject()),
        };
    }

    async uploadLogo(file: File): Promise<void> {
        this.logo = await TeamService.uploadLogo(file);
    }

    async deleteLogo(): Promise<void> {
        if (this.logo) {
            try {
                const storageRef = ref(storage, this.logo);
                await deleteObject(storageRef);
            } catch (error) {
                console.error("Error deleting logo:", error);
            }
        }
    }

    async update(name: string, logoFile: File | null): Promise<Team> {
        const oldLogoUrl = this.logo;
        let newLogo = this.logo;

        if (logoFile) {
            newLogo = await TeamService.uploadLogo(logoFile);
        }

        const updatedTeam = new Team(
            name,
            newLogo,
            this.homeColor,
            this.awayColor,
            this.seasons,
            this.championships,
            this.players,
            this.id
        );

        await TeamService.updateTeam(this.id, updatedTeam);

        // Delete old logo after successful update
        if (logoFile && oldLogoUrl) {
            try {
                await TeamService.deleteLogo(oldLogoUrl);
            } catch (error) {
                console.error("Error deleting old logo:", error);
            }
        }

        return updatedTeam;
    }
}


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