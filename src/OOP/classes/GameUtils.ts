import {GameType} from "../enums/GameType";
import {PlayoffPeriod, RegularPeriod} from "../enums/Period";


export class GameUtils {
    static formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    static getPeriodLabel(num: number, gameType: GameType): string {
        if (gameType === GameType.REGULAR) {
            switch (num) {
                case RegularPeriod.FIRST: return "1st";
                case RegularPeriod.SECOND: return "2nd";
                case RegularPeriod.THIRD: return "3rd";
                case RegularPeriod.OT: return "OT";
                case RegularPeriod.SO: return "SO";
                default: return `${num}`;
            }
        } else {
            switch (num) {
                case PlayoffPeriod.FIRST: return "1st";
                case PlayoffPeriod.SECOND: return "2nd";
                case PlayoffPeriod.THIRD: return "3rd";
                case PlayoffPeriod.OT1: return "OT1";
                case PlayoffPeriod.OT2: return "OT2";
                case PlayoffPeriod.OT3: return "OT3";
                case PlayoffPeriod.OT4: return "OT4";
                case PlayoffPeriod.OT5: return "OT5";
                default: return `${num}`;
            }
        }
    }
}