// Shared Firebase Admin initialization for all FitLink scripts.
import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import admin from "firebase-admin";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";
if (!existsSync(keyPath)) {
  console.error(`\n✗ Service account key not found at ${keyPath}`);
  console.error("  Download it from Firebase Console → Project Settings → Service accounts,");
  console.error("  save it as scripts/serviceAccountKey.json (see serviceAccountKey.example.json).\n");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const projectId = serviceAccount.project_id;
