import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";

// Credentials from apps/admin-dashboard/firebase-applet-config.json
const firebaseConfig = {
  projectId: "sierra-blu",
  appId: "1:941030513456:web:7ea785e8287741967086f5",
  apiKey: "AIzaSyBZLN2jTTKV34SneGPoWRz1zoRpX5uODjs",
  authDomain: "sierra-blu.firebaseapp.com",
  storageBucket: "sierra-blu.firebasestorage.app",
  messagingSenderId: "941030513456",
  measurementId: "G-ZP054BPJ8Q"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

// Helper to seed the Admin Tasks to Firebase
export const seedAdminTasksToFirebase = async () => {
  const TASKS = [
    {
      id: "phase1",
      phase: "Phase 1: Dynamic Data (Firebase)",
      items: [
        { title: "Initialize Firebase client connection", completed: true },
        { title: "Create Firestore collections: Properties & Agents", completed: true },
        { title: "Migrate static property data to Firestore", completed: false },
        { title: "Implement real-time availability updates", completed: false },
      ],
    },
    {
      id: "phase2",
      phase: "Phase 2: AI Search & Matchmaking (OpenClaw)",
      items: [
        { title: "Initialize OpenClaw gateway + vector index", completed: true },
        { title: "Feed property descriptions to OpenClaw for semantic search", completed: false },
        { title: "Build natural language search UI on home screen", completed: false },
        { title: "Handle fuzzy queries (e.g. 'villa with pool under 10M EGP')", completed: false },
        { title: "Add AI property comparison feature", completed: false },
      ],
    },
    {
      id: "phase3",
      phase: "Phase 3: WhatsApp Automation & CRM",
      items: [
        { title: "Configure WhatsApp Business API webhook endpoint", completed: false },
        { title: "Wire incoming messages to Hermes AI agent", completed: true },
        { title: "Auto-log leads to Firestore crm_leads collection", completed: true },
        { title: "Build CRM lead dashboard in Admin page", completed: true },
        { title: "Enable agent assignment & WhatsApp notifications", completed: false },
      ],
    },
    {
      id: "phase4",
      phase: "Phase 4: Hermes AI Direct Assistant",
      items: [
        { title: "Deploy Hermes agent with Communication skill", completed: true },
        { title: "Equip Hermes with SPIN Selling methodology", completed: true },
        { title: "Equip Hermes with BATNA Negotiation framework", completed: true },
        { title: "Enable bilingual responses (Arabic / English)", completed: true },
        { title: "Connect Hermes to live property inventory for queries", completed: false },
        { title: "Add voice message support via ECC encryption", completed: false },
      ],
    },
    {
      id: "phase5",
      phase: "Phase 5: Market Expansion & Analytics",
      items: [
        { title: "Add investment ROI calculator for buyers", completed: false },
        { title: "Implement referral tracking program", completed: false },
        { title: "Build agent performance leaderboard", completed: false },
        { title: "Integrate market valuation API for New Cairo areas", completed: false },
        { title: "Add push notifications for price drops & new listings", completed: false },
      ],
    },
  ];

  const tasksRef = collection(db, "admin_tasks");
  for (const taskGroup of TASKS) {
    await setDoc(doc(db, "admin_tasks", taskGroup.id), taskGroup);
  }
  console.log("Admin tasks successfully seeded to Firebase!");
};

// Helper to fetch Admin Tasks from Firebase
export const fetchAdminTasks = async () => {
  const tasksRef = collection(db, "admin_tasks");
  const snapshot = await getDocs(tasksRef);
  if (snapshot.empty) {
    return [];
  }
  const tasks: any[] = [];
  snapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  // Sort by phase id simple comparison
  return tasks.sort((a, b) => a.id.localeCompare(b.id));
};

// Helper to toggle a task's completion status
export const toggleAdminTaskCompletion = async (groupId: string, taskIndex: number, currentItems: any[]) => {
  const docRef = doc(db, "admin_tasks", groupId);
  const newItems = [...currentItems];
  newItems[taskIndex].completed = !newItems[taskIndex].completed;
  await updateDoc(docRef, { items: newItems });
  return newItems;
};

// Seed properties
export const seedPropertiesToFirebase = async (staticProperties: any[]) => {
  const propsRef = collection(db, "properties");
  for (const prop of staticProperties) {
    const { image, ...firestoreData } = prop; 
    // We remove the `image` (require module) and store an imageId based on the id so we can map it locally
    await setDoc(doc(db, "properties", prop.id), { ...firestoreData, imageId: prop.id });
  }
  console.log("Properties successfully seeded to Firebase!");
};

import { PROPERTIES } from "../data/properties";

// Fetch properties
export const fetchProperties = async () => {
  const propsRef = collection(db, "properties");
  const snapshot = await getDocs(propsRef);
  if (snapshot.empty) {
    await seedPropertiesToFirebase(PROPERTIES);
    return fetchProperties();
  }
  const properties: any[] = [];
  snapshot.forEach(doc => properties.push({ id: doc.id, ...doc.data() }));
  return properties;
};
