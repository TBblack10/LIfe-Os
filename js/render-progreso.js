/**
 * LIFE OS — render-progreso.js
 * El XP y nivel mostrados son reales (Store). Los anillos por área
 * quedan estáticos en 0% en esta fase (no hay CRUD de categorías todavía).
 * Fase 1B: se agrega el progreso real por objetivo, calculado siempre
 * al vuelo con Store.calcularProgresoObjetivo (no se confía en un
 * valor cacheado, aunque también esté persistido).
 */
function renderXPBadge() {
  const el = document.getElementById("xpBadge");
  if (!el) return;
  el.innerHTML = `${ICONS.target}Nivel ${Store.nivel()} · ${Store.data().usuario.xpTotal} XP`;
}

function renderObjetivosProgreso() {
  const el = document.getElementById("objetivosProgresoLista");
  if (!el) return;
  const objetivos = Store.list("objetivos");
  if (!objetivos.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm)">Todavía no tenés objetivos activos. Cuando crees uno, vas a ver acá tu progreso real.</p>`;
    return;
  }
  el.innerHTML = objetivos.map((o) => {
    const pct = Store.calcularProgresoObjetivo(o.id);
    const tieneHabitos = (o.habitosVinculados || []).length > 0;
    return `
      <a href="objetivo-detalle.html?id=${o.id}" class="goal-row">
        ${thumbHTML(o.imagen, o.titulo, "goal-row__thumb")}
        <div class="goal-row__body">
          <div class="goal-row__title-row">
            <span class="goal-row__title">${escapeHTML(o.titulo)}</span>
            <span class="goal-row__percent">${pct}%</span>
          </div>
          <div class="progress progress--thin"><div class="progress__fill" style="--value:${pct}%"></div></div>
          ${tieneHabitos ? "" : `<span class="text-tertiary" style="font-size:var(--fs-2xs)">Sin hábitos vinculados</span>`}
        </div>
        <span class="goal-row__chevron">${ICONS.chevronRight}</span>
      </a>`;
  }).join("");
}

window.addEventListener("lifeos:ready", renderXPBadge);
window.addEventListener("lifeos:ready", renderObjetivosProgreso);
window.addEventListener("lifeos:ready", renderObjetivosAlcanzados);

function renderObjetivosAlcanzados() {
  const el = document.getElementById("objetivosAlcanzadosLista");
  if (!el) return;
  const alcanzados = Store.objetivosAlcanzados();
  if (!alcanzados.length) {
    el.innerHTML = `<p class="text-tertiary" style="padding:var(--space-sm)">Todavía no alcanzaste ningún objetivo — cuando completes todos los pasos de uno, va a aparecer acá.</p>`;
    return;
  }
  el.innerHTML = alcanzados.map((o) => `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-sm); padding:var(--space-xs) 0;">
      <div style="display:flex; align-items:center; gap:var(--space-2xs)">
        <span style="font-size:18px">${o.emoji || "🎯"}</span>
        <span style="font-size:var(--fs-sm); font-weight:var(--fw-medium)">${escapeHTML(o.titulo)}</span>
      </div>
      <span class="text-tertiary" style="font-size:var(--fs-2xs)">${fmtDate(o.fechaAlcanzado)}</span>
    </div>
  `).join("");
}
