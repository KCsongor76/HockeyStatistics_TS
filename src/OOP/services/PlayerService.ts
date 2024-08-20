import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {Player} from "../classes/Player";

export class PlayerService {
    static async addPlayerToTeam(teamId: string, player: Player) {
        const docRef = await addDoc(collection(db, `teams/${teamId}/players`), {});
        const playerId = docRef.id;
        console.log(player)
        console.log(playerId)
        const playerWithId = {
            ...player.toPlainObject(),
            id: playerId
        };
        console.log(playerWithId)
        await setDoc(docRef, playerWithId);
    }

    static async getPlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    static async updatePlayer(teamId: string, playerId: string, player: Partial<Player>) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await updateDoc(docRef, player);
    }

    static async deletePlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await deleteDoc(docRef);
    }

    static async getPlayersByTeam(teamId: string): Promise<Player[]> {
        const playersCollectionRef = collection(db, `teams/${teamId}/players`);
        const querySnapshot = await getDocs(playersCollectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Player));
    }

    static async getAllPlayers(): Promise<Player[]> {
        const teamsCollectionRef = collection(db, 'teams');
        const teamsQuerySnapshot = await getDocs(teamsCollectionRef);

        const allPlayers: Player[] = [];

        for (const teamDoc of teamsQuerySnapshot.docs) {
            const playersCollectionRef = collection(db, `teams/${teamDoc.id}/players`);
            const playersQuerySnapshot = await getDocs(playersCollectionRef);

            const teamPlayers = playersQuerySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Player));
            allPlayers.push(...teamPlayers);
        }

        return allPlayers;
    }


    static async getPlayerById(playerId: string): Promise<Player | null> {
        const teamsCollectionRef = collection(db, 'teams');
        const teamsQuerySnapshot = await getDocs(teamsCollectionRef);

        for (const teamDoc of teamsQuerySnapshot.docs) {
            const playersCollectionRef = collection(db, `teams/${teamDoc.id}/players`);
            const playerDocRef = doc(playersCollectionRef, playerId);
            const playerDoc = await getDoc(playerDocRef);

            if (playerDoc.exists()) {
                return {id: playerDoc.id, ...playerDoc.data()} as Player;

            }
        }

        return null; // Player not found in any team
    }

}