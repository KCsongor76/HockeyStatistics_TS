import {Team} from "./Team";
import {Position} from "../enums/Position";
import {TeamService} from "../services/TeamService";
import {IPlayer} from "../interfaces/IPlayer";
import {IGameAction} from "../interfaces/IGameAction";
import {ActionType} from "../enums/ActionType";
import {PlayerService} from "../services/PlayerService";


export class Player {
    id: string;
    name: string;
    position: Position;
    jerseyNumber: number;
    teamId: string;

    constructor(name: string, position: Position, jerseyNumber: number, teamId: string, id?: string) {
        this.id = id || "0";
        this.name = name;
        this.position = position;
        this.jerseyNumber = jerseyNumber;
        this.teamId = teamId;
    }

    static async create(
        name: string,
        position: Position,
        jerseyNumber: number,
        teamId: string
    ): Promise<Player> {
        const player = new Player(name, position, jerseyNumber, teamId);
        await PlayerService.addPlayerToTeam(teamId, player);
        return player;
    }

    static async isJerseyNumberAvailable(teamId: string, jerseyNumber: number): Promise<boolean> {
        const existingPlayers = await PlayerService.getPlayersByTeam(teamId);
        return !existingPlayers.some(p => p.jerseyNumber === jerseyNumber);
    }

    async transferToTeam(newTeam: Team): Promise<void> {
        const oldTeamId = this.teamId;
        this.teamId = newTeam.id;
        await TeamService.transferPlayer(oldTeamId, newTeam.id, this as unknown as IPlayer);
    }

    static getPlayerStats(players: IPlayer[], actions: IGameAction[], teamId?: string) {
        return players.map(player => {
            const playerActions = actions.filter(a =>
                a.player.id === player.id &&
                (!teamId || a.team.id === teamId)
            );

            return {
                ...player,
                goals: playerActions.filter(a => a.type === ActionType.GOAL).length,
                shots: playerActions.filter(a => [ActionType.SHOT, ActionType.GOAL].includes(a.type)).length,
                turnovers: playerActions.filter(a => a.type === ActionType.TURNOVER).length
            };
        });
    }

    static fromPlain(player: IPlayer): Player {
        return new Player(
            player.name,
            player.position as Position,
            player.jerseyNumber,
            player.teamId,
            player.id
        )
    }

    toPlainObject(): IPlayer {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            jerseyNumber: this.jerseyNumber,
            teamId: this.teamId,
        }
    }
}