import {IGameAction} from "../interfaces/IGameAction";
import {IScoreData} from "../interfaces/IScoreData";
import {GameType} from "../enums/GameType";
import {TeamWithRoster} from "./TeamWithRoster";
import {ITeamColor} from "../interfaces/ITeamColor";
import {IGame} from "../interfaces/IGame";
import {Team} from "./Team";
import {GameAction} from "./GameAction";
import {Championship} from "./Championship";
import {Season} from "../enums/Season";

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