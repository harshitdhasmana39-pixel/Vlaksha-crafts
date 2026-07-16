import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, collection, setDoc, getDocs, query, where, updateDoc, Firestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

// Determine if we are running inside the AI Studio preview environment
const isDevPreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('run.app') || 
   window.location.hostname.includes('localhost') || 
   window.location.hostname.includes('webcontainer'));

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
} catch (e) {
  console.error("⚠️ Failed to initialize primary Firebase config:", e);
  // Fail-safe initialization to avoid crashing the app, but using the userConfig
  app = !getApps().length ? initializeApp(userConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Custom Firebase Firestore connected successfully!");
  } catch (error: any) {
    console.warn("⚠️ Custom Firebase Firestore connection check failed or permission denied:", error);
    console.warn(
      "👉 Tips for connecting to your Firebase Project:\n" +
      "1. Make sure you have created a Firestore database in your Firebase console (vlaksha-crafts-27a0d).\n" +
      "2. Check that your security rules on vlaksha-crafts-27a0d allow reads/writes or are deployed.\n" +
      "3. Enable Email/Password Auth & Google Auth in your Firebase Authentication settings."
    );
  }
}

// Call connection check immediately
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
    const snapshot = await getDocs(q);
    const fetchedOrders: Order[] = [];
    snapshot.forEach((doc) => {
      fetchedOrders.push(doc.data() as Order);
    });
    // Sort from newest to oldest by createdAt
    return fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.error("Error fetching orders from Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    return [];
  }
}

export async function getAllOrdersFromFirestore(): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    const fetchedOrders: Order[] = [];
    snapshot.forEach((doc) => {
      fetchedOrders.push(doc.data() as Order);
    });
    // Sort from newest to oldest by createdAt
    return fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.error("Error fetching all orders from Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    return [];
  }
}

export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, updates);
    console.log(`Order ${orderId} successfully updated in Firestore!`);
  } catch (error: any) {
    console.error("Error updating order in Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function getUserByEmailFromFirestore(email: string): Promise<User | null> {
  const path = 'users';
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user from Firestore:", error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
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
    const snapshot = await getDocFromServer(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as StudioSettings;
    }
    return null;
  } catch (error: any) {
    console.warn("Could not fetch settings from Firestore (using local/default settings):", error.message || error);
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

export { app, db, auth, GoogleAuthProvider, signInWithPopup };

