import {Championship} from "./Championship";
import {Player} from "./Player";
import {ITeamColor} from "../interfaces/ITeamColor";
import {ref, deleteObject} from "firebase/storage";
import {TeamService} from "../services/TeamService";
import {storage} from "../../firebaseConfig";
import {ITeam} from "../interfaces/ITeam";
import {IChampionship} from "../interfaces/IChampionship";
import {IPlayer} from "../interfaces/IPlayer";
import {Position} from "../enums/Position";

export class Team {
    id: string;
    name: string;
    logo: string;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    championships: Championship[];
    players: Player[];

    constructor(
        name: string,
        logo: string,
        homeColor: ITeamColor,
        awayColor: ITeamColor,
        championships: Championship[],
        players: Player[] = [],
        id?: string
    ) {
        this.id = id || "0";
        this.name = name;
        this.logo = logo;
        this.homeColor = homeColor;
        this.awayColor = awayColor;
        this.championships = championships;
        this.players = players;
    }

    static fromPlain(plain: ITeam): Team {
        return new Team(
            plain.name,
            plain.logo,
            plain.homeColor,
            plain.awayColor,
            plain.championships.map((c: IChampionship) => new Championship(c.id, c.name)),
            plain.players.map((p: IPlayer) => new Player(p.name, p.position as Position, p.jerseyNumber, p.teamId, p.id)),
            plain.id
        );
    }

    // Add this method to convert to plain object for serialization
    toPlainObject(): ITeam {
        return {
            id: this.id,
            name: this.name,
            logo: this.logo,
            homeColor: this.homeColor,
            awayColor: this.awayColor,
            championships: this.championships.map((c: Championship) => c.toPlainObject()),
            players: this.players.map((p: Player) => p.toPlainObject()),
        };
    }

    async uploadLogo(file: File): Promise<void> {
        this.logo = await TeamService.uploadLogo(file);
    }

    async deleteLogo(): Promise<void> {
        if (this.logo) {
            try {
                const storageRef = ref(storage, this.logo);
                await deleteObject(storageRef);
            } catch (error) {
                console.error("Error deleting logo:", error);
            }
        }
    }

    async update(name: string, logoFile: File | null): Promise<Team> {
        let newLogo = this.logo;

        if (logoFile) {
            newLogo = await TeamService.uploadLogo(logoFile);
        }

        const updatedTeam = new Team(
            name,
            newLogo,
            this.homeColor,
            this.awayColor,
            this.championships,
            this.players,
            this.id
        );

        await TeamService.updateTeam(this.id, updatedTeam/*.toPlainObject()*/);
        return updatedTeam;
    }
}