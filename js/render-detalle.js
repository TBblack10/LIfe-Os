/**
 * LIFE OS — render-detalle.js
 * -----------------------------------------------------------------------
 * Vista de detalle de un objetivo (V1 — "Camino visual"):
 *   - Propósito ("¿Para qué querés lograrlo?")
 *   - Anillo de progreso + "X de Y pasos completados"
 *   - Pasos, como stepper visual (reutiliza el componente roadmap-step
 *     que ya existía) + lista con editar/borrar
 *   - Hábitos vinculados, mostrados como CONSTANCIA (no se mezcla con
 *     el progreso del objetivo, que ahora depende solo de los pasos)
 *   - Celebración sutil + notificación al llegar a 100%
 *
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

  const pasos = goal.hitos || [];
  const totalPasos = pasos.length;
  const pasosHechos = pasos.filter((p) => p.hecho).length;
  const alcanzado = goal.porcentaje === 100;

  const stepperHTML = totalPasos
    ? `<div class="roadmap-stepper">${pasos.map((p, i) => {
        const esActual = !p.hecho && pasos.slice(0, i).every((x) => x.hecho);
        const cls = p.hecho ? "roadmap-step--done" : esActual ? "roadmap-step--current" : "";
        return `
          <div class="roadmap-step ${cls}" style="cursor:pointer" onclick="handleToggleHito('${goal.id}', ${i})" title="Marcar/desmarcar">
            <div class="roadmap-step__node">${p.hecho ? ICONS.checkCircle : (i + 1)}</div>
            <span class="roadmap-step__label">${escapeHTML(p.texto)}</span>
          </div>`;
      }).join("")}</div>`
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no agregaste pasos.</p>`;

  const pasosListaHTML = totalPasos
    ? pasos.map((p, i) => `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-sm); padding: var(--space-2xs) 0;">
          <label class="checklist-item">
            <input type="checkbox" ${p.hecho ? "checked" : ""} onchange="handleToggleHito('${goal.id}', ${i})">
            <span class="checklist-item__box"></span>
            <span class="checklist-item__text">${escapeHTML(p.texto)}</span>
          </label>
          <div style="display:flex; gap:4px;">
            <button type="button" class="icon-btn" style="width:32px;height:32px" aria-label="Editar paso" onclick="handleEditarHito('${goal.id}', ${i})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button type="button" class="icon-btn" style="width:32px;height:32px" aria-label="Borrar paso" onclick="handleRemoveHito('${goal.id}', ${i})">${ICONS.trash}</button>
          </div>
        </div>`).join("")
    : "";

  const vinculos = Store.habitsForGoal(goal.id);
  const habitosHTML = vinculos.length
    ? vinculos.map((v) => {
        const constancia = Math.round(Store.cumplimientoHabito(v.habitoId) * 100);
        const dias = Store.habitLast6Days(v.habitoId);
        const dots = dias.map((d) => `<span class="habit-row__day ${d ? "is-done" : ""}"></span>`).join("");
        const vecesPorSemana = v.habito.vecesPorSemana || 7;
        return `
        <div class="card" style="margin-bottom:var(--space-2xs)">
          <div style="display:flex; align-items:center; gap:var(--space-sm);">
            <span class="habit-row__icon">${ICONS[toCamel(v.habito.icono)] || ICONS.target}</span>
            <div style="flex:1; min-width:0;">
              <div style="font-size:var(--fs-sm); font-weight:var(--fw-medium)">${escapeHTML(v.habito.nombre)}</div>
              <div class="text-tertiary" style="font-size:var(--fs-2xs)">${vecesPorSemana} veces por semana</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:var(--font-display); font-weight:var(--fw-semibold); color:var(--color-accent-strong)">${constancia}%</div>
              <div class="text-tertiary" style="font-size:var(--fs-2xs)">Constancia</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:var(--space-xs)">
            <div class="habit-row__days">${dots}</div>
            <div style="display:flex; gap:var(--space-2xs); align-items:center">
              <select onchange="handleCambiarImportancia('${goal.id}', '${v.habitoId}', this.value)" style="height:30px; padding:0 var(--space-2xs); border-radius:var(--radius-sm); background-color:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text-secondary); font-size:var(--fs-2xs);">
                <option value="principal" ${v.importancia === "principal" ? "selected" : ""}>Principal</option>
                <option value="importante" ${v.importancia === "importante" ? "selected" : ""}>Importante</option>
                <option value="complementario" ${v.importancia === "complementario" ? "selected" : ""}>Complementario</option>
              </select>
              <button type="button" class="icon-btn" style="width:28px;height:28px" aria-label="Desvincular hábito" onclick="handleDesvincularHabito('${goal.id}', '${v.habitoId}')">${ICONS.trash}</button>
            </div>
          </div>
        </div>`;
      }).join("")
    : `<p class="text-tertiary" style="padding: var(--space-sm) 0;">Todavía no vinculaste ningún hábito. La constancia se muestra acá, aparte del progreso — no afecta el % del objetivo.</p>`;

  el.innerHTML = `
    <div class="page-header fade-up">
      <a href="objetivos.html" class="card__link">${ICONS.chevronLeft} Volver</a>
    </div>

    <section class="card fade-up" id="objetivoHeaderCard">
      <div style="display:flex; align-items:flex-start; gap:var(--space-sm); margin-bottom:var(--space-md)">
        <div style="width:48px; height:48px; border-radius:var(--radius-md); background:var(--gradient-accent); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">
          ${goal.emoji || "🎯"}
        </div>
        <div style="flex:1; min-width:0;">
          <h1 style="font-size:var(--fs-xl)">${escapeHTML(goal.titulo)}</h1>
          ${goal.tagline ? `
            <div style="margin-top:var(--space-2xs)">
              <span class="eyebrow">Propósito</span>
              <p class="text-secondary" style="font-size:var(--fs-sm); font-style:italic;">&ldquo;${escapeHTML(goal.tagline)}&rdquo;</p>
            </div>` : ""}
        </div>
        <button type="button" class="icon-btn" aria-label="Editar objetivo" onclick="openEditObjetivoDetalle()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      </div>

      <div style="display:flex; align-items:center; gap:var(--space-lg);">
        <div class="hero__ring ${alcanzado ? "celebracion-anillo" : ""}" id="objetivoRing">
          <svg viewBox="0 0 100 100">
            <circle class="hero__ring-bg" cx="50" cy="50" r="42"/>
            <circle class="hero__ring-fg" cx="50" cy="50" r="42" style="--pct:${goal.porcentaje}"></circle>
          </svg>
          <div class="hero__ring-label">
            <span class="hero__ring-pct">${goal.porcentaje}%</span>
            <span class="hero__ring-text">${alcanzado ? "¡Listo! ✓" : "Completado"}</span>
          </div>
        </div>
        <div>
          <div style="font-family:var(--font-display); font-weight:var(--fw-semibold)">${pasosHechos} de ${totalPasos} pasos completados</div>
          <div class="hero__meta-item" style="margin-top:var(--space-2xs)"><span>Meta final</span><span>${ICONS.calendar}${escapeHTML(goal.metaFinal) || "Sin definir"}</span></div>
        </div>
      </div>
    </section>

    <section class="section fade-up" style="margin-top:var(--space-lg)">
      <div class="section__header">
        <h2 class="section__title">${ICONS.chevronRight} ¿Qué necesitás hacer para conseguirlo?</h2>
      </div>
      <div class="card">
        ${stepperHTML}
        <div style="border-top:1px solid var(--color-border-soft); margin-top:var(--space-sm); padding-top:var(--space-sm);">
          ${pasosListaHTML}
        </div>
        <button type="button" class="btn btn--ghost btn--sm btn--block" style="margin-top:var(--space-sm)" onclick="openNuevoHito()">${ICONS.plus} ¿Qué más necesitás hacer?</button>
      </div>
    </section>

    <section class="section fade-up" style="margin-top:var(--space-lg)">
      <div class="section__header">
        <h2 class="section__title">${ICONS.repeat} ¿Qué hábitos te van a ayudar a avanzar?</h2>
        <button type="button" class="card__link" style="background:none;border:none;cursor:pointer" onclick="openVincularHabito()">${ICONS.plus} Vincular hábito</button>
      </div>
      ${habitosHTML}
    </section>
  `;
}

function handleToggleHito(goalId, index) {
  const resultado = Store.toggleHito(goalId, index);
  renderDetalle();
  if (resultado && resultado.recienAlcanzado) {
    mostrarCelebracion(Store.getById("objetivos", goalId).titulo);
  }
}

function handleRemoveHito(goalId, index) {
  Store.removeHito(goalId, index);
  renderDetalle();
}

function handleEditarHito(goalId, index) {
  const goal = Store.getById("objetivos", goalId);
  const paso = goal && goal.hitos && goal.hitos[index];
  if (!paso) return;
  Modal.open({
    title: "Editar paso",
    fields: [{ key: "texto", label: "¿Qué necesitás hacer?", type: "text", required: true }],
    values: { texto: paso.texto },
    submitLabel: "Guardar",
    onSubmit: (values) => {
      Store.editHito(goalId, index, values.texto);
      renderDetalle();
    },
  });
}

function openNuevoHito() {
  const goalId = getGoalIdFromURL();
  Modal.open({
    title: "Nuevo paso",
    fields: [{ key: "texto", label: "¿Qué necesitás hacer para conseguirlo?", type: "text", required: true }],
    values: {},
    submitLabel: "Agregar",
    onSubmit: (values) => {
      Store.addHito(goalId, values.texto);
      renderDetalle();
    },
  });
}

function mostrarCelebracion(tituloObjetivo) {
  const banner = document.createElement("div");
  banner.className = "celebracion-banner";
  banner.innerHTML = `🎉 &nbsp;<strong>¡Objetivo alcanzado!</strong> Completaste todos los pasos de "${escapeHTML(tituloObjetivo)}".`;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add("is-visible"), 10);
  setTimeout(() => {
    banner.classList.remove("is-visible");
    setTimeout(() => banner.remove(), 400);
  }, 4000);

  if (typeof Notif !== "undefined") {
    Notif.notificarLogro(tituloObjetivo);
  }
}

function handleCambiarImportancia(goalId, habitId, importancia) {
  Store.updateHabitImportance(goalId, habitId, importancia);
  renderDetalle();
}

function handleDesvincularHabito(goalId, habitId) {
  Store.unlinkHabitFromGoal(goalId, habitId);
  renderDetalle();
}

function openVincularHabito() {
  const goalId = getGoalIdFromURL();
  const yaVinculados = new Set(Store.habitsForGoal(goalId).map((v) => v.habitoId));
  const disponibles = Store.list("habitos").filter((h) => !yaVinculados.has(h.id));

  if (!disponibles.length) {
    alert(Store.list("habitos").length
      ? "Ya vinculaste todos tus hábitos a este objetivo."
      : "Todavía no creaste ningún hábito — creá uno primero desde la sección Hábitos.");
    return;
  }

  Modal.open({
    title: "Vincular hábito",
    fields: [
      { key: "habitoId", label: "Hábito", type: "select", required: true, options: disponibles.map((h) => ({ value: h.id, label: h.nombre })) },
      {
        key: "importancia", label: "Importancia para este objetivo", type: "select",
        options: [
          { value: "principal", label: "Principal" },
          { value: "importante", label: "Importante" },
          { value: "complementario", label: "Complementario" },
        ],
      },
    ],
    values: { importancia: "importante" },
    submitLabel: "Vincular",
    onSubmit: (values) => {
      Store.linkHabitToGoal(goalId, values.habitoId, values.importancia);
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
      { key: "titulo", label: "¿Qué querés lograr?", type: "text", required: true },
      { key: "emoji", label: "Ícono / emoji", type: "text" },
      { key: "tagline", label: "¿Para qué querés lograrlo?", type: "textarea" },
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

window.addEventListener("lifeos:ready", renderDetalle);
