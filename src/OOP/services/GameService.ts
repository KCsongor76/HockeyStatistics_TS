import {addDoc, collection, deleteDoc, doc, getDocs, setDoc} from "firebase/firestore";
import {db} from "../../firebaseConfig";
import {Game} from "../classes/Game";

// todo: arrow functions, atomic operations, batch writes?

export class GameService {
    private static collectionRef = collection(db, 'games');

    static saveGame = async (game: Game) => {
        console.log(game);
        // console.log(game.toPlainObject())
        const docRef = await addDoc(this.collectionRef, {});
        const gameId = docRef.id;
        const gameWithId = {
            ...game/*.toPlainObject()*/,
            id: gameId
        };

        console.log(gameWithId);

        await setDoc(docRef, gameWithId);

        // const id = gameWithId.id;
        // const championship = game.championship
        // const actions = game.actions
        // const timestamp = game.timestamp
        // const score = game.score
        // const teams = game.teams
        // const selectedImage = game.selectedImage
        //
        // return new Game(id, championship, actions, timestamp, score, teams, selectedImage);
    }

    // static getGame = async (game: Game) => {
    //     const docRef = doc(this.collectionRef, game.id);
    //     const docSnap = await getDoc(docRef);
    //     return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} as Game : null;
    // }

    static getAllGames = async () => {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(
            doc => {
                const id = doc.id;
                const game = doc.data();
                const championship = game.championship
                const actions = game.actions
                const timestamp = game.timestamp
                const score = game.score
                const teams = game.teams
                const selectedImage = game.selectedImage
                return new Game(id, championship, actions, timestamp, score, teams, selectedImage);
            }
        );
    }

    static deleteGame = async (game: Game) => {
        const id = game.id;
        const docRef = doc(this.collectionRef, id);
        await deleteDoc(docRef);
    }
}