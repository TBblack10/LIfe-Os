/**
 * LIFE OS — render-progreso.js
 * El XP y nivel mostrados son reales (Store). Los anillos por área
 * quedan estáticos en 0% en esta fase (no hay CRUD de categorías todavía).
 */
function renderXPBadge() {
  const el = document.getElementById("xpBadge");
  if (!el) return;
  el.innerHTML = `${ICONS.target}Nivel ${Store.nivel()} · ${Store.data().usuario.xpTotal} XP`;
}
document.addEventListener("DOMContentLoaded", renderXPBadge);
