import {
    addDoc, collection, collectionGroup, deleteDoc, doc,
    getDoc, getDocs, query, setDoc, updateDoc, where
} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {db, storage} from "../../firebaseConfig";
import {TeamAlreadyExistsError} from "../errors/TeamAlreadyExistsError";
import {IPlayer} from "../interfaces/IPlayer";
import {ITeam} from "../interfaces/ITeam";

// todo: arrow functions, atomic operations, batch writes?

export class TeamService {
    private static collectionRef = collection(db, 'teams');

    static createTeam = async (team: ITeam) => {
        // Check for existing team name using a query (faster than fetching all)
        const q = query(this.collectionRef, where('name', '==', team.name));
        if (!(await getDocs(q)).empty) {
            throw new TeamAlreadyExistsError(`Team "${team.name}" already exists`);
        }

        // Single write operation
        const docRef = doc(this.collectionRef);
        const teamWithId = {...team, id: docRef.id};
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
        // Fetch all teams and players in parallel
        const teamsSnapshot = await getDocs(this.collectionRef);
        const teamsData = teamsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ITeam));

        // Fetch all players using a collection group query
        const playersSnapshot = await getDocs(collectionGroup(db, 'players'));
        const playersByTeamId = playersSnapshot.docs.reduce((acc, doc) => {
            const teamId = doc.ref.parent.parent?.id;
            if (teamId) {
                if (!acc[teamId]) acc[teamId] = [];
                acc[teamId].push({id: doc.id, ...doc.data()} as IPlayer);
            }
            return acc;
        }, {} as Record<string, IPlayer[]>);

        // Merge players into teams
        const teams = teamsData.map(team => ({
            ...team,
            players: playersByTeamId[team.id]?.sort((a, b) => a.name.localeCompare(b.name)) || []
        }));

        // Sort teams alphabetically
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