// firebaseConfig.ts
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA3OrJLXfhn0FcRk2Dqww0J1WmP_YYecrc",
    authDomain: "hockeystatistics-ts.firebaseapp.com",
    projectId: "hockeystatistics-ts",
    storageBucket: "hockeystatistics-ts.appspot.com",
    messagingSenderId: "786591658126",
    appId: "1:786591658126:web:09592534353f1766c919df",
    measurementId: "G-GM0LS273YZ"
};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);