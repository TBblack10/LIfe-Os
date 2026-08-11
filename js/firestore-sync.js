/**
 * LIFE OS — firestore-sync.js
 * -----------------------------------------------------------------------
 * Único archivo del proyecto que habla directo con Firestore. Store.js
 * lo usa a través de estas funciones (pushItem/deleteItem/hydrate) —
 * nunca llama a firebase.firestore() por su cuenta. Si el día de mañana
 * se reemplaza Firestore por otra cosa, este es el único archivo (junto
 * con auth.js para Auth) que hay que tocar.
 *
 * Alcance actual: "objetivos", "habitos", "diario" y "proyectos".
 * Finanzas, Roadmap, Progreso y Tareas de hoy no se sincronizan
 * todavía — deliberadamente no están en SYNC_COLLECTIONS, así que
 * aunque Store intente sincronizarlos, esta capa los ignora sin hacer
 * nada. Sumar una entidad nueva es agregar su nombre a esta lista (acá
 * y en STORE_SYNC_COLLECTIONS de store.js) — nada más.
 *
 * Estructura en Firestore: users/{uid}/objetivos/{id}, users/{uid}/habitos/{id}
 * — colecciones separadas por entidad, no un documento único gigante
 * (ver justificación técnica ya conversada: costo/latencia por
 * documento, no por tamaño total, y evita reescribir todo por cada
 * cambio chico).
 */

const SYNC_COLLECTIONS = ["objetivos", "habitos", "diario", "proyectos"];

const Sync = {
  _db: null,

  _firestore() {
    if (!this._db) this._db = firebase.firestore();
    return this._db;
  },

  _collectionRef(uid, collectionName) {
    return this._firestore().collection("users").doc(uid).collection(collectionName);
  },

  async pullCollection(uid, collectionName) {
    const snap = await this._collectionRef(uid, collectionName).get();
    return snap.docs.map((d) => d.data());
  },

  /** Fire-and-forget: no bloquea la UI. Si falla, solo se loguea. */
  pushItem(uid, collectionName, item) {
    if (!SYNC_COLLECTIONS.includes(collectionName)) return;
    this._collectionRef(uid, collectionName)
      .doc(item.id)
      .set(item, { merge: true })
      .catch((e) => console.error(`Sync: no se pudo guardar ${collectionName}/${item.id} en Firestore.`, e));
  },

  deleteItem(uid, collectionName, itemId) {
    if (!SYNC_COLLECTIONS.includes(collectionName)) return;
    this._collectionRef(uid, collectionName)
      .doc(itemId)
      .delete()
      .catch((e) => console.error(`Sync: no se pudo borrar ${collectionName}/${itemId} en Firestore.`, e));
  },

  /**
   * Se llama una sola vez, al confirmar sesión, ANTES de mostrar la
   * página (ver auth-guard.js) — así los render-*.js, que corren
   * después, ya leen datos actualizados sin saber que esto existe.
   *
   * Regla de conflicto (simple a propósito, para un solo usuario en
   * pocos dispositivos): si la nube ya tiene datos, la nube gana y pisa
   * lo local. Si la nube está vacía (primer login), se sube lo que ya
   * había en localStorage — así no se pierde nada de lo que el usuario
   * ya había armado antes de tener Firestore.
   */
  async hydrate(uid) {
    if (typeof FIREBASE_CONFIGURED !== "undefined" && !FIREBASE_CONFIGURED) return;

    Store.setSyncUser(uid);

    for (const collectionName of SYNC_COLLECTIONS) {
      try {
        const cloudItems = await this.pullCollection(uid, collectionName);
        if (cloudItems.length > 0) {
          Store.data()[collectionName] = cloudItems;
          Store.save();
        } else {
          const localItems = Store.list(collectionName);
          localItems.forEach((item) => this.pushItem(uid, collectionName, item));
        }
      } catch (e) {
        console.error(`Sync: fallo la sincronización inicial de "${collectionName}", se sigue con los datos locales.`, e);
      }
    }
  },
};
