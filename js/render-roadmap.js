/**
 * LIFE OS — render-roadmap.js
 * El hero se conecta al objetivo principal real (Store). El stepper de
 * etapas queda estático en esta fase (no forma parte del CRUD actual).
 */
function renderHeroRoadmap() {
  const goal = Store.objetivoPrincipal();
  const el = document.getElementById("heroSection");
  if (!goal) return;
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
    </div>
  `;
}
document.addEventListener("DOMContentLoaded", renderHeroRoadmap);
