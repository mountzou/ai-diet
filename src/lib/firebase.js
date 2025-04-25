// src/lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore as getFirestoreOriginal } from 'firebase/firestore';

let firebaseApp;

export async function initializeFirebase() {
  if (getApps().length === 0) {
    try {
      // Fetch config from server
      const response = await fetch('/api/firebase-config');
      const firebaseConfig = await response.json();
      
      // Initialize Firebase
      firebaseApp = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  } else {
    firebaseApp = getApp();
  }
  
  return firebaseApp;
}

// Initialize auth
export async function getFirebaseAuth() {
  await initializeFirebase();
  return getAuth();
}

// Initialize Firestore
export async function getFirestoreDb() {
  await initializeFirebase();
  return getFirestoreOriginal();
}