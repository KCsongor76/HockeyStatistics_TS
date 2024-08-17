import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {PlayerInterface} from "../interfaces/PlayerInterface";

class PlayerService {
    async addPlayerToTeam(teamId: string, player: PlayerInterface) {
        const playersCollectionRef = collection(db, `teams/${teamId}/players`);
        return await addDoc(playersCollectionRef, player);
    }

    async getPlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    async updatePlayer(teamId: string, playerId: string, player: Partial<PlayerInterface>) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await updateDoc(docRef, player);
    }

    async deletePlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await deleteDoc(docRef);
    }

    async getPlayersByTeam(teamId: string) {
        const playersCollectionRef = collection(db, `teams/${teamId}/players`);
        const querySnapshot = await getDocs(playersCollectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }
}