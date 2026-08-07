/**
 * LIFE OS — auth.js
 * -----------------------------------------------------------------------
 * Envoltorio sobre Firebase Authentication. Todo el resto de la app
 * (auth-guard, guest-guard, session-ui, render-ajustes) habla con este
 * objeto `Auth`, nunca con `firebase.auth()` directo — si el día de
 * mañana cambiás de proveedor, este es el único archivo que hay que
 * tocar.
 *
 * Diferencia clave con la versión anterior: Firebase persiste la sesión
 * sola (localStorage/IndexedDB propio), pero confirmar si hay sesión es
 * ASÍNCRONO — tarda un instante en resolver al cargar cada página. Por
 * eso existe `Auth.onReady()`: el resto del código espera a que
 * Firebase confirme antes de decidir nada.
 */

const Auth = {
  _user: null,
  _ready: false,
  _readyCallbacks: [],

  init() {
    if (!FIREBASE_CONFIGURED) {
      // Sin config real todavía: no rompemos la página, solo no hay sesión nunca.
      this._ready = true;
      return;
    }
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      this._user = firebaseUser;
      this._ready = true;
      this._readyCallbacks.forEach((cb) => cb(firebaseUser));
      this._readyCallbacks = [];
    });
  },

  /** Se ejecuta apenas Firebase confirma si hay sesión o no (una sola vez si ya está listo). */
  onReady(callback) {
    if (this._ready) callback(this._user);
    else this._readyCallbacks.push(callback);
  },

  isAuthenticated() {
    return this._user !== null;
  },

  currentUser() {
    if (!this._user) return null;
    return {
      uid: this._user.uid,
      name: this._user.displayName || "",
      email: this._user.email || "",
      picture: this._user.photoURL || "",
    };
  },

  async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  },

  async logout() {
    if (FIREBASE_CONFIGURED) {
      await firebase.auth().signOut();
    }
    window.location.href = "login.html";
  },
};

Auth.init();
