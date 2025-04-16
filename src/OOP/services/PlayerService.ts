import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {Player} from "../classes/Player";

// todo: arrow functions, atomic operations, batch writes?

export class PlayerService {
    static async addPlayerToTeam(player: Player) {
        const teamId = player.teamId;
        const docRef = await addDoc(collection(db, `teams/${teamId}/players`), {});

        const id = docRef.id
        const name = player.name
        const position = player.position
        const jerseyNumber = player.jerseyNumber
        const playerWithId = new Player(id, name, position, teamId, jerseyNumber);

        await setDoc(docRef, playerWithId.toPlainObject());
    }

    // static async getPlayer(teamId: string, playerId: string) {
    //     const docRef = doc(db, `teams/${teamId}/players`, playerId);
    //     const docSnap = await getDoc(docRef);
    //     return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    // }
    //
    // static async updatePlayer(teamId: string, playerId: string, player: Partial<IPlayer>) {
    //     const docRef = doc(db, `teams/${teamId}/players`, playerId);
    //     await updateDoc(docRef, player);
    // }

    static async deletePlayer(teamId: string, playerId: string) {
        const docRef = doc(db, `teams/${teamId}/players`, playerId);
        await deleteDoc(docRef);
    }

    // static async getPlayersByTeam(teamId: string): Promise<IPlayer[]> {
    //     const playersCollectionRef = collection(db, `teams/${teamId}/players`);
    //     const querySnapshot = await getDocs(playersCollectionRef);
    //     return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as IPlayer));
    // }

    static async getAllPlayers(): Promise<Player[]> {
        const teamsCollectionRef = collection(db, 'teams');
        const teamsQuerySnapshot = await getDocs(teamsCollectionRef);

        const allPlayers: Player[] = [];

        for (const teamDoc of teamsQuerySnapshot.docs) {
            const playersCollectionRef = collection(db, `teams/${teamDoc.id}/players`);
            const playersQuerySnapshot = await getDocs(playersCollectionRef);

            const teamPlayers = playersQuerySnapshot.docs.map(doc => {

                const id = doc.id
                const player = doc.data()
                const name = player.name
                const position = player.position
                const teamId = teamDoc.id
                const jerseyNumber = player.jerseyNumber

                return new Player(id, name, position, teamId, jerseyNumber);

            });
            allPlayers.push(...teamPlayers);
        }

        // todo: Sort players: goalies -> defenders -> forwards, then alphabetically
        // allPlayers.sort((a, b) => {
        //     const positionOrder = {'Goalie': 0, 'Defender': 1, 'Forward': 2};
        //     const aOrder = positionOrder[a.position as keyof typeof positionOrder] ?? 3;
        //     const bOrder = positionOrder[b.position as keyof typeof positionOrder] ?? 3;
        //
        //     if (aOrder !== bOrder) {
        //         return aOrder - bOrder;
        //     }
        //     return a.name.localeCompare(b.name);
        // });

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
                const id = playerDoc.id
                const player = playerDoc.data()
                const name = player.name
                const position = player.position
                const teamId = teamDoc.id
                const jerseyNumber = player.jerseyNumber

                return new Player(id, name, position, teamId, jerseyNumber);
                // return {id: playerDoc.id, ...playerDoc.data()} as Player;
            }
        }

        return null; // Player not found in any team
    }

}