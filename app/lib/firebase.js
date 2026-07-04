import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyAb3mnf_ecRWoHi446fIUxKQVgOgbyuvFs",
authDomain: "avelo-5d2a8.firebaseapp.com",
projectId: "avelo-5d2a8",
storageBucket: "avelo-5d2a8.firebasestorage.app",
messagingSenderId: "109964713796",
appId: "1:109964713796:web:18313c83ad0c9b2a3ac111",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);