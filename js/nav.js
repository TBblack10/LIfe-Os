/**
 * LIFE OS — nav.js
 * -----------------------------------------------------------------------
 * Única pieza de JavaScript de esta fase del proyecto. No contiene
 * lógica de negocio ni maneja datos: solo abre/cierra el drawer de
 * navegación en pantallas mobile/tablet.
 *
 * El resto de la interactividad (checkboxes de tareas/hábitos, barras de
 * progreso, etc.) se apoya en HTML + CSS puro (ver checklist-item y
 * progress-bar) y queda lista para conectarse a lógica real más adelante.
 */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("drawerOverlay");
  const toggleBtn = document.getElementById("menuToggle");

  if (!sidebar || !overlay || !toggleBtn) return;

  const openDrawer = () => {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  const closeDrawer = () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("is-open");
    isOpen ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
});
