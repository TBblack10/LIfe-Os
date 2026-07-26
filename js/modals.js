/**
 * LIFE OS — modals.js
 * -----------------------------------------------------------------------
 * Motor genérico de modales para crear/editar/borrar cualquier entidad
 * (objetivos, hábitos, proyectos, diario, tareas). Un solo overlay se
 * inyecta una vez en el <body> y se reutiliza — no hay HTML de modal
 * duplicado en cada página.
 *
 * Uso:
 *   Modal.open({
 *     title: "Nuevo objetivo",
 *     fields: [
 *       { key: "titulo", label: "Título", type: "text", required: true },
 *       { key: "porcentaje", label: "Progreso (%)", type: "number" },
 *     ],
 *     values: { titulo: "", porcentaje: 0 },   // valores actuales (o vacíos)
 *     submitLabel: "Crear objetivo",
 *     onSubmit: (values) => { ... },
 *     onDelete: null,                           // función opcional -> muestra botón borrar
 *   });
 */

const Modal = {
  _overlay: null,

  _ensureRoot() {
    if (this._overlay) return this._overlay;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modalOverlay";
    overlay.innerHTML = `<div class="modal" role="dialog" aria-modal="true"></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) this.close();
    });

    this._overlay = overlay;
    return overlay;
  },

  open({ title, fields, values = {}, submitLabel = "Guardar", onSubmit, onDelete = null, deleteLabel = "Eliminar" }) {
    const overlay = this._ensureRoot();
    const modal = overlay.querySelector(".modal");

    const fieldHTML = fields
      .map((f) => {
        const val = values[f.key] ?? "";
        const req = f.required ? "required" : "";
        if (f.type === "textarea") {
          return `
            <div class="form-field">
              <label for="mf_${f.key}">${f.label}</label>
              <textarea id="mf_${f.key}" name="${f.key}" ${req} placeholder="${f.placeholder || ""}">${escapeHTML(val)}</textarea>
            </div>`;
        }
        return `
          <div class="form-field">
            <label for="mf_${f.key}">${f.label}</label>
            <input
              id="mf_${f.key}"
              name="${f.key}"
              type="${f.type || "text"}"
              ${req}
              ${f.min !== undefined ? `min="${f.min}"` : ""}
              ${f.max !== undefined ? `max="${f.max}"` : ""}
              placeholder="${f.placeholder || ""}"
              value="${escapeHTML(val)}"
            >
          </div>`;
      })
      .join("");

    modal.innerHTML = `
      <div class="modal__header">
        <span class="modal__title">${title}</span>
        <button type="button" class="icon-btn modal__close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6 18 18"/><path d="M18 6 6 18"/></svg>
        </button>
      </div>
      <form class="modal__form" novalidate>
        ${fieldHTML}
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-action="cancel">Cancelar</button>
          <button type="submit" class="btn btn--accent">${submitLabel}</button>
        </div>
        ${onDelete ? `
        <div class="modal__delete">
          <button type="button" class="btn btn--ghost btn--block" data-action="delete" style="color:var(--color-danger)">${deleteLabel}</button>
        </div>` : ""}
      </form>
    `;

    modal.querySelector(".modal__close").addEventListener("click", () => this.close());
    modal.querySelector('[data-action="cancel"]').addEventListener("click", () => this.close());

    const form = modal.querySelector(".modal__form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const out = {};
      fields.forEach((f) => {
        const el = form.querySelector(`[name="${f.key}"]`);
        out[f.key] = f.type === "number" ? Number(el.value || 0) : el.value.trim();
      });
      onSubmit(out);
      this.close();
    });

    if (onDelete) {
      modal.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (confirm("¿Seguro que querés eliminar esto? No se puede deshacer.")) {
          onDelete();
          this.close();
        }
      });
    }

    overlay.classList.add("is-open");
    const firstInput = modal.querySelector("input, textarea");
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  },

  close() {
    if (this._overlay) this._overlay.classList.remove("is-open");
  },
};

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
