/**
 * LIFE OS — render-proyectos.js
 * Grilla de proyectos con foto (o gradiente de respaldo si el usuario
 * no cargó imagen). Crear / editar / borrar vía modal.
 */

function renderProyectosGrid() {
  const proyectos = Store.list("proyectos");
  const el = document.getElementById("proyectosGrid");
  const cards = proyectos.map((p) => {
    const bg = thumbHTML(p.imagen, p.titulo, "project-card__bg");
    return `
      <div class="project-card" style="cursor:pointer" onclick="openEditProyecto('${p.id}')">
        ${bg}
        <span class="project-card__eyebrow">${escapeHTML(p.titulo)}</span>
        <div class="project-card__progress-row"><span class="project-card__percent">${p.porcentaje}%</span></div>
        <span class="project-card__meta">${p.tareasHechas}/${p.tareasTotal} tareas</span>
        <div class="progress progress--thin"><div class="progress__fill" style="--value:${p.porcentaje}%"></div></div>
      </div>`;
  }).join("");

  const addCard = `
    <button type="button" class="card-add" onclick="openNuevoProyecto()" style="border:1.5px dashed var(--color-border); width:100%">
      ${ICONS.plus}<span>Nuevo proyecto</span>
    </button>`;

  el.innerHTML = cards + addCard;
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
      renderProyectosGrid();
    },
  });
}

function openEditProyecto(projectId) {
  const p = Store.getById("proyectos", projectId);
  if (!p) return;
  Modal.open({
    title: "Editar proyecto",
    fields: [
      { key: "titulo", label: "Título", type: "text", required: true },
      { key: "descripcion", label: "Descripción", type: "textarea" },
      { key: "porcentaje", label: "Progreso (%)", type: "number", min: 0, max: 100 },
      { key: "tareasTotal", label: "Tareas totales", type: "number", min: 0 },
      { key: "tareasHechas", label: "Tareas completadas", type: "number", min: 0 },
    ],
    values: p,
    submitLabel: "Guardar cambios",
    onSubmit: (values) => {
      Store.update("proyectos", projectId, values);
      renderProyectosGrid();
    },
    onDelete: () => {
      Store.remove("proyectos", projectId);
      renderProyectosGrid();
    },
  });
}

document.addEventListener("DOMContentLoaded", renderProyectosGrid);
