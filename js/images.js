/**
 * LIFE OS — images.js
 * -----------------------------------------------------------------------
 * Mismas URLs reales de Unsplash que usa el HTML estático (ver
 * build/images.py), disponibles para el render dinámico. Los objetivos y
 * proyectos que el usuario crea desde la app no tienen foto: se les asigna
 * un color de fondo en su lugar (ver helper `hasRealImage` / `gradientFor`).
 */

const IMAGES = {
  hero_noruega: "https://images.unsplash.com/photo-1513348363826-2aa8aac7c372?auto=format&fit=crop&w=1800&q=75",
  goal_ingles: "https://images.unsplash.com/photo-1769794371055-54436b54577e?auto=format&fit=crop&w=1600&q=75",
  goal_maraton: "https://images.unsplash.com/photo-1740226174487-90feffd82dda?auto=format&fit=crop&w=1600&q=75",
  goal_fisico: "https://images.unsplash.com/photo-1761839258420-5c3e2f2e2a74?auto=format&fit=crop&w=1600&q=75",
  goal_ahorro: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?auto=format&fit=crop&w=1600&q=75",
  goal_negocio: "https://images.unsplash.com/photo-1746792613213-c154e2891449?auto=format&fit=crop&w=1600&q=75",
  project_goodservice: "https://images.unsplash.com/photo-1727101981835-50bade3c4eaf?auto=format&fit=crop&w=1600&q=75",
  project_tejiendo: "https://images.unsplash.com/photo-1714922938267-befc65aad0cf?auto=format&fit=crop&w=1600&q=75",
  project_sistema: "https://images.unsplash.com/photo-1759661881353-5b9cc55e1cf4?auto=format&fit=crop&w=1600&q=75",
  project_remax: "https://images.unsplash.com/photo-1758448756207-54505680d130?auto=format&fit=crop&w=1600&q=75",
  quote_bg: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=900&q=75"
};

// Paleta de respaldo para tarjetas de objetivos/proyectos creados por el
// usuario, que no tienen una foto real asociada.
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #3b2f7a, #1a1330)",
  "linear-gradient(135deg, #1f4a35, #0e1a14)",
  "linear-gradient(135deg, #5c2340, #1a0f14)",
  "linear-gradient(135deg, #233a5c, #0f1620)",
  "linear-gradient(135deg, #5c3a23, #201510)",
];

function imageOrGradient(key, seedForColor) {
  if (key && IMAGES[key]) return { type: "image", value: IMAGES[key] };
  const idx = Math.abs(hashCode(seedForColor || "x")) % FALLBACK_GRADIENTS.length;
  return { type: "gradient", value: FALLBACK_GRADIENTS[idx] };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
