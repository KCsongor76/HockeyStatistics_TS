import {Team} from "./Team";
import {ScoreData} from "./ScoreData";
import {GameAction} from "./GameAction";

export class Game {
    private _id: string = "";
    private _timestamp: string = "";
    private _actions: GameAction[] = [];
    private _teams: {
        home: Team,
        away: Team
    } = {
        home: new Team(),
        away: new Team()
    };

    private _score: {
        home: ScoreData,
        away: ScoreData
    } = {
        home: new ScoreData(0, 0, 0),
        away: new ScoreData(0, 0, 0)
    };
    private _selectedImage: string = "";


    constructor(id: string, timestamp: string, actions: GameAction[], teams: { home: Team; away: Team }, score: {
        home: ScoreData;
        away: ScoreData
    }, selectedImage: string = "") {
        this._id = id;
        this._timestamp = timestamp;
        this._actions = actions;
        this._teams = teams;
        this._score = score;
        this._selectedImage = selectedImage;
    }


    get id(): string {
        return this._id;
    }

    get timestamp(): string {
        return this._timestamp;
    }

    get actions(): GameAction[] {
        return this._actions;
    }

    get teams(): { home: Team; away: Team } {
        return this._teams;
    }

    get score(): { home: ScoreData; away: ScoreData } {
        return this._score;
    }

    get selectedImage(): string {
        return this._selectedImage;
    }

    /*static fromInterface(game: IGame): Game {
        return new Game(
            game.id,
            game.timestamp,
            game.actions.map((action: IGameAction) => GameAction.fromInterface(action as unknown as IGameAction)),
            {
                home: Team.fromInterface(game.teams.home as ITeam),
                away: Team.fromInterface(game.teams.away as ITeam)
            },
            {
                home: ScoreData.fromInterface(game.score.home),
                away: ScoreData.fromInterface(game.score.away)
            },
            game.selectedImage
        );
    }*/
}