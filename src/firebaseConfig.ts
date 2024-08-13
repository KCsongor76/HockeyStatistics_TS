// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA3OrJLXfhn0FcRk2Dqww0J1WmP_YYecrc",
    authDomain: "hockeystatistics-ts.firebaseapp.com",
    projectId: "hockeystatistics-ts",
    storageBucket: "hockeystatistics-ts.appspot.com",
    messagingSenderId: "786591658126",
    appId: "1:786591658126:web:09592534353f1766c919df",
    measurementId: "G-GM0LS273YZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
const analytics = getAnalytics(app);