
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVpaDUcLkRZlY9ge7BkjmT3qBikuPGeUo",
  authDomain: "app1-e1cea.firebaseapp.com",
  databaseURL: "https://app1-e1cea-default-rtdb.firebaseio.com",
  projectId: "app1-e1cea",
  storageBucket: "app1-e1cea.firebasestorage.app",
  messagingSenderId: "261005434130",
  appId: "1:261005434130:web:6adc11a4ad32736aff67cb",
  measurementId: "G-6GBVN210TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
