/**
 * LIFE OS — ui-helpers.js
 * -----------------------------------------------------------------------
 * Helpers compartidos por todos los render-*.js: set de íconos inline,
 * escape de HTML, y resolución de imagen real vs. gradiente de respaldo.
 * Se carga una sola vez, antes que cualquier script de página.
 */

const ICONS = {
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3.5 10h17"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19a1 1 0 0 1 1 1v15l-3-1.5-3 1.5-3-1.5-3 1.5-3-1.5V5.5Z"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 6.5c0-1.9-2.2-3.5-5-3.5s-5 1.4-5 3.3c0 4 10 1.9 10 5.9 0 2-2.2 3.3-5 3.3s-5-1.6-5-3.5"/></svg>',
  graduation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3.5 2.5 8l4 1.5M11 3.5 19.5 12l-4 4-3-5-3.5 3.5v3l-2-1v-3L5 12l1.5-2 4 1.5M11 3.5 12.5 12"/></svg>',
  heartPulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8.5c0-2.5-2-4.5-4.5-4.5-1.5 0-2.7.7-3.5 1.8C11.2 4.7 10 4 8.5 4 6 4 4 6 4 8.5c0 .7.1 1.3.4 1.9h3.1l1.5-2.5 2 5 1.5-2.9H19.6c.3-.6.4-1.3.4-2Z"/><path d="M4.4 10.4C5.6 13.5 9 16.8 12 19.5c3-2.7 6.4-6 7.6-9.1"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7v10"/><path d="M18 7v10"/><path d="M3 10v4"/><path d="M21 10v4"/><path d="M6 12h12"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 8-4-16-3 8H2"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a1 1 0 0 1 1-1h4.5l2 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>',
  diary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0 0 4h14"/></svg>',
};

function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ringSVG(pct) {
  return `
    <svg viewBox="0 0 60 60">
      <circle class="progress-ring__bg" cx="30" cy="30" r="26"/>
      <circle class="progress-ring__fg" cx="30" cy="30" r="26" style="--pct:${pct}"/>
    </svg>`;
}

function toCamel(s) {
  return (s || "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Devuelve <img> si hay foto real asociada, o un <div> con gradiente de respaldo. */
function thumbHTML(imgKey, seed, cls) {
  const img = imageOrGradient(imgKey, seed);
  if (img.type === "image") {
    return `<img class="${cls}" src="${img.value}" alt="">`;
  }
  return `<div class="${cls}" style="background:${img.value}"></div>`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
