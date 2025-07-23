import {PlayoffPeriod, RegularPeriod} from "../enums/Period";
import {ActionType} from "../enums/ActionType";
import {IGameAction} from "../interfaces/IGameAction";
import {Player} from "./Player";
import {TeamWithRoster} from "./TeamWithRoster";
import {GameType} from "../enums/GameType";

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