import {IGameAction} from "../interfaces/IGameAction";
import {IScoreData} from "../interfaces/IScoreData";
import {GameType} from "../enums/GameType";
import {TeamWithRoster} from "./TeamWithRoster";
import {ITeamColor} from "../interfaces/ITeamColor";
import {IGame} from "../interfaces/IGame";
import {Team} from "./Team";
import {GameAction} from "./GameAction";
import {ITeam} from "../interfaces/ITeam";
import {ScoreData} from "./ScoreData";
import {Championship} from "./Championship";

export class Game {
    id: string = "";
    timestamp: string = "";
    championship: Championship = new Championship("", "");
    actions: IGameAction[] = [];
    teams: {
        home: TeamWithRoster,
        away: TeamWithRoster
    } = {
        home: new TeamWithRoster("", "", {} as ITeamColor, {} as ITeamColor, [], [], [], ""),
        away: new TeamWithRoster("", "", {} as ITeamColor, {} as ITeamColor, [], [], [], ""),
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


    constructor(id: string, timestamp: string, championship: Championship, actions: IGameAction[], teams: {
        home: TeamWithRoster;
        away: TeamWithRoster
    }, score: {
        home: IScoreData;
        away: IScoreData
    }, type: GameType, selectedImage: string = "") {
        this.id = id;
        this.timestamp = timestamp;
        this.championship = championship;
        this.actions = actions;
        this.teams = teams;
        this.score = score;
        this.type = type;
        this.selectedImage = selectedImage;
    }

    static fromPlain(plain: IGame): Game {
        return new Game(
            plain.id,
            plain.timestamp,
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