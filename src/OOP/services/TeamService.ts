import {
    addDoc, collection, collectionGroup, deleteDoc, doc,
    getDoc, getDocs, query, setDoc, updateDoc, where
} from "firebase/firestore";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {db, storage} from "../../firebaseConfig";
import {TeamAlreadyExistsError} from "../errors/TeamAlreadyExistsError";
import {IPlayer} from "../interfaces/IPlayer";
import {ITeam} from "../interfaces/ITeam";
import {Team} from "../classes/Team";

// todo: arrow functions, atomic operations, batch writes?

export class TeamService {
    private static collectionRef = collection(db, 'teams');

    private static toTeam(teamData: ITeam): Team {
        return Team.fromPlain(teamData);
    }

    static createTeam = async (team: Team) => {
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

        if (!docSnap.exists()) {
            return null;
        }

        // Get players subcollection
        const playersCollectionRef = collection(docRef, 'players');
        const playersSnapshot = await getDocs(playersCollectionRef);

        const players = playersSnapshot.docs.map(playerDoc => ({
            id: playerDoc.id,
            ...playerDoc.data()
        } as IPlayer));

        return {
            id: docSnap.id,
            ...docSnap.data(),
            players // add players to the team object
        } as ITeam;
    }

    static async updateTeam(id: string, team: Team) {
        const docRef = doc(this.collectionRef, id);
        console.log(team)
        // @ts-ignore
        await updateDoc(docRef, team.toPlainObject());
    }

    static async deleteTeam(id: string) {
        const teamDocRef = doc(this.collectionRef, id);

        // First get the team data to check for a logo
        const teamSnap = await getDoc(teamDocRef);
        const teamData = teamSnap.data() as ITeam | undefined;

        // Reference to the "players" subcollection
        const playersCollectionRef = collection(teamDocRef, "players");

        // Get all documents in the "players" subcollection
        const playersSnapshot = await getDocs(playersCollectionRef);

        // Delete each document in the "players" subcollection
        const deletePromises = playersSnapshot.docs.map((playerDoc) => deleteDoc(playerDoc.ref));

        // Wait for all player documents to be deleted
        await Promise.all(deletePromises);

        // Delete the team's logo if it exists
        if (teamData?.logo) {
            try {
                console.log("logo deleted")
                await this.deleteLogo(teamData.logo);
            } catch (error) {
                console.error("Error deleting team logo:", error);
                // Continue with team deletion even if logo deletion fails
            }
        }

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

    static deleteLogo = async (logoUrl: string) => {
        if (!logoUrl) return;
        try {
            const storageRef = ref(storage, logoUrl);
            await deleteObject(storageRef);
        } catch (error) {
            console.error("Error deleting logo:", error);
            throw error;
        }
    };

    static checkNameExists = async (name: string) => {
        const q = query(this.collectionRef, where('name', '==', name));
        return !(await getDocs(q)).empty;
    }

    static checkLogoExists = async (fileName: string, isTeamCreation: boolean = false): Promise<boolean> => {
        const logoRef = ref(storage, `team-logos/${fileName}`);
        try {
            await getDownloadURL(logoRef);
            return true;
        } catch (error) {
            if (!isTeamCreation) {
                console.error("Error deleting logo:", error);
            }
            return false;
        }
    };

    // In TeamService.ts
    static async createFreeAgentTeamIfNotExists() {
        const freeAgentId = "free-agent";
        const freeAgentDocRef = doc(this.collectionRef, freeAgentId);
        const docSnap = await getDoc(freeAgentDocRef);

        if (!docSnap.exists()) {
            const freeAgentTeam = {
                id: freeAgentId,
                name: "Free Agents",
                logo: "",
                homeColor: {primary: "#CCCCCC", secondary: "#FFFFFF"},
                awayColor: {primary: "#FFFFFF", secondary: "#CCCCCC"},
                championships: [],
                players: []
            };
            await setDoc(freeAgentDocRef, freeAgentTeam);
        }
    }

    // todo: move to PlayerService?
    static transferPlayer = async (fromTeamId: string, toTeamId: string, player: IPlayer) => {
        try {
            // Remove from old team
            if (fromTeamId /*&& fromTeamId !== "free-agent"*/) {
                const fromRef = doc(db, `teams/${fromTeamId}/players`, player.id);
                await deleteDoc(fromRef);
            }

            // Add to new team
            if (toTeamId /*&& toTeamId !== "free-agent"*/) {
                const toRef = doc(db, `teams/${toTeamId}/players`, player.id);
                await setDoc(toRef, {...player, teamId: toTeamId});
            }
        } catch (error) {
            console.error('Error transferring player:', error);
            throw new Error('Failed to transfer player');
        }
    }

    // Add to TeamService.ts
    static async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
        const q = query(
            this.collectionRef,
            where('name', '==', name),
            ...(excludeId ? [where('id', '!=', excludeId)] : [])
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }
}