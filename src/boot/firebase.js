import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/firebase-firestore';
import 'firebase/firebase-auth';
import 'firebase/firebase-storage';
import { firestorePlugin } from 'vuefire';

const config = {
  apiKey: process.env.GOOGLE_API_KEY,
  authDomain: process.env.FIRE_AUTH_DOMAIN,
  databaseURL: process.env.FIRE_DATABASE_UR,
  projectId: process.env.FIRE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORAGE_BUCKET
};

const app = firebase.initializeApp(config);

Vue.prototype.$firestore = app.firestore();
Vue.prototype.$fireauth = firebase.auth();
Vue.prototype.$fireauth.Auth = firebase.auth.Auth;
Vue.prototype.$firestorage = app.storage();
Vue.use(firestorePlugin);




