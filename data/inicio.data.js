/**
 * LIFE OS — Datos de la página Inicio
 * -----------------------------------------------------------------------
 * Esta versión del proyecto no tiene backend ni lógica JS activa: todo el
 * contenido está hardcodeado directamente en cada .html, arrancando desde
 * un estado vacío (cuenta nueva, sin progreso).
 *
 * El XP se sigue acumulando conceptualmente por cada tarea, hábito o
 * misión completada (ver `xpTotal`), pero ya no se muestra en cada
 * interacción — vive de forma discreta en la página Progreso.
 *
 * Este archivo deja la información ya estructurada como datos, para que
 * en la próxima fase (JS/backend) el HTML pueda generarse a partir de
 * este objeto. No se importa todavía en ninguna página.
 */

const inicioData = {
  usuario: {
    nombre: "",
    nivel: 1,
    xpTotal: 0,
    xpSiguienteNivel: 1000,
  },

  objetivoPrincipal: {
    titulo: "Vivir en Noruega",
    bandera: "🇳🇴",
    tagline: "Construyendo paso a paso la vida que quiero.",
    porcentaje: 0,
    proximoPaso: null,
    metaFinal: null,
    imagen: "https://images.unsplash.com/photo-1513348363826-2aa8aac7c372?auto=format&fit=crop&w=1800&q=75",
  },

  hoy: {
    tareas: [],
    habitos: [],
    entrenamiento: null,
    estudio: null,
  },

  objetivos: [
    { titulo: "Vivir en Noruega", porcentaje: 0, proximoPaso: null, imagen: "hero_noruega" },
    { titulo: "Aprender inglés", porcentaje: 0, proximoPaso: null, imagen: "goal_ingles" },
    { titulo: "Correr maratón", porcentaje: 0, proximoPaso: null, imagen: "goal_maraton" },
    { titulo: "Mejorar físico", porcentaje: 0, proximoPaso: null, imagen: "goal_fisico" },
    { titulo: "Ahorrar dinero", porcentaje: 0, proximoPaso: null, imagen: "goal_ahorro" },
    { titulo: "Crear negocio online", porcentaje: 0, proximoPaso: null, imagen: "goal_negocio" },
  ],

  roadmap: [
    { etapa: "Base de inglés", porcentaje: 0 },
    { etapa: "Fondo de ahorro", porcentaje: 0 },
    { etapa: "Certificación", porcentaje: 0 },
    { etapa: "Visa", porcentaje: 0 },
    { etapa: "Noruega", porcentaje: 0 },
  ],

  progreso: [
    { area: "Inglés", porcentaje: 0 },
    { area: "Salud", porcentaje: 0 },
    { area: "Finanzas", porcentaje: 0 },
    { area: "Trabajo", porcentaje: 0 },
    { area: "Aprendizaje", porcentaje: 0 },
  ],

  habitos: [
    { nombre: "Leer 10 páginas", rachaDias: 0, dias: [false, false, false, false, false, false] },
    { nombre: "Meditar 10 minutos", rachaDias: 0, dias: [false, false, false, false, false, false] },
    { nombre: "Tomar 2L de agua", rachaDias: 0, dias: [false, false, false, false, false, false] },
    { nombre: "Dormir 8 horas", rachaDias: 0, dias: [false, false, false, false, false, false] },
    { nombre: "Caminar 10.000 pasos", rachaDias: 0, dias: [false, false, false, false, false, false] },
  ],

  proyectos: [
    { titulo: "Good Service", porcentaje: 0, tareas: "0/0 tareas", imagen: "project_goodservice" },
    { titulo: "Tejiendo Sueños", porcentaje: 0, tareas: "0/0 tareas", imagen: "project_tejiendo" },
    { titulo: "Sistema Personal", porcentaje: 0, tareas: "0/0 tareas", imagen: "project_sistema" },
    { titulo: "Proyecto Remax", porcentaje: 0, tareas: "0/0 tareas", imagen: "project_remax" },
  ],
};

// Preparado para exportarse cuando el proyecto empiece a usar módulos JS:
// export default inicioData;
