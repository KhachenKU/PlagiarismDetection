import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDql5FUtBM_xcDTSsZnPWeIN6dA3zySa0c",
    authDomain: "plagiarism-th-eng.firebaseapp.com",
    databaseURL: "https://plagiarism-th-eng-default-rtdb.firebaseio.com",
    projectId: "plagiarism-th-eng",
    storageBucket: "plagiarism-th-eng.appspot.com",
    messagingSenderId: "988939632477",
    appId: "1:988939632477:web:55ba14d7bf2b111812b2b4",
    measurementId: "G-TV12877S3K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ timestampsInSnapshots: true});

export default firebase;