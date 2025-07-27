import {
    addDoc, collection, collectionGroup, deleteDoc, doc,
    getDoc, getDocs, setDoc, updateDoc, query, where  // <-- Add these
} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {IPlayer} from "../interfaces/IPlayer";
import {Player} from "../classes/Player";
import {Position} from "../enums/Position";
import {TeamService} from "./TeamService";

// todo: arrow functions, atomic operations, batch writes?

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