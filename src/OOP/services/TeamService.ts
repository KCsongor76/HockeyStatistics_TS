import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {db, storage} from "../../firebaseConfig";
import {TeamAlreadyExistsError} from "../errors/TeamAlreadyExistsError";
import {Player} from "../classes/Player";
import {Team} from "../classes/Team";

// todo: arrow functions, atomic operations, batch writes?

export class TeamService {
    private static collectionRef = collection(db, 'teams');

    // TODO: arrow functions
    static createTeam = async (team: Team) => {
        const teams = await this.getAllTeams();
        const names = teams.map(t => t.name);
        if (names.includes(team.name)) {
            throw new TeamAlreadyExistsError(`Team "${team.name}" already exists`);
        }

        const docRef = await addDoc(this.collectionRef, {});
        const teamId = docRef.id;
        const teamWithId = {
            ...team.toPlainObject(),
            id: teamId
        };
        console.log(teamWithId);
        await setDoc(docRef, teamWithId);
    }

    static async getTeamById(id: string): Promise<Team | null> {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);

        const team = docSnap.data();
        if (team) {
            const name = team.name
            const logo = team.logo
            const players = team.players
            const homeColor = team.homeColor
            const awayColor = team.awayColor
            const championships = team.championships

            return new Team(docSnap.id, name, logo, players, homeColor, awayColor, championships);
        }

        return null

    }

    static async updateTeam(id: string, team: Partial<Team>) {
        const docRef = doc(this.collectionRef, id);
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

    static async getAllTeams(): Promise<Team[]> {
        const querySnapshot = await getDocs(this.collectionRef);

        const teams = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const playersSnapshot = await getDocs(collection(doc.ref, 'players'));
            const players = playersSnapshot.docs.map(playerDoc => ({
                id: playerDoc.id,
                ...playerDoc.data()
            } as Player));

            return {
                id: doc.id,
                ...doc.data(),
                players
            } as Team;
        }));

        // todo: Sort teams alphabetically by name
        // teams.sort((a, b) => a.name.localeCompare(b.name));

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

    static transferPlayer = async (fromTeam: Team, toTeam: Team, player: Player): Promise<void> => {
        try {
            const fromTeamPlayerRef = doc(db, `teams/${fromTeam.id}/players`, player.id);
            await deleteDoc(fromTeamPlayerRef);
            const toTeamPlayerRef = doc(db, `teams/${toTeam.id}/players`, player.id);

            const id = player.id
            const name = player.name
            const position = player.position
            const teamId = toTeam.id
            const jerseyNumber = player.jerseyNumber
            const updatedPlayerData = new Player(id, name, position, teamId, jerseyNumber);

            await setDoc(toTeamPlayerRef, updatedPlayerData.toPlainObject());

            console.log(`Player ${player.name} transferred from team ${fromTeam.name} to team ${toTeam.name}`);
        } catch (error) {
            console.error('Error transferring player:', error);
            throw new Error('Failed to transfer player');
        }
    }


}