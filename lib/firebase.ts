import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDsbhZdYPxTrBTkdeLbe5TEVwKyaWc1eFY",
  authDomain: "canalcomunicaciones-2cb2f.firebaseapp.com",
  projectId: "canalcomunicaciones-2cb2f",
  storageBucket: "canalcomunicaciones-2cb2f.firebasestorage.app",
  messagingSenderId: "740594702257",
  appId: "1:740594702257:web:3d971f5d75db86d5d30f90",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
};
export type { DocumentData, QueryConstraint, User };
