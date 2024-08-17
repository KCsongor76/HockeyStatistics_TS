import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {Championship} from "../classes/Championship";

export class ChampionshipService {
    private static collectionRef = collection(db, 'championships');

    /*static async createChampionship(championship: string) {
        return await addDoc(this.collectionRef, championship);
    }*/

    static async getChampionship(id: string) {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    /*static async updateChampionship(id: string, championship: string) {
        const docRef = doc(this.collectionRef, id);
        await updateDoc(docRef, championship);
    }*/

    static async deleteChampionship(id: string) {
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }

    static async getAllChampionships(): Promise<Championship[]> {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Championship));
    }
}