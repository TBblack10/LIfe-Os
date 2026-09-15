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
   * lo local. Si la nube está vacía Y es la PRIMERA VEZ que esta cuenta
   * se hidrata en este navegador, se sube lo que ya había en
   * localStorage — así no se pierde nada de lo que el usuario ya había
   * armado antes de tener Firestore.
   *
   * OJO — dos bugs encontrados y corregidos acá:
   *
   * 1) `localStorage` es una sola caché compartida por navegador, no por
   *    cuenta. Si la Cuenta A cierra sesión (sin que nada limpie
   *    localStorage) y la Cuenta B inicia sesión en el mismo navegador,
   *    la regla de arriba literalmente subía los objetivos/hábitos/
   *    proyectos de A a la nube de B. Por eso, antes de tocar ninguna
   *    colección, se compara el uid dueño de la caché local contra el
   *    uid que se está logueando ahora: si difieren, se descarta la
   *    caché (Store.reset()) para no arrastrar datos de una cuenta a
   *    otra.
   *
   * 2) La migración "nube vacía → subo lo local" no distinguía "primer
   *    login de esta cuenta" de "esta cuenta ya sincronizó antes y
   *    ahora su nube está legítimamente vacía" (por ejemplo, porque se
   *    borró algo a mano en Firestore). En el segundo caso, la caché
   *    local podía seguir teniendo datos viejos (ej. de una semilla
   *    hardcodeada de antes de que existiera esta limpieza, ya subida a
   *    Firestore hace tiempo) y ese "vacío" se interpretaba como
   *    "primer login", resucitando esos datos viejos en cada sesión. Se
   *    guarda si esta cuenta ya se hidrató antes en este navegador
   *    (`dueñoActual === uid`, calculado ANTES de pisar el dueño) y la
   *    migración hacia arriba solo se permite cuando es real y
   *    genuinamente la primera vez.
   */
  async hydrate(uid) {
    if (typeof FIREBASE_CONFIGURED !== "undefined" && !FIREBASE_CONFIGURED) return;

    const dueñoActual = Store.ownerUid();
    if (dueñoActual && dueñoActual !== uid) {
      Store.reset();
    }
    const esPrimeraVezDeEstaCuenta = dueñoActual !== uid;
    Store.setOwnerUid(uid);
    Store.setSyncUser(uid);

    for (const collectionName of SYNC_COLLECTIONS) {
      try {
        const cloudItems = await this.pullCollection(uid, collectionName);
        if (cloudItems.length > 0) {
          Store.data()[collectionName] = cloudItems;
          Store.save();
        } else if (esPrimeraVezDeEstaCuenta) {
          const localItems = Store.list(collectionName);
          localItems.forEach((item) => this.pushItem(uid, collectionName, item));
        } else {
          // La nube de esta cuenta ya se conocía y ahora está vacía de
          // verdad (no es su primer login): se refleja ese vacío real,
          // en vez de resucitar lo que haya quedado en la caché local.
          Store.data()[collectionName] = [];
          Store.save();
        }
      } catch (e) {
        console.error(`Sync: fallo la sincronización inicial de "${collectionName}", se sigue con los datos locales.`, e);
      }
    }
  },
};
