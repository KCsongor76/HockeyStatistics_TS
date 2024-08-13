import {FirebaseService} from "../interfaces/FirebaseService";
import {Player} from "../classes/Player";
import {addDoc, collection, deleteDoc, doc, getDocs} from "firebase/firestore";
import {db} from "../../firebaseConfig";

// TODO: collection logic change, adapt to it (teams have players, not separate collections)

export class PlayerService implements FirebaseService<Player> {
    private playerCollectionRef = collection(db, "players");

    async create(item: Player): Promise<void> {
        await addDoc(this.playerCollectionRef, item)
    }

    async read(id: number): Promise<Player | undefined> {
        const players = await this.list()
        return players.find(player => player.id === id)
    }

    async update(id: number, item: Player): Promise<void> {
        // TODO
        return Promise.resolve(undefined);
    }

    async delete(id: number): Promise<void> {
        const playerDoc = doc(this.playerCollectionRef, id.toString());
        await deleteDoc(playerDoc)
    }

    async list(): Promise<Player[]> {
        const data = await getDocs(this.playerCollectionRef)
        return data.docs.map(doc => doc.data() as Player)
    }
}