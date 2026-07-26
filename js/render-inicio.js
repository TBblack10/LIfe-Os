/**
 * LIFE OS — render-inicio.js
 * -----------------------------------------------------------------------
 * Renderiza toda la página Inicio a partir de Store (localStorage).
 * Los íconos, escapeHTML, thumbHTML, ringSVG y toCamel viven en
 * ui-helpers.js (compartido por todas las páginas).
 */

// ---------------------------------------------------------------
// HERO
// ---------------------------------------------------------------
function renderHero() {
  const goal = Store.objetivoPrincipal();
  const el = document.getElementById("heroSection");
  if (!goal) {
    el.innerHTML = `<div class="card" style="text-align:center; padding:var(--space-2xl)">
      <p>Todavía no tenés un objetivo principal.</p>
      <button class="btn btn--accent btn--sm" style="margin-top:var(--space-sm)" onclick="openNuevoObjetivo()">Crear objetivo principal</button>
    </div>`;
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
            <circle class="hero__ring-fg" cx="50" cy="50" r="42" style="--pct:${goal.porcentaje}"></circle>
          </svg>
          <div class="hero__ring-label">
            <span class="hero__ring-pct">${goal.porcentaje}%</span>
            <span class="hero__ring-text">Completado</span>
          </div>
        </div>
        <div class="hero__meta">
          <div class="hero__meta-item"><span>Próximo paso</span><span>${ICONS.book}${escapeHTML(goal.proximoPaso) || "Sin definir"}</span></div>
          <div class="hero__meta-item"><span>Meta final</span><span>${ICONS.calendar}${escapeHTML(goal.metaFinal) || "Sin definir"}</span></div>
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
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no agregaste tareas para hoy.</p>`;

  const habitos = Store.list("habitos");
  const doneHoy = habitos.filter((h) => Store.isHabitDoneToday(h.id)).length;
  document.getElementById("habitosHoyCount").textContent = `${doneHoy}/${habitos.length}`;
  const habitosList = document.getElementById("habitosHoyList");
  habitosList.innerHTML = habitos.length
    ? habitos.slice(0, 4).map((h) => `
        <label class="checklist-item">
          <input type="checkbox" ${Store.isHabitDoneToday(h.id) ? "checked" : ""} onchange="handleToggleHabit('${h.id}')">
          <span class="checklist-item__box"></span>
          <span class="checklist-item__text">${escapeHTML(h.nombre)}</span>
        </label>`).join("")
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no configuraste hábitos.</p>`;
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
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm)">Todavía no creaste ningún objetivo.</p>`;
    return;
  }
  el.innerHTML = objetivos.map((o) => `
    <div class="goal-row" style="cursor:pointer" onclick="location.href='objetivo-detalle.html?id=${o.id}'">
      ${thumbHTML(o.imagen, o.titulo, "goal-row__thumb")}
      <div class="goal-row__body">
        <div class="goal-row__title-row">
          <span class="goal-row__title">${escapeHTML(o.titulo)}</span>
          <span class="goal-row__percent">${o.porcentaje}%</span>
        </div>
        <div class="progress progress--thin"><div class="progress__fill" style="--value:${o.porcentaje}%"></div></div>
      </div>
      <span class="goal-row__chevron">${ICONS.chevronRight}</span>
    </div>
  `).join("");
}

// ---------------------------------------------------------------
// HÁBITOS — resumen compacto
// ---------------------------------------------------------------
function renderHabitosResumen() {
  const habitos = Store.list("habitos");
  const el = document.getElementById("habitosResumen");
  if (!habitos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm) 0">Todavía no creaste hábitos.</p>`;
    return;
  }
  el.innerHTML = habitos.slice(0, 3).map((h) => {
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
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm) 0">Todavía no creaste proyectos.</p>`;
    return;
  }
  el.innerHTML = proyectos.slice(0, 3).map((p) => `
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
  { label: "Base de inglés", icon: "book" },
  { label: "Fondo de ahorro", icon: "dollar" },
  { label: "Certificación", icon: "graduation" },
  { label: "Visa", icon: "briefcase" },
  { label: "Noruega", icon: "plane" },
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
      { key: "titulo", label: "Título", type: "text", required: true, placeholder: "Ej: Aprender a tocar guitarra" },
      { key: "emoji", label: "Emoji (opcional)", type: "text", placeholder: "🎯" },
      { key: "porcentaje", label: "Progreso (%)", type: "number", min: 0, max: 100 },
      { key: "proximoPaso", label: "Próximo paso", type: "text" },
      { key: "metaFinal", label: "Meta final", type: "text", placeholder: "Ej: Dic 2026" },
    ],
    values: { porcentaje: 0 },
    submitLabel: "Crear objetivo",
    onSubmit: (values) => {
      Store.create("objetivos", { ...values, imagen: null, esPrincipal: false, tagline: "" });
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
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "emoji", label: "Emoji", type: "text" },
      { key: "tagline", label: "Frase (solo objetivo principal)", type: "text" },
      { key: "porcentaje", label: "Progreso (%)", type: "number", min: 0, max: 100 },
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
    },
  });
}

// ---------------------------------------------------------------
// INIT
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  renderHoy();
  renderObjetivosResumen();
  renderRoadmapResumen();
  renderProgresoResumen();
  renderHabitosResumen();
  renderProyectosResumen();
});
