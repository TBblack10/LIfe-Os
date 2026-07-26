/**
 * LIFE OS — render-detalle.js
 * Vista de detalle de un objetivo puntual: banner, progreso, próximo
 * paso, meta final, e hitos (crear / marcar / borrar).
 * El objetivo se identifica por ?id= en la URL.
 */

function getGoalIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderDetalle() {
  const goalId = getGoalIdFromURL();
  const goal = Store.getById("objetivos", goalId);
  const el = document.getElementById("detalleContenido");

  if (!goal) {
    el.innerHTML = `
      <div class="empty-state fade-up">
        ${ICONS.target}
        <span class="empty-state__title">No encontramos este objetivo</span>
        <p class="empty-state__text">Puede que haya sido eliminado.</p>
        <a href="objetivos.html" class="btn btn--accent btn--sm" style="margin-top:var(--space-2xs)">Volver a Objetivos</a>
      </div>`;
    return;
  }

  document.title = `${goal.titulo} · Life OS`;
  const img = imageOrGradient(goal.imagen, goal.titulo);
  const bg = img.type === "image"
    ? `<img class="hero__bg" src="${img.value}" alt="${escapeHTML(goal.titulo)}">`
    : `<div class="hero__bg" style="background:${img.value}"></div>`;

  const hitos = goal.hitos || [];
  const hitosHTML = hitos.length
    ? hitos.map((h, i) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-sm)">
          <label class="checklist-item">
            <input type="checkbox" ${h.hecho ? "checked" : ""} onchange="handleToggleHito('${goal.id}', ${i})">
            <span class="checklist-item__box"></span>
            <span class="checklist-item__text">${escapeHTML(h.texto)}</span>
          </label>
          <button type="button" class="icon-btn" style="width:32px;height:32px" aria-label="Borrar hito" onclick="handleRemoveHito('${goal.id}', ${i})">${ICONS.trash}</button>
        </div>`).join("")
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no agregaste hitos para este objetivo.</p>`;

  el.innerHTML = `
    <section class="hero fade-up">
      ${bg}
      <div class="hero__content">
        <span class="eyebrow">${ICONS.target} ${goal.esPrincipal ? "Objetivo principal" : "Objetivo"}</span>
        <h1 class="hero__title">${escapeHTML(goal.titulo)} <span class="hero__flag">${goal.emoji || ""}</span></h1>
        ${goal.tagline ? `<p class="hero__tagline">${escapeHTML(goal.tagline)}</p>` : ""}
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
        <button type="button" class="btn btn--primary btn--sm hero__cta" onclick="openEditObjetivoDetalle()">Editar objetivo</button>
      </div>
    </section>

    <section class="section fade-up" style="margin-top:var(--space-lg)">
      <div class="section__header">
        <h2 class="section__title">${ICONS.chevronRight} Hitos</h2>
        <button type="button" class="card__link" style="background:none;border:none;cursor:pointer" onclick="openNuevoHito()">${ICONS.plus} Agregar hito</button>
      </div>
      <div class="card">${hitosHTML}</div>
    </section>
  `;
}

function handleToggleHito(goalId, index) {
  Store.toggleHito(goalId, index);
  renderDetalle();
}

function handleRemoveHito(goalId, index) {
  Store.removeHito(goalId, index);
  renderDetalle();
}

function openNuevoHito() {
  const goalId = getGoalIdFromURL();
  Modal.open({
    title: "Nuevo hito",
    fields: [{ key: "texto", label: "¿Qué hito querés alcanzar?", type: "text", required: true }],
    values: {},
    submitLabel: "Agregar",
    onSubmit: (values) => {
      Store.addHito(goalId, values.texto);
      renderDetalle();
    },
  });
}

function openEditObjetivoDetalle() {
  const goalId = getGoalIdFromURL();
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
      renderDetalle();
    },
    onDelete: goal.esPrincipal ? null : () => {
      Store.remove("objetivos", goalId);
      window.location.href = "objetivos.html";
    },
  });
}

document.addEventListener("DOMContentLoaded", renderDetalle);
