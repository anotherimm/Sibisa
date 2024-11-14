// src/services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyC2SEaA3YlvC-7-hfR4NV3Js2-OLkZH5mk",
  authDomain: "aplikasi-sibisa.firebaseapp.com",
  databaseURL: "https://aplikasi-sibisa-default-rtdb.firebaseio.com",
  projectId: "aplikasi-sibisa",
  storageBucket: "aplikasi-sibisa.appspot.com",
  messagingSenderId: "550960739824",
  appId: "1:550960739824:android:4f1f7ad093fbe0b9311935",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Mendapatkan referensi ke Realtime Database

export { db };
