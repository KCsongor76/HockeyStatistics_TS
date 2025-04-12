// ScoreData.ts
import { IScoreData } from "../interfaces/IScoreData";

export class ScoreData implements IScoreData {
    readonly goals: number;
    readonly shots: number;
    readonly turnovers: number;

    constructor(goals: number = 0, shots: number = 0, turnovers: number = 0) {
        this.goals = goals;
        this.shots = shots;
        this.turnovers = turnovers;
    }

    static fromPlainObject(obj: any): ScoreData {
        return new ScoreData(obj.goals, obj.shots, obj.turnovers);
    }

    toPlainObject(): IScoreData {
        return {
            goals: this.goals,
            shots: this.shots,
            turnovers: this.turnovers
        };
    }

    toString(): string {
        return `Goals: ${this.goals}, Shots: ${this.shots}, Turnovers: ${this.turnovers}`;
    }

    equals(other: ScoreData): boolean {
        if (!(other instanceof ScoreData)) return false;
        return this.goals === other.goals &&
            this.shots === other.shots &&
            this.turnovers === other.turnovers;
    }

    // Calculate shooting percentage
    getShootingPercentage(): number {
        if (this.shots === 0) return 0;
        return (this.goals / this.shots) * 100;
    }
}