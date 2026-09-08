/**
 * LIFE OS — render-ajustes.js
 * Muestra la cuenta de Google real conectada, notificaciones (V1) y
 * borrado de datos. El nombre/foto ya no se editan a mano: vienen de
 * la sesión de Google.
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

  renderNotifCard();
}

function renderNotifCard() {
  const el = document.getElementById("ajustesNotifContenido");
  if (!el || typeof Notif === "undefined") return;

  if (!Notif.soportado()) {
    el.innerHTML = `<p class="text-tertiary" style="font-size:var(--fs-sm)">Tu navegador no soporta notificaciones.</p>`;
    return;
  }

  const prefs = Notif.getPrefs();
  const permiso = Notif.permisoActual();

  if (permiso === "denied") {
    el.innerHTML = `<p class="text-tertiary" style="font-size:var(--fs-sm)">Bloqueaste las notificaciones para Life OS en la configuración del navegador. Para activarlas, cambiá el permiso del sitio manualmente y volvé a esta pantalla.</p>`;
    return;
  }

  el.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-sm)">
      <div>
        <div style="font-size:var(--fs-sm); font-weight:var(--fw-medium)">Recordatorios activados</div>
        <div class="text-tertiary" style="font-size:var(--fs-2xs)">Solo mientras tengas esta pestaña abierta.</div>
      </div>
      <label style="position:relative; display:inline-block; width:44px; height:24px;">
        <input type="checkbox" id="notifToggle" ${prefs.activo ? "checked" : ""} style="opacity:0; width:0; height:0;">
        <span id="notifToggleTrack" style="position:absolute; inset:0; background-color:${prefs.activo ? "var(--color-accent-strong)" : "var(--color-border)"}; border-radius:999px; transition: background-color .2s; cursor:pointer;"></span>
      </label>
    </div>
    <div class="form-field">
      <label for="notifHorario">Horario del recordatorio de hábitos</label>
      <input type="time" id="notifHorario" value="${prefs.horario || "09:00"}">
    </div>
    <p class="text-tertiary" style="font-size:var(--fs-2xs); margin-top:var(--space-2xs)">
      Solo te avisamos por los hábitos que todavía no llegaron a su cuota de la semana — si ya la cumpliste, no hay recordatorio.
    </p>
  `;

  const toggle = document.getElementById("notifToggle");
  const track = document.getElementById("notifToggleTrack");
  const horarioInput = document.getElementById("notifHorario");

  toggle.addEventListener("change", async () => {
    if (toggle.checked) {
      const ok = await Notif.activar(horarioInput.value);
      if (!ok) {
        toggle.checked = false;
        alert("No se pudo activar — revisá el permiso de notificaciones del navegador.");
        return;
      }
    } else {
      Notif.desactivar();
    }
    track.style.backgroundColor = toggle.checked ? "var(--color-accent-strong)" : "var(--color-border)";
  });

  horarioInput.addEventListener("change", () => {
    if (Notif.getPrefs().activo) {
      Notif.savePrefs({ activo: true, horario: horarioInput.value });
    }
  });
}

function handleResetData() {
  if (confirm("Esto borra TODOS tus objetivos, hábitos, proyectos y entradas de diario, sin vuelta atrás. ¿Seguro?")) {
    Store.reset();
    renderAjustes();
    alert("Listo, tus datos se reiniciaron a los valores de ejemplo.");
  }
}

window.addEventListener("lifeos:ready", renderAjustes);
