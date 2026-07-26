/**
 * LIFE OS — render-ajustes.js
 * Perfil real (nombre editable) + borrado completo de datos.
 */
function renderAjustes() {
  const u = Store.data().usuario;
  document.getElementById("ajustesNombre").textContent = u.nombre || "Tu nombre";
  document.getElementById("ajustesNivel").textContent = `Nivel ${Store.nivel()} · ${u.xpTotal} XP`;
}

function openEditarPerfil() {
  const u = Store.data().usuario;
  Modal.open({
    title: "Editar perfil",
    fields: [{ key: "nombre", label: "Tu nombre", type: "text", placeholder: "¿Cómo te llamás?" }],
    values: u,
    submitLabel: "Guardar",
    onSubmit: (values) => {
      Store.data().usuario.nombre = values.nombre;
      Store.save();
      renderAjustes();
    },
  });
}

function handleResetData() {
  if (confirm("Esto borra TODOS tus objetivos, hábitos, proyectos y entradas de diario, sin vuelta atrás. ¿Seguro?")) {
    Store.reset();
    renderAjustes();
    alert("Listo, tus datos se reiniciaron a los valores de ejemplo.");
  }
}

document.addEventListener("DOMContentLoaded", renderAjustes);
