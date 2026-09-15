/**
 * LIFE OS — render-inicio.js
 * -----------------------------------------------------------------------
 * Renderiza toda la página Inicio a partir de Store (localStorage).
 * Los íconos, escapeHTML, thumbHTML, ringSVG y toCamel viven en
 * ui-helpers.js (compartido por todas las páginas).
 */

// ---------------------------------------------------------------
// ONBOARDING DINÁMICO — reemplaza el hero mientras el usuario no
// completó las 4 etapas iniciales. 100% derivado de datos reales de
// Store (nada hardcodeado ni un flag "ya vi el onboarding"): si en
// algún momento alguna etapa deja de cumplirse (ej. se borra el único
// proyecto), vuelve a aparecer como pendiente — es un reflejo honesto
// del estado actual, no un tutorial de una sola vez.
// ---------------------------------------------------------------
const ONBOARDING_MENSAJES = [
  "Empecemos a construir tu Life OS",
  "Ya empezaste. Sigamos construyendo.",
  "Tu Life OS empieza a tomar forma.",
  "Ya casi está.",
  "Tu Life OS está en marcha.",
];

function getOnboardingState() {
  const objetivos = Store.list("objetivos");
  const habitos = Store.list("habitos");
  const proyectos = Store.list("proyectos");

  const etapas = [
    {
      key: "objetivoPrincipal",
      emoji: "⭐",
      titulo: "Objetivo principal",
      texto: "Definí aquello que más querés conseguir.",
      cta: "Crear objetivo",
      accion: "openNuevoObjetivo()",
      done: objetivos.length >= 1,
    },
    {
      key: "primerHabito",
      emoji: "🔄",
      titulo: "Primer hábito",
      texto: "Elegí una pequeña acción que quieras incorporar.",
      cta: "Crear hábito",
      accion: "openNuevoHabitoOnboarding()",
      done: habitos.length >= 1,
    },
    {
      key: "primerObjetivo",
      emoji: "🎯",
      titulo: "Primer objetivo",
      texto: "Convertí algo que querés lograr en un objetivo concreto.",
      cta: "Crear objetivo",
      accion: "openNuevoObjetivo()",
      done: objetivos.length >= 2,
    },
    {
      key: "primerProyecto",
      emoji: "🚀",
      titulo: "Primer proyecto",
      texto: "Organizá algo que estés construyendo.",
      cta: "Crear proyecto",
      accion: "openNuevoProyecto()",
      done: proyectos.length >= 1,
    },
  ];

  return { etapas, completadas: etapas.filter((e) => e.done).length, total: etapas.length };
}

/** Claves de etapa que estaban completas en el render anterior de esta
 * sesión (no se persiste — al recargar la página se recalcula desde
 * cero, así nunca puede "mentir" sobre el estado real). Se usa solo
 * para dos cosas puramente visuales: marcar qué tarjeta "acaba de"
 * completarse (animación) y evitar el parpadeo de celebración cuando
 * una cuenta que YA tenía las 4 etapas simplemente recarga la página. */
let onboardingEtapaKeysPrevias = new Set();

function renderOnboarding(el, etapas, completadas, total, opts = {}) {
  const nuevas = new Set(etapas.filter((e) => e.done).map((e) => e.key));

  el.innerHTML = `
    <div class="card onboarding fade-up ${opts.celebrando ? "is-celebrating" : ""}">
      <div class="onboarding__intro">
        <p class="onboarding__wave"><span class="onboarding__wave-emoji">👋</span> Bienvenido a Life OS</p>
        <p class="text-secondary">Tu espacio para organizar lo que querés construir y convertirlo en acciones concretas.</p>
      </div>

      <div class="onboarding__progress-row">
        <h2 class="onboarding__headline">${ONBOARDING_MENSAJES[completadas]}</h2>
        <span class="tag tag--accent">${completadas}/${total} completados</span>
      </div>
      <div class="progress onboarding__progress-bar"><div class="progress__fill" style="--value:${(completadas / total) * 100}%"></div></div>

      <div class="onboarding__grid stagger">
        ${etapas.map((e, i) => {
          const reciénCompletada = e.done && !onboardingEtapaKeysPrevias.has(e.key);
          return `
          <div class="onboarding-card ${e.done ? "is-done" : ""} ${reciénCompletada ? "is-newly-done" : ""}" style="animation-delay:${i * 60}ms">
            <span class="onboarding-card__emoji">${e.done ? "✅" : e.emoji}</span>
            <div class="onboarding-card__body">
              <span class="onboarding-card__title">${escapeHTML(e.titulo)}${e.done ? ` <span class="onboarding-card__title-check">✓</span>` : ""}</span>
              <p class="onboarding-card__text">${escapeHTML(e.texto)}</p>
              ${e.done
                ? `<span class="onboarding-card__done-tag">${ICONS.checkCircle} Completado</span>`
                : `<button type="button" class="btn btn--accent btn--sm" onclick="${e.accion}">${escapeHTML(e.cta)}</button>`}
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;

  onboardingEtapaKeysPrevias = nuevas;
}

// ---------------------------------------------------------------
// HERO
// ---------------------------------------------------------------
function renderHero() {
  const { etapas, completadas, total } = getOnboardingState();
  const el = document.getElementById("heroSection");

  if (completadas < total) {
    renderOnboarding(el, etapas, completadas, total);
    return;
  }

  // Recién ahora llega a 4/4 en esta sesión (venía mostrando el
  // onboarding con progreso real, no es solo una recarga de página de
  // una cuenta que ya lo tenía completo): transición corta y se revela
  // el dashboard de verdad.
  const veníaIncompleto = onboardingEtapaKeysPrevias.size > 0 && onboardingEtapaKeysPrevias.size < total;
  if (veníaIncompleto) {
    renderOnboarding(el, etapas, completadas, total, { celebrando: true });
    setTimeout(() => {
      const elAhora = document.getElementById("heroSection");
      if (elAhora) renderHeroDashboard();
    }, 480);
    return;
  }

  onboardingEtapaKeysPrevias = new Set(etapas.map((e) => e.key));
  renderHeroDashboard();
}

function renderHeroDashboard() {
  const goal = Store.objetivoPrincipal();
  const el = document.getElementById("heroSection");
  if (!el) return;
  if (!goal) {
    // Defensivo: no debería pasar (el onboarding ya garantiza al menos
    // un objetivo antes de llegar acá), pero por si acaso no se rompe.
    renderOnboarding(el, getOnboardingState().etapas, 0, 4);
    return;
  }
  const img = imageOrGradient(goal.imagen, goal.titulo);
  const bg = img.type === "image"
    ? `<img class="hero__bg" src="${img.value}" alt="${escapeHTML(goal.titulo)}">`
    : `<div class="hero__bg" style="background:${img.value}"></div>`;

  el.innerHTML = `
    ${bg}
    <div class="hero__content">
      <span class="eyebrow">${ICONS.target} Objetivo principal</span>
      <h1 class="hero__title">${escapeHTML(goal.titulo)} <span class="hero__flag">${goal.emoji || ""}</span></h1>
      <p class="hero__tagline">${escapeHTML(goal.tagline || "")}</p>
      <div class="hero__row">
        <div class="hero__ring">
          <svg viewBox="0 0 100 100">
            <circle class="hero__ring-bg" cx="50" cy="50" r="42"/>
            ${(goal.hitos || []).length ? `<circle class="hero__ring-fg" cx="50" cy="50" r="42" style="--pct:${goal.porcentaje}"></circle>` : ""}
          </svg>
          <div class="hero__ring-label">
            ${(goal.hitos || []).length
              ? `<span class="hero__ring-pct">${goal.porcentaje}%</span><span class="hero__ring-text">Completado</span>`
              : `<span class="hero__ring-text">Sin pasos aún</span>`}
          </div>
        </div>
        <div class="hero__meta">
          <div class="hero__meta-item"><span>Próximo paso</span><span>${ICONS.book}${escapeHTML(goal.proximoPaso) || "Por definir"}</span></div>
          <div class="hero__meta-item"><span>Meta final</span><span>${ICONS.calendar}${escapeHTML(goal.metaFinal) || "Por definir"}</span></div>
        </div>
      </div>
      <div style="display:flex; gap:var(--space-2xs)">
        <a href="roadmap.html" class="btn btn--primary btn--sm hero__cta">Ver roadmap completo <span class="btn__icon">${ICONS.chevronRight}</span></a>
        <button type="button" class="btn btn--ghost btn--sm" onclick="openEditObjetivo('${goal.id}')">Editar</button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------
// HOY — tareas y hábitos
// ---------------------------------------------------------------
function renderHoy() {
  const tareas = Store.list("tareasHoy");
  const done = tareas.filter((t) => t.done).length;
  document.getElementById("tareasCount").textContent = `${done}/${tareas.length}`;
  const tareasList = document.getElementById("tareasList");
  tareasList.innerHTML = tareas.length
    ? tareas.map((t) => `
        <label class="checklist-item">
          <input type="checkbox" ${t.done ? "checked" : ""} onchange="handleToggleTask('${t.id}')">
          <span class="checklist-item__box"></span>
          <span class="checklist-item__text">${escapeHTML(t.texto)}</span>
        </label>`).join("")
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">No hay tareas para hoy. Un buen momento para planificar tu día o avanzar en alguno de tus objetivos.</p>`;

  const habitos = Store.list("habitos");
  const doneHoy = habitos.filter((h) => Store.isHabitDoneToday(h.id)).length;
  document.getElementById("habitosHoyCount").textContent = `${doneHoy}/${habitos.length}`;
  const habitosList = document.getElementById("habitosHoyList");
  habitosList.innerHTML = habitos.length
    ? habitos.slice(-4).reverse().map((h) => `
        <label class="checklist-item">
          <input type="checkbox" ${Store.isHabitDoneToday(h.id) ? "checked" : ""} onchange="handleToggleHabit('${h.id}')">
          <span class="checklist-item__box"></span>
          <span class="checklist-item__text">${escapeHTML(h.nombre)}</span>
        </label>`).join("")
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no sumaste hábitos. Elegí uno simple y repetilo hoy.</p>`;
}

function handleToggleTask(taskId) {
  Store.toggleTask(taskId);
  renderHoy();
}

function handleToggleHabit(habitId) {
  Store.toggleHabitToday(habitId);
  renderHoy();
  renderHabitosResumen();
}

// ---------------------------------------------------------------
// OBJETIVOS — resumen (filas)
// ---------------------------------------------------------------
function renderObjetivosResumen() {
  const objetivos = Store.list("objetivos");
  const el = document.getElementById("objetivosResumen");
  if (!objetivos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm)">Todavía no creaste ningún objetivo. Empezá por el que más te importa.</p>`;
    return;
  }
  el.innerHTML = objetivos.map((o) => {
    const tienePasos = (o.hitos || []).length > 0;
    return `
    <div class="goal-row" style="cursor:pointer" onclick="location.href='objetivo-detalle.html?id=${o.id}'">
      ${thumbHTML(o.imagen, o.titulo, "goal-row__thumb")}
      <div class="goal-row__body">
        <div class="goal-row__title-row">
          <span class="goal-row__title">${escapeHTML(o.titulo)}</span>
          ${tienePasos
            ? `<span class="goal-row__percent">${o.porcentaje}%</span>`
            : `<span class="goal-row__percent text-tertiary" style="font-weight:var(--fw-regular)">Sin pasos aún</span>`}
        </div>
        ${tienePasos ? `<div class="progress progress--thin"><div class="progress__fill" style="--value:${o.porcentaje}%"></div></div>` : ""}
      </div>
      <span class="goal-row__chevron">${ICONS.chevronRight}</span>
    </div>
  `;
  }).join("");
}

// ---------------------------------------------------------------
// HÁBITOS — resumen compacto
// ---------------------------------------------------------------
function renderHabitosResumen() {
  const habitos = Store.list("habitos");
  const el = document.getElementById("habitosResumen");
  if (!habitos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm) 0">Todavía no tenés hábitos. Sumá el primero y empezá a construir tu constancia.</p>`;
    return;
  }
  el.innerHTML = habitos.slice(-3).reverse().map((h) => {
    const dias = Store.habitLast6Days(h.id);
    const dots = dias.map((d) => `<span class="habit-row__day ${d ? "is-done" : ""}"></span>`).join("");
    return `
      <div class="habit-row">
        <span class="habit-row__icon">${ICONS[toCamel(h.icono)] || ICONS.target}</span>
        <div class="habit-row__body">
          <div class="habit-row__name">${escapeHTML(h.nombre)}</div>
          <div class="habit-row__streak">Racha: ${Store.habitStreak(h.id)} días</div>
        </div>
        <div class="habit-row__days">${dots}</div>
      </div>`;
  }).join("");
}

// ---------------------------------------------------------------
// PROYECTOS — resumen compacto
// ---------------------------------------------------------------
function renderProyectosResumen() {
  const proyectos = Store.list("proyectos");
  const el = document.getElementById("proyectosResumen");
  if (!proyectos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm) 0">Todavía no tenés proyectos. Organizá tu próxima gran meta en pasos simples.</p>`;
    return;
  }
  el.innerHTML = proyectos.slice(-3).reverse().map((p) => `
    <a href="proyectos.html" class="project-row">
      <span class="project-row__icon">${ICONS.briefcase}</span>
      <div class="project-row__body">
        <div class="project-row__title">${escapeHTML(p.titulo)}</div>
        <div class="project-row__sub">${p.tareasHechas}/${p.tareasTotal} tareas</div>
      </div>
      <span class="project-row__percent">${p.porcentaje}%</span>
    </a>
  `).join("");
}

// ---------------------------------------------------------------
// ROADMAP + PROGRESO — vista resumen (no editable en esta fase)
// ---------------------------------------------------------------
const ROADMAP_STEPS = [
  { label: "Primer paso", icon: "book" },
  { label: "Buen ritmo", icon: "dollar" },
  { label: "A mitad de camino", icon: "graduation" },
  { label: "Recta final", icon: "briefcase" },
  { label: "Meta cumplida", icon: "checkCircle" },
];
const PROGRESO_AREAS = [
  { label: "Inglés", icon: "book" },
  { label: "Salud", icon: "heartPulse" },
  { label: "Finanzas", icon: "dollar" },
  { label: "Trabajo", icon: "briefcase" },
  { label: "Aprendizaje", icon: "graduation" },
];

function renderRoadmapResumen() {
  document.getElementById("roadmapResumen").innerHTML = ROADMAP_STEPS.map((s) => `
    <div class="roadmap-step">
      <div class="roadmap-step__node">${ICONS[s.icon]}</div>
      <span class="roadmap-step__label">${s.label}</span>
      <span class="roadmap-step__pct">0%</span>
    </div>`).join("");
}

function renderProgresoResumen() {
  document.getElementById("progresoResumen").innerHTML = PROGRESO_AREAS.map((a) => `
    <div class="progress-ring">
      <div class="progress-ring__circle">
        ${ringSVG(0)}
        <span class="progress-ring__value">0%</span>
      </div>
      <span class="progress-ring__icon">${ICONS[a.icon]}${a.label}</span>
    </div>`).join("");
}

// ---------------------------------------------------------------
// MODALES — crear / editar objetivo, hábito, proyecto, tarea
// ---------------------------------------------------------------
function openNuevoObjetivo() {
  Modal.open({
    title: "Nuevo objetivo",
    fields: [
      { key: "titulo", label: "¿Qué querés lograr?", type: "text", required: true, placeholder: "Ej: Aprender a tocar guitarra" },
      { key: "tagline", label: "¿Para qué querés lograrlo?", type: "textarea", placeholder: "Tu propósito detrás de este objetivo" },
      { key: "emoji", label: "Emoji (opcional)", type: "text", placeholder: "🎯" },
      { key: "proximoPaso", label: "Próximo paso", type: "text" },
      { key: "metaFinal", label: "Meta final", type: "text", placeholder: "Ej: Dic 2026" },
    ],
    values: {},
    submitLabel: "Crear objetivo",
    onSubmit: (values) => {
      Store.create("objetivos", { ...values, porcentaje: 0, imagen: null, esPrincipal: false });
      renderObjetivosResumen();
      renderHero();
    },
  });
}

function openEditObjetivo(goalId) {
  const goal = Store.getById("objetivos", goalId);
  if (!goal) return;
  Modal.open({
    title: "Editar objetivo",
    fields: [
      { key: "titulo", label: "¿Qué querés lograr?", type: "text", required: true },
      { key: "emoji", label: "Emoji", type: "text" },
      { key: "tagline", label: "¿Para qué querés lograrlo?", type: "textarea" },
      { key: "proximoPaso", label: "Próximo paso", type: "text" },
      { key: "metaFinal", label: "Meta final", type: "text" },
    ],
    values: goal,
    submitLabel: "Guardar cambios",
    onSubmit: (values) => {
      Store.update("objetivos", goalId, values);
      renderObjetivosResumen();
      renderHero();
    },
    onDelete: goal.esPrincipal ? null : () => {
      Store.remove("objetivos", goalId);
      renderObjetivosResumen();
      renderHero();
    },
  });
}

function openNuevaTarea() {
  Modal.open({
    title: "Nueva tarea",
    fields: [{ key: "texto", label: "¿Qué querés hacer hoy?", type: "text", required: true }],
    values: {},
    submitLabel: "Agregar tarea",
    onSubmit: (values) => {
      Store.create("tareasHoy", { texto: values.texto, done: false });
      renderHoy();
    },
  });
}

function openNuevoProyecto() {
  Modal.open({
    title: "Nuevo proyecto",
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "porcentaje", label: "Progreso (%)", type: "number", min: 0, max: 100 },
      { key: "tareasTotal", label: "Tareas totales", type: "number", min: 0 },
      { key: "tareasHechas", label: "Tareas completadas", type: "number", min: 0 },
    ],
    values: { porcentaje: 0, tareasTotal: 0, tareasHechas: 0 },
    submitLabel: "Crear proyecto",
    onSubmit: (values) => {
      Store.create("proyectos", { ...values, imagen: null });
      renderProyectosResumen();
      renderHero();
    },
  });
}

/** Igual que openNuevoHabito() de render-habitos.js (mismos campos y
 * misma llamada a Store.create), pero pensado para la tarjeta "Primer
 * hábito" del onboarding de Inicio, que no carga ese archivo. No
 * cambia la lógica de hábitos — solo permite crear uno desde acá. */
function openNuevoHabitoOnboarding() {
  Modal.open({
    title: "Nuevo hábito",
    fields: [
      { key: "nombre", label: "¿Qué querés repetir?", type: "text", required: true, placeholder: "Ej: Salir a caminar" },
      { key: "icono", label: "Ícono", type: "text", placeholder: "book, target, activity, heart-pulse..." },
      { key: "fechaInicio", label: "Fecha de inicio", type: "date", required: true },
      { key: "vecesPorSemana", label: "Veces por semana", type: "number", min: 1, max: 7 },
    ],
    values: { icono: "target", fechaInicio: todayISO(), vecesPorSemana: 7 },
    submitLabel: "Crear hábito",
    onSubmit: (values) => {
      Store.create("habitos", {
        nombre: values.nombre,
        icono: values.icono || "target",
        completions: [],
        fechaInicio: values.fechaInicio || todayISO(),
        vecesPorSemana: Math.max(1, Math.min(7, Number(values.vecesPorSemana) || 7)),
        diasPreferidos: [],
      });
      renderHoy();
      renderHabitosResumen();
      renderHero();
    },
  });
}

// ---------------------------------------------------------------
// INIT
// ---------------------------------------------------------------
window.addEventListener("lifeos:ready", () => {
  renderHero();
  renderHoy();
  renderObjetivosResumen();
  renderRoadmapResumen();
  renderProgresoResumen();
  renderHabitosResumen();
  renderProyectosResumen();
});
