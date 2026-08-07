/**
 * LIFE OS — session-ui.js
 * -----------------------------------------------------------------------
 * Conecta la sesión real (Auth) con el avatar del topbar y el botón de
 * "Cerrar sesión" del sidebar. Espera tanto a que el DOM esté listo
 * como a que Firebase confirme la sesión (Auth.onReady) — ninguna de
 * las dos cosas está garantizada primero.
 */
function initSessionUI() {
  const user = Auth.currentUser();

  if (user) {
    const avatarImg = document.getElementById("topbarAvatarImg");
    const avatarLink = document.getElementById("topbarAvatar");
    if (avatarImg && user.picture) {
      avatarImg.src = user.picture;
      avatarImg.alt = user.name || "Tu cuenta";
    }
    if (avatarLink) {
      avatarLink.title = user.name || user.email || "";
    }
  }

  const signoutBtn = document.getElementById("signoutBtn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(() => initSessionUI());
});
