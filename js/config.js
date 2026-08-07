/**
 * LIFE OS — config.js
 * -----------------------------------------------------------------------
 * Configuración de Firebase. Sacá estos 6 valores de:
 * Firebase Console -> Ícono de engranaje -> Project settings ->
 * "Your apps" -> app Web -> objeto `firebaseConfig`.
 *
 * No funciona con los valores de ejemplo de abajo — son placeholders.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDas0dPyW8V-55G3fwMQ79fNo089kjSUPY",
  authDomain: "life-os-ef9c9.firebaseapp.com",
  projectId: "life-os-ef9c9",
  storageBucket: "life-os-ef9c9.firebasestorage.app",
  messagingSenderId: "576556998196",
  appId: "1:576556998196:web:4ce5346ed8db61e45af461",
};

const FIREBASE_CONFIGURED = !firebaseConfig.apiKey.includes("TU_API_KEY_ACA");

if (FIREBASE_CONFIGURED) {
  firebase.initializeApp(firebaseConfig);
}
