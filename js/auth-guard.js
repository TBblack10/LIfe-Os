/**
 * LIFE OS — auth-guard.js
 * -----------------------------------------------------------------------
 * Protege cada página, y desde la integración con Firestore también
 * espera a que Sync.hydrate() traiga los datos de la nube ANTES de que
 * los render-*.js pinten algo.
 *
 * Detalle importante (encontrado auditando esto, no algo obvio):
 * confirmar la sesión con Firebase implica consultar IndexedDB, que es
 * asíncrono a nivel de "tarea" del navegador — NO hay garantía de que
 * eso termine antes de que dispare `DOMContentLoaded`. Si los
 * render-*.js siguieran escuchando `DOMContentLoaded` directo, podrían
 * pintar con datos viejos antes de que la hidratación termine, sin que
 * nada los vuelva a pintar después.
 *
 * Por eso los render-*.js escuchan un evento propio, `lifeos:ready`,
 * que este archivo dispara recién cuando se cumplen AMBAS condiciones:
 * el DOM está listo Y los datos ya están hidratados. Es el único punto
 * de la app que conoce la existencia de Firestore.
 */
(function () {
  document.documentElement.style.visibility = "hidden";

  let domReady = false;
  let hydrated = false;
  let revealed = false;

  function revealIfReady() {
    if (revealed || !domReady || !hydrated) return;
    revealed = true;
    document.documentElement.style.visibility = "visible";
    window.dispatchEvent(new Event("lifeos:ready"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    domReady = true;
    revealIfReady();
  });

  Auth.onReady(async (user) => {
    if (!user) {
      window.location.replace("login.html");
      return;
    }
    if (typeof Sync !== "undefined") {
      await Sync.hydrate(user.uid);
    }
    hydrated = true;
    revealIfReady();
  });

  // Red de seguridad: si por lo que sea Firebase/Firestore nunca
  // responden (ej. sin conexión), no dejamos la página en blanco para
  // siempre — se sigue con lo que haya en localStorage.
  setTimeout(() => {
    if (!revealed) {
      revealed = true;
      document.documentElement.style.visibility = "visible";
      window.dispatchEvent(new Event("lifeos:ready"));
    }
  }, 6000);
})();
