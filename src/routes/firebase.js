const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
require('firebase/storage');
//cvrrchatrooms-2dbf2's-->cvrrsocial
var firebaseConfig = {
  apiKey: 'AIzaSyDY5h5C9Qad_J_NHNdYnIyMA5CxRGu8fUs',
  authDomain: 'chatrooms-2dbf2.firebaseapp.com',
  databaseURL: 'https://chatrooms-2dbf2.firebaseio.com',
  projectId: 'chatrooms-2dbf2',
  storageBucket: 'chatrooms-2dbf2.appspot.com',
  messagingSenderId: '777546442092',
  appId: '1:777546442092:web:f0ebccdab52dd9081bbf49',
  measurementId: 'G-99HBJC4Y8L',
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

module.export = firebase;
