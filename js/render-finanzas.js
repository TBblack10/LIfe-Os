/**
 * LIFE OS — render-finanzas.js
 * Muestra el objetivo de ahorro (marcado con esFinanzas en el store)
 * y permite editarlo. Sección placeholder por decisión de producto:
 * no es prioridad de desarrollo en esta fase.
 */

function renderFinanzas() {
  const goal = Store.objetivoFinanzas();
  const el = document.getElementById("finanzasContenido");

  if (!goal) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm)">Todavía no configuraste una meta de ahorro.</p>
      <button type="button" class="btn btn--accent btn--sm" onclick="crearMetaFinanzas()">Crear meta de ahorro</button>`;
    return;
  }

  el.innerHTML = `
    <div class="goal-row goal-row--full" style="cursor:pointer" onclick="openEditFinanzas('${goal.id}')">
      ${thumbHTML(goal.imagen, goal.titulo, "goal-row__thumb")}
      <div class="goal-row__body">
        <div class="goal-row__title-row">
          <span class="goal-row__title">${ICONS.dollar} ${escapeHTML(goal.titulo)}</span>
          <span class="goal-row__percent">${goal.porcentaje}%</span>
        </div>
        <div class="progress progress--thin"><div class="progress__fill" style="--value:${goal.porcentaje}%"></div></div>
      </div>
      <div class="goal-row__next">
        <span class="goal-row__next-label">Próximo paso</span>
        <span class="goal-row__next-value">${escapeHTML(goal.proximoPaso) || "Sin definir"}</span>
      </div>
      <span class="goal-row__chevron">${ICONS.chevronRight}</span>
    </div>
  `;
}

function openEditFinanzas(goalId) {
  const goal = Store.getById("objetivos", goalId);
  if (!goal) return;
  Modal.open({
    title: "Editar meta de ahorro",
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "porcentaje", label: "Progreso (%)", type: "number", min: 0, max: 100 },
      { key: "proximoPaso", label: "Próximo paso", type: "text" },
      { key: "metaFinal", label: "Meta final", type: "text" },
    ],
    values: goal,
    submitLabel: "Guardar cambios",
    onSubmit: (values) => {
      Store.update("objetivos", goalId, values);
      renderFinanzas();
    },
  });
}

function crearMetaFinanzas() {
  Store.create("objetivos", {
    titulo: "Ahorrar dinero", emoji: "💰", porcentaje: 0, proximoPaso: "", metaFinal: "",
    imagen: "goal_ahorro", esPrincipal: false, esFinanzas: true, hitos: [],
  });
  renderFinanzas();
}

document.addEventListener("DOMContentLoaded", renderFinanzas);
