// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBGLO7JV7nyna0Zt7d_MrcpahUAfQXpBXk',
  authDomain: 'inventory-management-967d7.firebaseapp.com',
  projectId: 'inventory-management-967d7',
  storageBucket: 'inventory-management-967d7.appspot.com',
  messagingSenderId: '1054211537032',
  appId: '1:1054211537032:web:a3d96a0ec4ebc67a0dc73d',
  measurementId: 'G-7PSXX0M5GT'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export { firestore }
