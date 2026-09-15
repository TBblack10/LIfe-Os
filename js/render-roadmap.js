/**
 * LIFE OS — render-roadmap.js
 * El hero se conecta al objetivo principal real (Store). El stepper de
 * etapas queda estático en esta fase (no forma parte del CRUD actual).
 */
function renderHeroRoadmap() {
  const goal = Store.objetivoPrincipal();
  const el = document.getElementById("heroSection");
  if (!goal) {
    el.innerHTML = `<div class="card" style="text-align:center; padding:var(--space-2xl)">
      <span class="icon-lg" style="display:inline-flex; color:var(--color-accent-strong)">${ICONS.target}</span>
      <p style="margin-top:var(--space-xs); font-family:var(--font-display); font-weight:var(--fw-semibold)">Empezá a construir tu Life OS</p>
      <p class="text-secondary" style="margin-top:var(--space-3xs)">Todavía no tenés un Objetivo Estrella.<br>Elegí una meta importante y empezá a construir el camino hacia ella.</p>
      <a href="objetivos.html" class="btn btn--accent btn--sm" style="margin-top:var(--space-sm)">Crear mi Objetivo Estrella</a>
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
    </div>
  `;
}
window.addEventListener("lifeos:ready", renderHeroRoadmap);
