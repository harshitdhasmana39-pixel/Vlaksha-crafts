import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, setDoc, getDocs, query, where, updateDoc, Firestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Order, User, StudioSettings } from '../types';

const sandboxConfig = {
  apiKey: "AIzaSyCJxJoPw3BJ_HJRZNaV0ztIVyZ0ySmGe5c",
  authDomain: "gothic-furnace-7xhgq.firebaseapp.com",
  projectId: "gothic-furnace-7xhgq",
  storageBucket: "gothic-furnace-7xhgq.firebasestorage.app",
  messagingSenderId: "428284488233",
  appId: "1:428284488233:web:c9dfd334a8c307fefc0a38"
};

const userConfig = {
  apiKey: "AIzaSyAdS3dwmuFVO0ypFxPEk9jZxaYItnB_88Y",
  authDomain: "vlaksha-crafts-27a0d.firebaseapp.com",
  projectId: "vlaksha-crafts-27a0d",
  storageBucket: "vlaksha-crafts-27a0d.firebasestorage.app",
  messagingSenderId: "316075273034",
  appId: "1:316075273034:web:a98166849d136de1306fb3"
};

// We use modifiable variables so they can be switched on connection failures
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

// Helper to race a promise against a timeout to avoid 10s Firestore backend hangs
function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms))
  ]);
}

try {
  console.log("🌸 Initializing Firebase with your custom project (vlaksha-crafts-27a0d)...");
  // Clean up any existing instances first to make sure there are no conflicts
  const activeApps = getApps();
  for (const activeApp of activeApps) {
    try {
      deleteApp(activeApp);
    } catch (e) {
      console.warn("Error deleting app during fresh initialization:", e);
    }
  }
  app = initializeApp(userConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (e) {
  console.error("⚠️ Failed to initialize primary Firebase config:", e);
  // Fail-safe initialization to avoid crashing the app
  app = !getApps().length ? initializeApp(userConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export async function testConnection() {
  try {
    await withTimeout(getDoc(doc(db, 'test', 'connection')), 2500);
    console.log("✅ Custom Firebase Firestore connected successfully!");
  } catch (error: any) {
    console.log("ℹ️ Firebase operating in local storage mode (offline fallback active).");
  }
}

// Call connection check gracefully
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, order);
    console.log(`Order ${order.id} successfully saved to Firestore!`);
  } catch (error: any) {
    console.error("Error saving order to Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function getOrdersFromFirestore(email: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('email', '==', email.trim().toLowerCase()));
    const snapshot = await withTimeout(getDocs(q), 3000);
    const fetchedOrders: Order[] = [];
    snapshot.forEach((doc) => {
      fetchedOrders.push(doc.data() as Order);
    });
    // Sort from newest to oldest by createdAt
    return fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Could not fetch orders from Firestore (using local storage):", error?.message || error);
    return [];
  }
}

export async function getAllOrdersFromFirestore(): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await withTimeout(getDocs(ordersCol), 3000);
    const fetchedOrders: Order[] = [];
    snapshot.forEach((doc) => {
      fetchedOrders.push(doc.data() as Order);
    });
    // Sort from newest to oldest by createdAt
    return fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Could not fetch all orders from Firestore (using local storage):", error?.message || error);
    return [];
  }
}

export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await withTimeout(updateDoc(orderDocRef, updates), 3000);
    console.log(`Order ${orderId} successfully updated in Firestore!`);
  } catch (error: any) {
    console.warn("Error updating order in Firestore:", error?.message || error);
  }
}

export async function getUserByEmailFromFirestore(email: string): Promise<User | null> {
  const path = 'users';
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email.trim().toLowerCase()));
    const snapshot = await withTimeout(getDocs(q), 3000);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    return null;
  } catch (error: any) {
    console.warn("Could not fetch user from Firestore (using local storage):", error?.message || error);
    return null;
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user);
    console.log(`User ${user.id} successfully saved to Firestore!`);
  } catch (error: any) {
    console.error("Error saving user to Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function getSettingsFromFirestore(): Promise<StudioSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'vlaksha_settings');
    const snapshot = await withTimeout(getDoc(docRef), 2500);
    if (snapshot && snapshot.exists()) {
      return snapshot.data() as StudioSettings;
    }
    return null;
  } catch (error: any) {
    // Quietly fallback to local default settings without logging console warnings
    return null;
  }
}

export async function saveSettingsToFirestore(settings: StudioSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'vlaksha_settings');
    await setDoc(docRef, settings);
    console.log("Settings successfully saved to Firestore!");
  } catch (error: any) {
    console.warn("Failed to save settings to Firestore (saved locally instead):", error.message || error);
  }
}

export { app, db, auth, storage, GoogleAuthProvider, signInWithPopup };

