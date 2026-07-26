/**
 * LIFE OS — render-diario.js
 * Listado de entradas (más nuevas primero), crear/editar/borrar.
 */

function renderDiarioLista() {
  const entradas = [...Store.list("diario")].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const el = document.getElementById("diarioLista");

  if (!entradas.length) {
    el.innerHTML = `
      <div class="empty-state fade-up" style="grid-column: 1 / -1">
        ${ICONS.diary}
        <span class="empty-state__title">Todavía no hay entradas</span>
        <p class="empty-state__text">Escribí tu primera reflexión del día para empezar a construir tu historial.</p>
        <button type="button" class="btn btn--accent btn--sm" style="margin-top:var(--space-2xs)" onclick="openNuevaEntrada()">Nueva entrada</button>
      </div>`;
    return;
  }

  el.innerHTML = entradas.map((e) => `
    <div class="card journal-entry" onclick="openEditEntrada('${e.id}')">
      <span class="journal-entry__date">${ICONS.calendar}${fmtDate(e.fecha)}</span>
      <p class="journal-entry__text">${escapeHTML(e.texto)}</p>
    </div>
  `).join("");
}

function openNuevaEntrada() {
  const hoy = new Date().toISOString().slice(0, 10);
  Modal.open({
    title: "Nueva entrada",
    fields: [
      { key: "fecha", label: "Fecha", type: "date", required: true },
      { key: "texto", label: "¿Cómo va el camino hoy?", type: "textarea", required: true, placeholder: "Escribí lo que quieras..." },
    ],
    values: { fecha: hoy },
    submitLabel: "Guardar entrada",
    onSubmit: (values) => {
      Store.create("diario", values);
      renderDiarioLista();
    },
  });
}

function openEditEntrada(entryId) {
  const e = Store.getById("diario", entryId);
  if (!e) return;
  Modal.open({
    title: "Editar entrada",
    fields: [
      { key: "fecha", label: "Fecha", type: "date", required: true },
      { key: "texto", label: "Texto", type: "textarea", required: true },
    ],
    values: e,
    submitLabel: "Guardar cambios",
    onSubmit: (values) => {
      Store.update("diario", entryId, values);
      renderDiarioLista();
    },
    onDelete: () => {
      Store.remove("diario", entryId);
      renderDiarioLista();
    },
  });
}

document.addEventListener("DOMContentLoaded", renderDiarioLista);
