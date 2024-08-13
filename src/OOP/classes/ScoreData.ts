export class ScoreData {
    private _goals: number;
    private _shots: number;
    private _turnovers: number;

    constructor(goals: number, shots: number, turnovers: number) {
        this._goals = goals;
        this._shots = shots;
        this._turnovers = turnovers;
    }
}