import {GameInterface} from "../interfaces/GameInterface";
import {Team} from "./Team";
import {ScoreData} from "./ScoreData";
import {GameAction} from "./GameAction";
import {TeamInterface} from "../interfaces/TeamInterface";
import {GameActionInterface} from "../interfaces/GameActionInterface";

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

    static fromInterface(game: GameInterface): Game {
        return new Game(
            game._id,
            game._timestamp,
            game._actions.map((action: GameAction) => GameAction.fromInterface(action as unknown as GameActionInterface)),
            {
                home: Team.fromInterface(game._teams.home as TeamInterface),
                away: Team.fromInterface(game._teams.away as TeamInterface)
            },
            {
                home: ScoreData.fromInterface(game._score.home),
                away: ScoreData.fromInterface(game._score.away)
            },
            game._selectedImage
        );
    }
}