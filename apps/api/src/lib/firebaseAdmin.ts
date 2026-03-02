import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasCredentials = Boolean(projectId && clientEmail && privateKey);

const getFirebaseDb = (): Firestore | null => {
  if (!hasCredentials) {
    return null;
  }

  const resolvedProjectId = projectId as string;
  const resolvedClientEmail = clientEmail as string;
  const resolvedPrivateKey = privateKey as string;

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: resolvedProjectId,
        clientEmail: resolvedClientEmail,
        privateKey: resolvedPrivateKey
      })
    });
  }

  return getFirestore();
};

export const firestoreDb = getFirebaseDb();
export const isFirestoreEnabled = Boolean(firestoreDb);
