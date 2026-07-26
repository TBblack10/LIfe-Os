/**
 * LIFE OS — render-habitos.js
 * Listado completo de hábitos: marcar hecho hoy (con racha real),
 * crear, editar, borrar.
 */

function renderHabitosLista() {
  const habitos = Store.list("habitos");
  const el = document.getElementById("habitosLista");
  if (!habitos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-md)">Todavía no creaste ningún hábito.</p>`;
    return;
  }
  el.innerHTML = habitos.map((h) => {
    const doneHoy = Store.isHabitDoneToday(h.id);
    const dias = Store.habitLast6Days(h.id);
    const dots = dias.map((d) => `<span class="habit-row__day ${d ? "is-done" : ""}"></span>`).join("");
    return `
      <div class="habit-row">
        <label class="checklist-item" style="padding:0">
          <input type="checkbox" ${doneHoy ? "checked" : ""} onchange="handleToggleHabitoLista('${h.id}')">
          <span class="checklist-item__box"></span>
        </label>
        <span class="habit-row__icon">${ICONS[toCamel(h.icono)] || ICONS.target}</span>
        <div class="habit-row__body">
          <div class="habit-row__name">${escapeHTML(h.nombre)}</div>
          <div class="habit-row__streak">Racha: ${Store.habitStreak(h.id)} días</div>
        </div>
        <div class="habit-row__days">${dots}</div>
        <button type="button" class="icon-btn" aria-label="Editar hábito" onclick="openEditHabito('${h.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      </div>`;
  }).join("");
}

function handleToggleHabitoLista(habitId) {
  Store.toggleHabitToday(habitId);
  renderHabitosLista();
}

function openNuevoHabito() {
  Modal.open({
    title: "Nuevo hábito",
    fields: [
      { key: "nombre", label: "¿Qué querés repetir?", type: "text", required: true, placeholder: "Ej: Salir a caminar" },
      { key: "icono", label: "Ícono", type: "text", placeholder: "book, target, activity, heart-pulse..." },
    ],
    values: { icono: "target" },
    submitLabel: "Crear hábito",
    onSubmit: (values) => {
      Store.create("habitos", { nombre: values.nombre, icono: values.icono || "target", completions: [] });
      renderHabitosLista();
    },
  });
}

function openEditHabito(habitId) {
  const h = Store.getById("habitos", habitId);
  if (!h) return;
  Modal.open({
    title: "Editar hábito",
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "icono", label: "Ícono", type: "text" },
    ],
    values: h,
    submitLabel: "Guardar cambios",
    onSubmit: (values) => {
      Store.update("habitos", habitId, values);
      renderHabitosLista();
    },
    onDelete: () => {
      Store.remove("habitos", habitId);
      renderHabitosLista();
    },
  });
}

document.addEventListener("DOMContentLoaded", renderHabitosLista);
