import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {db, storage} from "../../firebaseConfig";
import {TeamAlreadyExistsError} from "../errors/TeamAlreadyExistsError";
import {IPlayer} from "../interfaces/IPlayer";
import {ITeam} from "../interfaces/ITeam";

// todo: arrow functions, atomic operations, batch writes?

export class TeamService {
    private static collectionRef = collection(db, 'teams');

    // TODO: arrow functions
    static createTeam = async (team: ITeam) => {
        const teams = await this.getAllTeams();
        const names = teams.map(t => t.name);
        if (names.includes(team.name)) {
            throw new TeamAlreadyExistsError(`Team "${team.name}" already exists`);
        }

        const docRef = await addDoc(this.collectionRef, {});
        const teamId = docRef.id;
        const teamWithId = {
            ...team,
            id: teamId
        };
        await setDoc(docRef, teamWithId);
    }

    static async getTeamById(id: string): Promise<ITeam | null> {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} as ITeam : null;
    }

    static async updateTeam(id: string, team: Partial<ITeam>) {
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
        const querySnapshot = await getDocs(this.collectionRef);

        const teams = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const playersSnapshot = await getDocs(collection(doc.ref, 'players'));
            const players = playersSnapshot.docs.map(playerDoc => ({
                id: playerDoc.id,
                ...playerDoc.data()
            } as IPlayer));

            return {
                id: doc.id,
                ...doc.data(),
                players
            } as ITeam;
        }));

        // Sort teams alphabetically by name
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

    static transferPlayer = async (fromTeam: ITeam, toTeam: ITeam, player: IPlayer): Promise<void> => {
        try {
            // Reference to the player's document in the `fromTeam`'s players subcollection
            const fromTeamPlayerRef = doc(db, `teams/${fromTeam.id}/players`, player.id);
            // Remove the player from the `fromTeam`'s players subcollection

            await deleteDoc(fromTeamPlayerRef);
            // Reference to the player's document in the `toTeam`'s players subcollection
            const toTeamPlayerRef = doc(db, `teams/${toTeam.id}/players`, player.id);

            // Create the player object with the updated teamId using toPlainObject() for consistency
            const updatedPlayerData = {
                ...player,
                teamId: toTeam.id,
            };

            console.log(updatedPlayerData);

            // Add the player to the `toTeam`'s players subcollection
            console.log(5)
            await setDoc(toTeamPlayerRef, updatedPlayerData);

            console.log(`Player ${player.name} transferred from team ${fromTeam.name} to team ${toTeam.name}`);
        } catch (error) {
            console.error('Error transferring player:', error);
            throw new Error('Failed to transfer player');
        }
    }


}