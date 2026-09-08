/**
 * LIFE OS — notifications.js
 * -----------------------------------------------------------------------
 * Notificaciones del navegador (V1, sin service worker ni push real):
 *   - Activar/desactivar + horario, guardado en localStorage (una
 *     preferencia del dispositivo, no un dato que sincronice con
 *     Firestore — no forma parte de Store a propósito).
 *   - Recordatorio de hábitos: se revisa UNA vez por carga de página,
 *     si la hora actual está cerca del horario configurado, y solo
 *     avisa por los hábitos que todavía no cumplieron su cuota semanal
 *     (evita recordatorios innecesarios).
 *   - Notificación al alcanzar un objetivo (la llama render-detalle.js).
 *
 * LÍMITE HONESTO: sin un service worker no hay notificaciones reales
 * en segundo plano — esto solo puede avisar mientras la pestaña de
 * Life OS está abierta. Para recordatorios que lleguen con la app
 * cerrada hace falta Push API + service worker, fuera de alcance de
 * esta V1.
 */

const NOTIF_PREFS_KEY = "lifeos_notif_prefs_v1";
const NOTIF_LAST_CHECK_KEY = "lifeos_notif_last_check_v1";

const Notif = {
  getPrefs() {
    try {
      const raw = localStorage.getItem(NOTIF_PREFS_KEY);
      return raw ? JSON.parse(raw) : { activo: false, horario: "09:00" };
    } catch (e) {
      return { activo: false, horario: "09:00" };
    }
  },

  savePrefs(prefs) {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  },

  soportado() {
    return typeof Notification !== "undefined";
  },

  permisoActual() {
    return this.soportado() ? Notification.permission : "unsupported";
  },

  async solicitarPermiso() {
    if (!this.soportado()) return "unsupported";
    const resultado = await Notification.requestPermission();
    return resultado;
  },

  async activar(horario) {
    if (!this.soportado()) return false;
    const permiso = await this.solicitarPermiso();
    if (permiso !== "granted") {
      this.savePrefs({ activo: false, horario: horario || this.getPrefs().horario });
      return false;
    }
    this.savePrefs({ activo: true, horario: horario || this.getPrefs().horario });
    return true;
  },

  desactivar() {
    const prefs = this.getPrefs();
    this.savePrefs({ ...prefs, activo: false });
  },

  _mostrar(titulo, opciones) {
    if (!this.soportado() || Notification.permission !== "granted") return;
    try {
      new Notification(titulo, opciones);
    } catch (e) {
      console.error("Notif: no se pudo mostrar la notificación.", e);
    }
  },

  notificarLogro(tituloObjetivo) {
    const prefs = this.getPrefs();
    if (!prefs.activo) return;
    this._mostrar("¡Objetivo alcanzado! 🎉", {
      body: `Completaste todos los pasos de "${tituloObjetivo}".`,
      icon: "assets/img/avatars/avatar-user.svg",
    });
  },

  /** Se llama una vez al cargar cualquier página protegida. Si está
   * dentro de la ventana del horario configurado y no se avisó ya hoy,
   * revisa los hábitos que todavía no llegaron a su cuota semanal y
   * manda UN recordatorio agrupado (no uno por hábito, para no
   * saturar). */
  revisarRecordatoriosDeHabitos() {
    const prefs = this.getPrefs();
    if (!prefs.activo || !this.soportado() || Notification.permission !== "granted") return;
    if (typeof Store === "undefined") return;

    const ahora = new Date();
    const hoy = ahora.toISOString().slice(0, 10);
    const ultimaRevision = localStorage.getItem(NOTIF_LAST_CHECK_KEY);
    if (ultimaRevision === hoy) return; // ya se avisó hoy, no repetir

    const [hh, mm] = (prefs.horario || "09:00").split(":").map(Number);
    const minutosConfigurados = hh * 60 + mm;
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    // Ventana de 15 min: como esto se revisa solo al cargar una página
    // (no hay chequeo continuo en V1), una ventana angosta evita
    // notificar a cualquier hora del día por error de diseño, sin
    // necesitar que el usuario tenga la pestaña abierta al segundo exacto.
    if (Math.abs(minutosAhora - minutosConfigurados) > 15) return;

    const pendientes = Store.list("habitos").filter((h) => {
      const cumplimiento = Store.cumplimientoHabito(h.id);
      return cumplimiento < 1; // no llegó a su cuota de la semana
    });

    if (!pendientes.length) return; // ya cumpliste todo, no hay nada que recordar

    localStorage.setItem(NOTIF_LAST_CHECK_KEY, hoy);
    const nombres = pendientes.slice(0, 3).map((h) => h.nombre).join(", ");
    const extra = pendientes.length > 3 ? ` y ${pendientes.length - 3} más` : "";
    this._mostrar("Recordatorio de hábitos", {
      body: `Todavía te falta avanzar con: ${nombres}${extra}.`,
      icon: "assets/img/avatars/avatar-user.svg",
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // Se ejecuta apenas carga el DOM; no depende de lifeos:ready porque
  // no toca la UI, solo lee Store (que ya está disponible como script
  // sincrónico cargado antes que este archivo).
  Notif.revisarRecordatoriosDeHabitos();
});
