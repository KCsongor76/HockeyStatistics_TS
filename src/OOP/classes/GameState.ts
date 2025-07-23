
import {ActionType} from "../enums/ActionType";
import {IScoreData} from "../interfaces/IScoreData";
import {IGameAction} from "../interfaces/IGameAction";

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
        this.homeScore = { ...initialState.homeScore };
        this.awayScore = { ...initialState.awayScore };
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

    // Other state management methods...
}