// src/app/api/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Firebase Admin configuration
const firebaseAdminConfig = {
  credential: cert({
    // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin (singleton pattern)
let app: App;
let adminAuth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseAdminConfig);
  adminAuth = getAuth(app);
} else {
  app = getApps()[0];
  adminAuth = getAuth(app);
}

export { adminAuth };
export default app;
