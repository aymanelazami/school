/*import { initializeApp } from "firebase/app";
import {getStorage} from "

const firebaseConfig = {
  apiKey: "AIzaSyCKB3zKrAUvWBJ3E83tLlLw5vGvfrOqX1E",
  authDomain: "exam9-1.firebaseapp.com",
  projectId: "exam9-1",
  storageBucket: "exam9-1.appspot.com",
  messagingSenderId: "479705895775",
  appId: "1:479705895775:web:49446745724018e8cd5cea",
  measurementId: "G-0EGXDMH6KJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
*/

import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Pour reproduire __dirname dans un module ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier service account
const serviceAccountPath = path.join(__dirname, "./serviceAccountKey.json");

// Vérifie si le fichier existe
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Fichier serviceAccountKey.json introuvable à ${serviceAccountPath}`);
}

// Lire et parser le fichier JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "exam9-1.appspot.com", // ⚠️ ton bucket ici
});

// Export du bucket pour l'utiliser ailleurs
//export const bucket = admin.storage().bucket();
export const bucket: ReturnType<ReturnType<typeof admin.storage>['bucket']> = admin.storage().bucket(); // Get a reference to the default bucket