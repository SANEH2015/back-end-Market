// firebase.js
const firebase = require('firebase/app');
require('firebase/auth');  // Import the authentication service
require('firebase/firestore'); // Import the Firestore service

const firebaseConfig = {
    apiKey: "AIzaSyDp6SzXut3eYFHLEZPLwSiT50uhTF2TY3U",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const auth = firebase.auth();

module.exports = { firestore, auth };
