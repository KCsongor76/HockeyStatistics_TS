import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {IGame} from "../interfaces/IGame";
import {Game} from "../classes/Game";

// todo: arrow functions, atomic operations, batch writes?

export class GameService {
    private static collectionRef = collection(db, 'games');

    static saveGame = async (game: Game) => {
        const docRef = doc(this.collectionRef); // Generate ID upfront
        const gameWithId = {...game.toPlainObject(), id: docRef.id};
        await setDoc(docRef, gameWithId); // Single write operation
        return gameWithId as IGame;
    }

    static getGame = async (game: IGame) => {
        const docRef = doc(this.collectionRef, game.id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} as IGame : null;
    }

    static getAllGames = async () => {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as IGame));
    }

    // static getAllGames = async (): Promise<Game[]> => {
    //     const querySnapshot = await getDocs(this.collectionRef);
    //     return querySnapshot.docs.map(doc =>
    //         Game.fromPlain({id: doc.id, ...doc.data()} as IGame)
    //     );
    // }

    static deleteGame = async (game: IGame) => {
        const id = game.id;
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }
}