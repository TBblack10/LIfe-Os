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

function id() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Datos de ejemplo iniciales — mismos objetivos/hábitos/proyectos que ya
 * existían en el prototipo estático, pero ahora como semilla real: el
 * usuario puede editarlos o borrarlos, y sus cambios persisten.
 */
function seedData() {
  return {
    usuario: {
      nombre: "",
      xpTotal: 0,
    },

    objetivos: [
      {
        id: id(),
        titulo: "Vivir en Noruega",
        emoji: "🇳🇴",
        tagline: "Construyendo paso a paso la vida que quiero.",
        porcentaje: 0,
        proximoPaso: "",
        metaFinal: "",
        imagen: "hero_noruega",
        esPrincipal: true,
        hitos: [],
      },
      {
        id: id(),
        titulo: "Aprender inglés",
        emoji: "📘",
        tagline: "",
        porcentaje: 0,
        proximoPaso: "",
        metaFinal: "",
        imagen: "goal_ingles",
        esPrincipal: false,
        hitos: [],
      },
      {
        id: id(),
        titulo: "Correr maratón",
        emoji: "🏃",
        tagline: "",
        porcentaje: 0,
        proximoPaso: "",
        metaFinal: "",
        imagen: "goal_maraton",
        esPrincipal: false,
        hitos: [],
      },
      {
        id: id(),
        titulo: "Ahorrar dinero",
        emoji: "💰",
        tagline: "",
        porcentaje: 0,
        proximoPaso: "",
        metaFinal: "",
        imagen: "goal_ahorro",
        esPrincipal: false,
        esFinanzas: true,
        hitos: [],
      },
    ],

    habitos: [
      { id: id(), nombre: "Leer 10 páginas", icono: "book", completions: [] },
      { id: id(), nombre: "Meditar 10 minutos", icono: "target", completions: [] },
      { id: id(), nombre: "Tomar 2L de agua", icono: "activity", completions: [] },
    ],

    proyectos: [
      { id: id(), titulo: "Good Service", descripcion: "", porcentaje: 0, tareasTotal: 0, tareasHechas: 0, imagen: "project_goodservice" },
      { id: id(), titulo: "Tejiendo Sueños", descripcion: "", porcentaje: 0, tareasTotal: 0, tareasHechas: 0, imagen: "project_tejiendo" },
      { id: id(), titulo: "Sistema Personal", descripcion: "", porcentaje: 0, tareasTotal: 0, tareasHechas: 0, imagen: "project_sistema" },
    ],

    tareasHoy: [
      { id: id(), texto: "Estudiar inglés", done: false },
      { id: id(), texto: "Entrenar", done: false },
      { id: id(), texto: "Avanzar en un proyecto", done: false },
    ],

    diario: [],
  };
}

const Store = {
  _data: null,

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
    return newItem;
  },

  update(collection, itemId, changes) {
    const item = this.getById(collection, itemId);
    if (item) Object.assign(item, changes);
    this.save();
    return item;
  },

  remove(collection, itemId) {
    const arr = this.data()[collection];
    const idx = arr.findIndex((x) => x.id === itemId);
    if (idx > -1) arr.splice(idx, 1);
    this.save();
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

  objetivoFinanzas() {
    return this.data().objetivos.find((o) => o.esFinanzas) || null;
  },

  // ---------- Hitos (milestones) por objetivo ----------
  addHito(goalId, texto) {
    const g = this.getById("objetivos", goalId);
    if (!g) return;
    if (!g.hitos) g.hitos = [];
    g.hitos.push({ texto, hecho: false });
    this.save();
  },

  toggleHito(goalId, index) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos || !g.hitos[index]) return;
    g.hitos[index].hecho = !g.hitos[index].hecho;
    this.save();
  },

  removeHito(goalId, index) {
    const g = this.getById("objetivos", goalId);
    if (!g || !g.hitos) return;
    g.hitos.splice(index, 1);
    this.save();
  },
};

Store.load();
