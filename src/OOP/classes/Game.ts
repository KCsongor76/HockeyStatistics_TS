import {IGameAction} from "../interfaces/IGameAction";
import {IScoreData} from "../interfaces/IScoreData";
import {ITeam} from "../interfaces/ITeam";

export class Game {
    private _id: string = "";
    private _timestamp: string = "";
    private _actions: IGameAction[] = [];
    private _teams: {
        home: ITeam,
        away: ITeam
    } = {
        home: {} as ITeam,
        away: {} as ITeam
    };

    private _score: {
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
    private _selectedImage: string = "";


    constructor(id: string, timestamp: string, actions: IGameAction[], teams: { home: ITeam; away: ITeam }, score: {
        home: IScoreData;
        away: IScoreData
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

    get actions(): IGameAction[] {
        return this._actions;
    }

    get Teams(): { home: ITeam; away: ITeam } {
        return this._teams;
    }

    get score(): { home: IScoreData; away: IScoreData } {
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
                home: IScoreData.fromInterface(game.score.home),
                away: IScoreData.fromInterface(game.score.away)
            },
            game.selectedImage
        );
    }*/
}