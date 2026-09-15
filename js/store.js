/**
 * LIFE OS — store.js
 * -----------------------------------------------------------------------
 * Capa de datos única de la aplicación. Reemplaza a data/inicio.data.js
 * (que quedaba desconectado) por un modelo real, persistido en
 * localStorage, con operaciones CRUD genéricas.
 *
 * Se carga en TODAS las páginas antes que cualquier script de página
 * (render-*.js), y expone un único objeto global: `Store`.
 *
 * No hay backend: localStorage es la base de datos del navegador.
 * Sobrevive a recargas y cierres, pero es local a ese navegador/dispositivo.
 * ---------------------------------------------------------------------
 * Convención de IDs: string únicos generados con id() — no son
 * incrementales para evitar colisiones si en el futuro se sincroniza
 * con un backend real.
 */

const STORAGE_KEY = "lifeos_data_v1";

// Guarda qué cuenta es dueña de los datos que hay ahora mismo en
// localStorage. No reemplaza el aislamiento real (eso lo da Firestore +
// firestore.rules, por uid) — es solo la señal que necesita Sync.hydrate()
// para notar que cambió la cuenta logueada en ESTE navegador y así evitar
// que se filtren datos de una cuenta a otra mientras llega la respuesta
// de Firestore (ver detalle en firestore-sync.js).
const OWNER_KEY = "lifeos_owner_uid";

function id() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Semilla inicial de una cuenta nueva.
 *
 * Fase 1: sin datos personales hardcodeados. Antes acá vivían objetivos,
 * hábitos, proyectos y tareas de ejemplo tomados del prototipo original
 * (con datos reales de una persona puntual) — cualquier usuario nuevo los
 * heredaba tal cual. Cada colección arranca vacía; todas las pantallas ya
 * tienen su estado vacío ("Todavía no creaste...") con su CTA para cargar
 * el primer dato, así que no hace falta contenido de ejemplo para que la
 * app sea usable desde el primer login.
 */
function seedData() {
  return {
    usuario: {
      nombre: "",
      xpTotal: 0,
    },

    objetivos: [],
    habitos: [],
    proyectos: [],
    tareasHoy: [],
    diario: [],
  };
}

// Colecciones que se sincronizan con Firestore (ver firestore-sync.js).
// Finanzas/Roadmap/Progreso/Tareas de hoy quedan afuera a propósito.
const STORE_SYNC_COLLECTIONS = ["objetivos", "habitos", "diario", "proyectos"];

// Fase 1A — Objetivos ↔ Hábitos: niveles de importancia permitidos para un
// vínculo. Sin valores numéricos visibles en la interfaz (eso es una
// decisión de UI, no de este archivo) — acá solo se valida contra esta lista.
const IMPORTANCIA_VALIDA = ["principal", "importante", "complementario"];

// Fase 1B — pesos fijos de importancia (sin porcentajes personalizados).
// Si hay más de un hábito con el mismo nivel, cada uno aporta su peso
// completo (no se reparten entre sí) — así lo especifica esta fase.
const PESO_IMPORTANCIA_FIJO = { principal: 0.6, importante: 0.3, complementario: 0.1 };

/** Días entre dos fechas ISO ("YYYY-MM-DD"), ambas inclusive. Mínimo 1
 * (evita división por cero si la fecha de inicio es hoy mismo). */
function diffDaysInclusive(fromISO, toISO) {
  const from = new Date(fromISO + "T00:00:00Z");
  const to = new Date(toISO + "T00:00:00Z");
  const dias = Math.round((to - from) / 86400000) + 1;
  return Math.max(1, dias);
}

const Store = {
  _data: null,
  _syncUid: null,

  /** Lo llama Sync.hydrate() una vez, al confirmar sesión. */
  setSyncUser(uid) {
    this._syncUid = uid;
  },

  /** uid dueño de los datos que hay ahora mismo en localStorage, o null
   * si nunca se asoció a ninguna cuenta (primera vez en este navegador,
   * o datos locales de antes de que existiera el login). */
  ownerUid() {
    try {
      return localStorage.getItem(OWNER_KEY);
    } catch (e) {
      return null;
    }
  },

  /** Marca qué cuenta es dueña de los datos locales actuales. */
  setOwnerUid(uid) {
    try {
      localStorage.setItem(OWNER_KEY, uid);
    } catch (e) {
      console.error("Store: no se pudo guardar el dueño de los datos locales.", e);
    }
  },

  /** Fire-and-forget: no bloquea ningún método que ya funcionaba síncrono. */
  _syncPush(collection, itemId) {
    if (!this._syncUid || !STORE_SYNC_COLLECTIONS.includes(collection)) return;
    if (typeof Sync === "undefined") return;
    const item = this.getById(collection, itemId);
    if (item) Sync.pushItem(this._syncUid, collection, item);
  },

  _syncDelete(collection, itemId) {
    if (!this._syncUid || !STORE_SYNC_COLLECTIONS.includes(collection)) return;
    if (typeof Sync === "undefined") return;
    Sync.deleteItem(this._syncUid, collection, itemId);
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? JSON.parse(raw) : seedData();
    } catch (e) {
      console.error("Store: error leyendo localStorage, se reinicia con datos de ejemplo.", e);
      this._data = seedData();
    }
    return this._data;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      return true;
    } catch (e) {
      console.error("Store: no se pudo guardar en localStorage.", e);
      return false;
    }
  },

  data() {
    if (!this._data) this.load();
    return this._data;
  },

  reset() {
    this._data = seedData();
    this.save();
  },

  // ---------- CRUD genérico ----------
  list(collection) {
    return this.data()[collection];
  },

  getById(collection, itemId) {
    return this.data()[collection].find((x) => x.id === itemId) || null;
  },

  create(collection, item) {
    const newItem = { id: id(), ...item };
    this.data()[collection].push(newItem);
    this.save();
    this._syncPush(collection, newItem.id);
    return newItem;
  },

  update(collection, itemId, changes) {
    const item = this.getById(collection, itemId);
    if (item) Object.assign(item, changes);
    this.save();
    this._syncPush(collection, itemId);
    return item;
  },

  remove(collection, itemId) {
    const arr = this.data()[collection];
    const idx = arr.findIndex((x) => x.id === itemId);
    if (idx > -1) arr.splice(idx, 1);
    this.save();
    this._syncDelete(collection, itemId);
  },

  // ---------- XP / nivel ----------
  addXP(amount) {
    const u = this.data().usuario;
    u.xpTotal = Math.max(0, u.xpTotal + amount);
    this.save();
  },

  nivel() {
    return 1 + Math.floor(this.data().usuario.xpTotal / 500);
  },

  xpParaSiguienteNivel() {
    const nivelActual = this.nivel();
    return nivelActual * 500;
  },

  // ---------- Hábitos: completar hoy + racha ----------
  isHabitDoneToday(habitId) {
    const h = this.getById("habitos", habitId);
    return h ? h.completions.includes(todayISO()) : false;
  },

  toggleHabitToday(habitId) {
    const h = this.getById("habitos", habitId);
    if (!h) return;
    const t = todayISO();
    const idx = h.completions.indexOf(t);
    if (idx > -1) {
      h.completions.splice(idx, 1);
      this.addXP(-15);
    } else {
      h.completions.push(t);
      this.addXP(15);
    }
    this.save();
    this._syncPush("habitos", habitId);
    // V1: el progreso del objetivo ya NO depende de los hábitos (eso
    // ahora es "constancia", un dato aparte). Nada que recalcular acá.
  },

  habitStreak(habitId) {
    const h = this.getById("habitos", habitId);
    if (!h || h.completions.length === 0) return 0;
    const dates = new Set(h.completions);
    let streak = 0;
    let cursor = new Date();
    // Si hoy no está completado, la racha se cuenta desde ayer hacia atrás.
    if (!dates.has(todayISO())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  // últimos 6 días (más viejo -> más nuevo) para los puntitos de racha
  habitLast6Days(habitId) {
    const h = this.getById("habitos", habitId);
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push(h ? h.completions.includes(iso) : false);
    }
    return out;
  },

  // ---------- Tareas de hoy ----------
  toggleTask(taskId) {
    const t = this.getById("tareasHoy", taskId);
    if (!t) return;
    t.done = !t.done;
    this.addXP(t.done ? 10 : -10);
    this.save();
  },

  // ---------- Objetivo principal (helper) ----------
  objetivoPrincipal() {
    return this.data().objetivos.find((o) => o.esPrincipal) || this.data().objetivos[0] || null;
  },

  /** Cambia el Objetivo Estrella: activa `esPrincipal` en el elegido y lo
   * desactiva en cualquier otro que lo tuviera (nunca puede haber más de
   * uno a la vez). Sincroniza cada objetivo que cambió, igual que
   * cualquier otro update. Si el id no existe, no hace nada. */
  setObjetivoPrincipal(goalId) {
    const objetivos = this.data().objetivos;
    const nuevoPrincipal = objetivos.find((o) => o.id === goalId);
    if (!nuevoPrincipal) return null;

    const cambiados = [];
    objetivos.forEach((o) => {
      const debeSerPrincipal = o.id === goalId;
      if (o.esPrincipal !== debeSerPrincipal) {
        o.esPrincipal = debeSerPrincipal;
        cambiados.push(o.id);
      }
    });

    this.save();
    cambiados.forEach((idCambiado) => this._syncPush("objetivos", idCambiado));
    return nuevoPrincipal;
  },

  objetivoFinanzas() {
    return this.data().objetivos.find((o) => o.esFinanzas) || null;
  },

  // ---------- Pasos de un objetivo (se guardan en `hitos`, mismo campo
  // de siempre — ver nota en calcularProgresoPorPasos) ----------
  addHito(goalId, texto) {
    const g = this.getById("objetivos", goalId);
    if (!g) return null;
    if (!g.hitos) g.hitos = [];
    g.hitos.push({ texto, hecho: false });
    this.save();
    this._syncPush("objetivos", goalId);
    return this._recalcularYGuardarProgreso(goalId);
  },

  editHito(goalId, index, nuevoTexto) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos || !g.hitos[index]) return null;
    g.hitos[index].texto = nuevoTexto;
    this.save();
    this._syncPush("objetivos", goalId);
    return this._recalcularYGuardarProgreso(goalId);
  },

  toggleHito(goalId, index) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos || !g.hitos[index]) return null;
    g.hitos[index].hecho = !g.hitos[index].hecho;
    this.save();
    this._syncPush("objetivos", goalId);
    return this._recalcularYGuardarProgreso(goalId);
  },

  removeHito(goalId, index) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos) return null;
    g.hitos.splice(index, 1);
    this.save();
    this._syncPush("objetivos", goalId);
    return this._recalcularYGuardarProgreso(goalId);
  },

  // ============================================================
  // Fase 1A — Objetivos ↔ Hábitos: estructura y relación.
  // Sin cálculos de progreso todavía (eso es una fase aparte).
  //
  // Compatibilidad: los objetivos/hábitos existentes no tienen
  // `habitosVinculados`, `metodoProgreso`, `medicion` ni `frecuencia` —
  // no se migran en masa. Cada método de acá abajo trata la ausencia
  // de esos campos como su valor por defecto (fallback defensivo), y
  // recién los crea en el objeto real la primera vez que hace falta
  // escribir algo (ej. el primer vínculo agregado a un objetivo).
  // ============================================================

  /** Vincula un hábito a un objetivo. Idempotente: si ya estaba
   * vinculado, no lo duplica — devuelve el vínculo existente tal cual. */
  linkHabitToGoal(goalId, habitId, importancia = "importante") {
    const g = this.getById("objetivos", goalId);
    const h = this.getById("habitos", habitId);
    if (!g || !h) return null;

    if (!g.habitosVinculados) g.habitosVinculados = [];

    const existente = g.habitosVinculados.find((v) => v.habitoId === habitId);
    if (existente) return existente;

    const vinculo = {
      habitoId: habitId,
      importancia: IMPORTANCIA_VALIDA.includes(importancia) ? importancia : "importante",
      vinculadoDesde: todayISO(),
    };
    g.habitosVinculados.push(vinculo);
    this.save();
    this._syncPush("objetivos", goalId);
    return vinculo;
  },

  /** Desvincula un hábito de un objetivo. NO toca `habito.completions` —
   * el historial del hábito queda intacto, tal como se definió. */
  unlinkHabitFromGoal(goalId, habitId) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.habitosVinculados) return;
    g.habitosVinculados = g.habitosVinculados.filter((v) => v.habitoId !== habitId);
    this.save();
    this._syncPush("objetivos", goalId);
  },

  /** Cambia el nivel de importancia de un vínculo ya existente.
   * No modifica `vinculadoDesde` — cambiar la importancia no reinicia
   * la fecha desde la que cuentan los cumplimientos. */
  updateHabitImportance(goalId, habitId, importancia) {
    if (!IMPORTANCIA_VALIDA.includes(importancia)) return null;
    const g = this.getById("objetivos", goalId);
    if (!g || !g.habitosVinculados) return null;
    const vinculo = g.habitosVinculados.find((v) => v.habitoId === habitId);
    if (!vinculo) return null;
    vinculo.importancia = importancia;
    this.save();
    this._syncPush("objetivos", goalId);
    return vinculo;
  },

  /** Todos los objetivos vinculados a un hábito dado (recorre los
   * objetivos y filtra — no hay un índice inverso almacenado, ver
   * justificación en la auditoría: la cantidad de objetivos de una
   * persona hace esto trivial en cliente). */
  goalsForHabit(habitId) {
    return this.list("objetivos")
      .filter((g) => (g.habitosVinculados || []).some((v) => v.habitoId === habitId))
      .map((g) => {
        const vinculo = g.habitosVinculados.find((v) => v.habitoId === habitId);
        return { objetivo: g, importancia: vinculo.importancia, vinculadoDesde: vinculo.vinculadoDesde };
      });
  },

  /** Todos los hábitos vinculados a un objetivo dado, con el hábito
   * completo ya resuelto (no solo el id) para que quien llame no tenga
   * que hacer un getById extra. Si un habitoId vinculado ya no existe
   * (se borró el hábito), se lo excluye en vez de romper. */
  habitsForGoal(goalId) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.habitosVinculados) return [];
    return g.habitosVinculados
      .map((v) => {
        const habito = this.getById("habitos", v.habitoId);
        return habito ? { habitoId: v.habitoId, importancia: v.importancia, vinculadoDesde: v.vinculadoDesde, habito } : null;
      })
      .filter(Boolean);
  },

  // ============================================================
  // V1 — Constancia por hábito.
  //
  // IMPORTANTE: esto es "constancia", NO "progreso del objetivo".
  // El progreso del objetivo ahora se calcula solo a partir de los
  // pasos (ver calcularProgresoPorPasos más abajo) — no se mezclan.
  //
  // Compatibilidad: un hábito sin `fechaInicio` usa hoy como inicio
  // (no genera cumplimiento retroactivo inventado); sin `vecesPorSemana`
  // se asume 7 (diario), que es el comportamiento que ya tenían los
  // hábitos existentes (racha calculada día a día). Ningún hábito ni
  // objetivo existente rompe por no tener estos campos.
  // ============================================================

  /** Constancia de UN hábito (0..1), calculada desde su propia
   * fechaInicio — no depende de a qué objetivo esté vinculado ni de
   * `vinculadoDesde`. Es la misma cifra la use el objetivo que la use. */
  cumplimientoHabito(habitId) {
    const h = this.getById("habitos", habitId);
    if (!h) return 0;

    const fechaInicio = h.fechaInicio || todayISO();
    const vecesPorSemana = Math.max(1, Number(h.vecesPorSemana) || 7);

    const dias = diffDaysInclusive(fechaInicio, todayISO());
    const semanas = dias / 7;
    const vecesEsperadas = semanas * vecesPorSemana;
    if (vecesEsperadas <= 0) return 0;

    const cumplidas = (h.completions || []).filter((c) => c >= fechaInicio).length;
    return Math.max(0, Math.min(1, cumplidas / vecesEsperadas));
  },

  /** Promedio ponderado de constancia de los hábitos vinculados a un
   * objetivo (0-100). Ya NO se usa para `porcentaje` — queda disponible
   * por si en algún momento hace falta un número agregado de
   * constancia, pero la interfaz V1 muestra la constancia por hábito
   * individual, no esta agregación. */
  calcularProgresoObjetivo(goalId) {
    const vinculos = this.habitsForGoal(goalId);
    if (!vinculos.length) return 0;

    let total = 0;
    vinculos.forEach((v) => {
      const cumplimiento = this.cumplimientoHabito(v.habitoId);
      const peso = PESO_IMPORTANCIA_FIJO[v.importancia] ?? PESO_IMPORTANCIA_FIJO.importante;
      total += cumplimiento * peso;
    });
    return Math.round(Math.min(1, total) * 100);
  },

  /** Progreso REAL del objetivo (0-100): pasos completados / pasos
   * totales. Los "pasos" viven en el campo `hitos` (mismo campo desde
   * la Fase 1A, reutilizado — no se creó un campo nuevo separado para
   * no duplicar estructura). Sin pasos cargados: 0. */
  calcularProgresoPorPasos(goalId) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos || !g.hitos.length) return 0;
    const hechos = g.hitos.filter((p) => p.hecho).length;
    return Math.round((hechos / g.hitos.length) * 100);
  },

  /** Recalcula y persiste `porcentaje` de un objetivo (localStorage +
   * Firestore, por el mecanismo de sync que ya existía) a partir de sus
   * pasos. La llaman addHito/editHito/toggleHito/removeHito — nunca
   * hace falta llamarla a mano desde un renderer.
   *
   * Si el progreso pasa a 100% por primera vez, guarda `fechaAlcanzado`
   * (se conserva aunque después se destilde un paso — es un registro
   * de logro, no un estado en vivo) y devuelve `recienAlcanzado: true`
   * para que el renderer dispare la celebración y la notificación. */
  _recalcularYGuardarProgreso(goalId) {
    const g = this.getById("objetivos", goalId);
    if (!g) return { porcentaje: 0, recienAlcanzado: false };

    const nuevoPorcentaje = this.calcularProgresoPorPasos(goalId);
    const yaEstabaAlcanzado = !!g.fechaAlcanzado;
    g.porcentaje = nuevoPorcentaje;

    let recienAlcanzado = false;
    if (nuevoPorcentaje === 100 && !yaEstabaAlcanzado) {
      g.fechaAlcanzado = todayISO();
      recienAlcanzado = true;
    }

    this.save();
    this._syncPush("objetivos", goalId);
    return { porcentaje: nuevoPorcentaje, recienAlcanzado };
  },

  /** Objetivos alcanzados (100%, con fecha registrada), más recientes
   * primero — para la sección "Objetivos alcanzados". */
  objetivosAlcanzados() {
    return this.list("objetivos")
      .filter((o) => !!o.fechaAlcanzado)
      .sort((a, b) => (a.fechaAlcanzado < b.fechaAlcanzado ? 1 : -1));
  },
};

Store.load();
