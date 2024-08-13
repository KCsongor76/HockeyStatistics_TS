import {FirebaseService} from "../interfaces/FirebaseService";
import {Team} from "../classes/Team";

import {db} from "../../firebaseConfig";
import {collection, doc, addDoc, deleteDoc, getDocs} from "firebase/firestore";

export class TeamService implements FirebaseService<Team> {
    private teamsCollectionRef = collection(db, "teams");

    async create(team: Team): Promise<void> {
        await addDoc(this.teamsCollectionRef, team)
    }

    async read(id: number): Promise<Team | undefined> {
        const teams = await this.list()
        return teams.find(team => team.id === id)
    }

    async update(id: number, team: Team): Promise<void> {
        // TODO
        return Promise.resolve(undefined);
    }

    async delete(id: number): Promise<void> {
        const teamDoc = doc(this.teamsCollectionRef, id.toString());
        await deleteDoc(teamDoc)
    }

    async list(): Promise<Team[]> {
        const data = await getDocs(this.teamsCollectionRef)
        return data.docs.map(doc => doc.data() as Team)
    }
}