/**
 * LIFE OS — render-objetivos.js
 * Listado completo de objetivos con próximo paso, crear/editar/borrar.
 */

function renderObjetivosLista() {
  const objetivos = Store.list("objetivos");
  const el = document.getElementById("objetivosLista");
  if (!objetivos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-md)">Todavía no creaste ningún objetivo.</p>`;
    return;
  }
  el.innerHTML = objetivos.map((o) => `
    <div class="goal-row goal-row--full" style="cursor:pointer" onclick="location.href='objetivo-detalle.html?id=${o.id}'">
      ${thumbHTML(o.imagen, o.titulo, "goal-row__thumb")}
      <div class="goal-row__body">
        <div class="goal-row__title-row">
          <span class="goal-row__title">${o.emoji ? o.emoji + " " : ""}${escapeHTML(o.titulo)}</span>
          <span class="goal-row__percent">${o.porcentaje}%</span>
        </div>
        <div class="progress progress--thin"><div class="progress__fill" style="--value:${o.porcentaje}%"></div></div>
      </div>
      <div class="goal-row__next">
        <span class="goal-row__next-label">Próximo paso</span>
        <span class="goal-row__next-value">${escapeHTML(o.proximoPaso) || "Sin definir"}</span>
      </div>
      <span class="goal-row__chevron">${ICONS.chevronRight}</span>
    </div>
  `).join("");
}

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
      renderObjetivosLista();
    },
  });
}

document.addEventListener("DOMContentLoaded", renderObjetivosLista);
