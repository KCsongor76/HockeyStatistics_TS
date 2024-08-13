import {FirebaseService} from "../interfaces/FirebaseService";
import {Championship} from "../classes/Championship";

import {db} from "../../firebaseConfig";
import {collection, doc, addDoc, deleteDoc, getDocs} from "firebase/firestore";

export class ChampionshipService implements FirebaseService<Championship> {
    private championshipCollectionRef = collection(db, "championships");

    async create(item: Championship): Promise<void> {
        await addDoc(this.championshipCollectionRef, item)
    }

    async read(id: number): Promise<Championship | undefined> {
        const championships = await this.list()
        return championships.find(championship => championship.id === id)
    }

    async update(id: number, item: Championship): Promise<void> {
        // TODO
        return Promise.resolve(undefined);
    }

    async delete(id: number): Promise<void> {
        const teamDoc = doc(this.championshipCollectionRef, id.toString());
        await deleteDoc(teamDoc)
    }

    async list(): Promise<Championship[]> {
        const data = await getDocs(this.championshipCollectionRef)
        return data.docs.map(doc => doc.data() as Championship)
    }
}