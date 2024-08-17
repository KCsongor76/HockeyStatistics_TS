import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {db, storage} from "../../firebaseConfig";
import {Team} from "../classes/Team";


export class TeamService {
    private static collectionRef = collection(db, 'teams');

    // TODO: arrow functions
    static createTeam = async (team: Team) => {

        const docRef = await addDoc(this.collectionRef, {});
        const teamId = docRef.id;
        const teamWithId = {
            ...team.toPlainObject(),
            id: teamId
        };
        await setDoc(docRef, teamWithId);

    }

    static async getTeam(id: string) {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
    }

    static async updateTeam(id: string, team: Partial<Team>) {
        const docRef = doc(this.collectionRef, id);
        await updateDoc(docRef, team);
    }

    static async deleteTeam(id: string) {
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }

    static async getAllTeams(): Promise<Team[]> {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Team));
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

}