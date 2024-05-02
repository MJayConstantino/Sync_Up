import firebase from 'firebase/compat/app';
import { auth } from 'firebase/compat/auth';
import { getFirestore } from 'firebase/compat/firestore';

//web app's firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVr_g1PQjEKOgvnGvHdqHEfldufno8NZg",
    authDomain: "syncup-4b36a.firebaseapp.com",
    projectId: "syncup-4b36a",
    storageBucket: "syncup-4b36a.appspot.com",
    messagingSenderId: "764482763036",
    appId: "1:764482763036:web:0d254343332553f1fda2d9",
    measurementId: "G-RHDYG3ZD0F"
  };

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

export { firebase };

