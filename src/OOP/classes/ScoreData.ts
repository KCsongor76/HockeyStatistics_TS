import {ScoreDataInterface} from "../interfaces/ScoreDataInterface";

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

    static fromInterface(score: ScoreDataInterface): ScoreData {
        return new ScoreData(score.goals, score.shots, score.turnovers);
    }
}