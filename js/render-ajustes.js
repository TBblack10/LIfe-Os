/**
 * LIFE OS — render-ajustes.js
 * Muestra la cuenta de Google real conectada + borrado de datos.
 * El nombre/foto ya no se editan a mano: vienen de la sesión de Google.
 */
function renderAjustes() {
  const user = Auth.currentUser();
  const cuentaEl = document.getElementById("ajustesCuenta");

  if (user) {
    cuentaEl.innerHTML = `
      <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid var(--color-accent-border); flex-shrink:0;">
        <img src="${user.picture}" alt="${escapeHTML(user.name)}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div>
        <div style="font-weight:var(--fw-semibold)">${escapeHTML(user.name)}</div>
        <div class="text-tertiary" style="font-size:var(--fs-sm)">${escapeHTML(user.email)}</div>
      </div>`;
  } else {
    cuentaEl.innerHTML = `<p class="text-tertiary">No se encontró información de la cuenta.</p>`;
  }

  document.getElementById("ajustesNivel").textContent = `Nivel ${Store.nivel()} · ${Store.data().usuario.xpTotal} XP`;
}

function handleResetData() {
  if (confirm("Esto borra TODOS tus objetivos, hábitos, proyectos y entradas de diario, sin vuelta atrás. ¿Seguro?")) {
    Store.reset();
    renderAjustes();
    alert("Listo, tus datos se reiniciaron a los valores de ejemplo.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(() => renderAjustes());
});
