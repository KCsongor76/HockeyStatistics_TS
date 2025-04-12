import {ITeamColor} from "../interfaces/ITeamColor";

export class TeamColor implements ITeamColor {
    readonly primary: string;
    readonly secondary: string;

    constructor(primary: string, secondary: string) {
        this.primary = primary;
        this.secondary = secondary;
    }

    static fromPlainObject(obj: any): TeamColor {
        return new TeamColor(obj.primary, obj.secondary);
    }

    toPlainObject(): ITeamColor {
        return {
            primary: this.primary,
            secondary: this.secondary
        };
    }

    toString(): string {
        return `Primary: ${this.primary}, Secondary: ${this.secondary}`;
    }

    equals(other: TeamColor): boolean {
        if (!(other instanceof TeamColor)) return false;
        return this.primary === other.primary && this.secondary === other.secondary;
    }
}