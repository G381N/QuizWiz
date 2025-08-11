
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "quizwiz-kids",
  "appId": "1:1071210484937:web:a30927b3611ba9adeee918",
  "storageBucket": "quizwiz-kids.firebasestorage.app",
  "apiKey": "AIzaSyCra2XFg49Oa7yRRYs1kTbrYrYa9Kabn2I",
  "authDomain": "quizwiz-kids.firebaseapp.com",
  "messagingSenderId": "1071210484937"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
