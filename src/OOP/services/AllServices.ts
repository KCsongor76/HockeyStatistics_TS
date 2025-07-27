import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc, where
} from "firebase/firestore";
import {db, storage} from "../../firebaseConfig";
import {IChampionship} from "../interfaces/IChampionship";
import {Game} from "../classes/Game";
import {IGame} from "../interfaces/IGame";
import {IPlayer} from "../interfaces/IPlayer";
import {Player} from "../classes/Player";
import {Position} from "../enums/Position";
import {ITeam} from "../interfaces/ITeam";
import {Team} from "../classes/Team";
import {TeamAlreadyExistsError} from "../errors/TeamAlreadyExistsError";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";

// todo: arrow functions, atomic operations, batch writes?

export class ChampionshipService {
    private static collectionRef = collection(db, 'championships');

    static async getChampionship(id: string) {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    static async deleteChampionship(id: string) {
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }

    static async getAllChampionships(): Promise<IChampionship[]> {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as IChampionship));
    }
}


export class GameService {
    private static collectionRef = collection(db, 'games');

    static saveGame = async (game: Game) => {
        const docRef = doc(this.collectionRef); // Generate ID upfront
        const gameWithId = {...game.toPlainObject(), id: docRef.id};
        await setDoc(docRef, gameWithId); // Single write operation
        return gameWithId as IGame;
    }

    static getGame = async (game: IGame) => {
        const docRef = doc(this.collectionRef, game.id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} as IGame : null;
    }

    static getAllGames = async () => {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as IGame));
    }

    static deleteGame = async (game: IGame) => {
        const id = game.id;
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }
}


export class PlayerService {
    private static toPlayer(playerData: IPlayer): Player {
        return new Player(
            playerData.name,
            playerData.position as Position,
            playerData.jerseyNumber,
            playerData.teamId,
            playerData.id
        );
    }

    static async addPlayerToTeam(teamId: string, player: Player) {
        const docRef = doc(collection(db, `teams/${teamId}/players`)); // Generate ID
        const playerWithId = {...player, id: docRef.id, teamId}; // Include teamId
        await setDoc(docRef, playerWithId); // Single write
    }

    static async getPlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    static async updatePlayer(teamId: string, playerId: string, player: Partial<IPlayer>) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await updateDoc(docRef, player);
    }

    static async deletePlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await deleteDoc(docRef);
    }

    static async getPlayersByTeam(teamId: string): Promise<IPlayer[]> {
        const playersCollectionRef = collection(db, `teams/${teamId}/players`);
        const querySnapshot = await getDocs(playersCollectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as IPlayer));
    }

    static async getAllPlayers(): Promise<IPlayer[]> {
        // Single query for all players across teams
        await TeamService.createFreeAgentTeamIfNotExists();

        const playersCollectionGroup = collectionGroup(db, 'players');
        const querySnapshot = await getDocs(playersCollectionGroup);
        const allPlayers = querySnapshot.docs.map(doc => {
            const teamId = doc.ref.parent.parent?.id; // Extract teamId from path
            return {id: doc.id, teamId, ...doc.data()} as IPlayer;
        });

        // Existing sorting logic
        allPlayers.sort((a, b) => {
            const positionOrder = {'Goalie': 0, 'Defender': 1, 'Forward': 2};
            const aOrder = positionOrder[a.position as keyof typeof positionOrder] ?? 3;
            const bOrder = positionOrder[b.position as keyof typeof positionOrder] ?? 3;
            return aOrder !== bOrder ? aOrder - bOrder : a.name.localeCompare(b.name);
        });

        return allPlayers;
    }

    // static async getPlayerById(playerId: string): Promise<Player | null> {
    //     const playerData = await this.getPlayerById(playerId);
    //     return playerData ? this.toPlayer(playerData) : null;
    // }

    static async getPlayerById(playerId: string): Promise<IPlayer | null> {
        // Direct query by player ID using collection group
        const playersCollectionGroup = collectionGroup(db, 'players');
        const q = query(playersCollectionGroup, where('id', '==', playerId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const playerDoc = snapshot.docs[0];
        const teamId = playerDoc.ref.parent.parent?.id;
        return {id: playerDoc.id, teamId, ...playerDoc.data()} as IPlayer;
    }

}


export class TeamService {
    private static collectionRef = collection(db, 'teams');

    private static toTeam(teamData: ITeam): Team {
        return Team.fromPlain(teamData);
    }

    static createTeam = async (team: Team) => {
        // Check for existing team name using a query (faster than fetching all)
        const q = query(this.collectionRef, where('name', '==', team.name));
        if (!(await getDocs(q)).empty) {
            throw new TeamAlreadyExistsError(`Team "${team.name}" already exists`);
        }

        // Single write operation
        const docRef = doc(this.collectionRef);
        const teamWithId = {...team, id: docRef.id};
        await setDoc(docRef, teamWithId);
    }

    static async getTeamById(id: string): Promise<ITeam | null> {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        // Get players subcollection
        const playersCollectionRef = collection(docRef, 'players');
        const playersSnapshot = await getDocs(playersCollectionRef);

        const players = playersSnapshot.docs.map(playerDoc => ({
            id: playerDoc.id,
            ...playerDoc.data()
        } as IPlayer));

        return {
            id: docSnap.id,
            ...docSnap.data(),
            players // add players to the team object
        } as ITeam;
    }

    static async updateTeam(id: string, team: Team) {
        const docRef = doc(this.collectionRef, id);
        console.log(team)
        // @ts-ignore
        await updateDoc(docRef, team.toPlainObject());
    }

    static async deleteTeam(id: string) {
        const teamDocRef = doc(this.collectionRef, id);

        // Reference to the "players" subcollection
        const playersCollectionRef = collection(teamDocRef, "players");

        // Get all documents in the "players" subcollection
        const playersSnapshot = await getDocs(playersCollectionRef);

        // Delete each document in the "players" subcollection
        const deletePromises = playersSnapshot.docs.map((playerDoc) => deleteDoc(playerDoc.ref));

        // Wait for all player documents to be deleted
        await Promise.all(deletePromises);

        console.log("Team deleted successfully.");

        // Finally, delete the team document
        await deleteDoc(teamDocRef);
    }

    static async getAllTeams(): Promise<ITeam[]> {
        // Fetch all teams and players in parallel
        const teamsSnapshot = await getDocs(this.collectionRef);
        const teamsData = teamsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ITeam));

        // Fetch all players using a collection group query
        const playersSnapshot = await getDocs(collectionGroup(db, 'players'));
        const playersByTeamId = playersSnapshot.docs.reduce((acc, doc) => {
            const teamId = doc.ref.parent.parent?.id;
            if (teamId) {
                if (!acc[teamId]) acc[teamId] = [];
                acc[teamId].push({id: doc.id, ...doc.data()} as IPlayer);
            }
            return acc;
        }, {} as Record<string, IPlayer[]>);

        // Merge players into teams
        const teams = teamsData.map(team => ({
            ...team,
            players: playersByTeamId[team.id]?.sort((a, b) => a.name.localeCompare(b.name)) || []
        }));

        // Sort teams alphabetically
        teams.sort((a, b) => a.name.localeCompare(b.name));
        return teams;
    }


    static async getTeamsByChampionship(championshipId: string) {
        const q = query(this.collectionRef, where('championshipId', '==', championshipId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }

    static uploadLogo = async (logo: File) => {
        const logoRef = ref(storage, `team-logos/${logo.name}`);
        await uploadBytes(logoRef, logo);
        return await getDownloadURL(logoRef);
    };

    static deleteLogo = async (logoUrl: string) => {
        if (!logoUrl) return;
        try {
            const storageRef = ref(storage, logoUrl);
            await deleteObject(storageRef);
        } catch (error) {
            console.error("Error deleting logo:", error);
            throw error;
        }
    };

    static checkLogoExists = async (fileName: string, isTeamCreation: boolean = false): Promise<boolean> => {
        const logoRef = ref(storage, `team-logos/${fileName}`);
        try {
            await getDownloadURL(logoRef);
            return true;
        } catch (error) {
            if (!isTeamCreation) {
                console.error("Error deleting logo:", error);
            }
            return false;
        }
    };

    // In TeamService.ts
    static async createFreeAgentTeamIfNotExists() {
        const freeAgentId = "free-agent";
        const freeAgentDocRef = doc(this.collectionRef, freeAgentId);
        const docSnap = await getDoc(freeAgentDocRef);

        if (!docSnap.exists()) {
            const freeAgentTeam = {
                id: freeAgentId,
                name: "Free Agents",
                logo: "",
                homeColor: {primary: "#CCCCCC", secondary: "#FFFFFF"},
                awayColor: {primary: "#FFFFFF", secondary: "#CCCCCC"},
                championships: [],
                players: []
            };
            await setDoc(freeAgentDocRef, freeAgentTeam);
        }
    }

    // todo: move to PlayerService?
    static transferPlayer = async (fromTeamId: string, toTeamId: string, player: IPlayer) => {
        try {
            // Remove from old team
            if (fromTeamId /*&& fromTeamId !== "free-agent"*/) {
                const fromRef = doc(db, `teams/${fromTeamId}/players`, player.id);
                await deleteDoc(fromRef);
            }

            // Add to new team
            if (toTeamId /*&& toTeamId !== "free-agent"*/) {
                const toRef = doc(db, `teams/${toTeamId}/players`, player.id);
                await setDoc(toRef, {...player, teamId: toTeamId});
            }
        } catch (error) {
            console.error('Error transferring player:', error);
            throw new Error('Failed to transfer player');
        }
    }
}