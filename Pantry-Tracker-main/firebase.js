// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:  "AIzaSyDBXopEAkbPb97t0QpiOKYfo-9mPW2DGuA",
  authDomain:  "pantry-tracker-susmithak.firebaseapp.com",
  projectId:  "pantry-tracker-susmithak",
  storageBucket: "pantry-tracker-susmithak.appspot.com",
  messagingSenderId:  "77909193768",
  appId: "1:77909193768:web:e119b32c7d7b6fa008311d",
  measurementId: "G-8QNW266MS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
