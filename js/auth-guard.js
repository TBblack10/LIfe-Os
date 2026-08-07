/**
 * LIFE OS — auth-guard.js
 * -----------------------------------------------------------------------
 * Protege cada página. A diferencia de la versión anterior (chequeo
 * instantáneo), confirmar la sesión con Firebase toma un instante — por
 * eso ocultamos el documento hasta tener la respuesta, para no mostrar
 * ni una página protegida sin sesión, ni un parpadeo raro.
 */
(function () {
  document.documentElement.style.visibility = "hidden";

  Auth.onReady((user) => {
    if (!user) {
      window.location.replace("login.html");
      return;
    }
    document.documentElement.style.visibility = "visible";
  });

  // Red de seguridad: si por lo que sea Firebase nunca responde
  // (ej. sin conexión y sin config), no dejamos la página en blanco
  // para siempre.
  setTimeout(() => {
    if (document.documentElement.style.visibility === "hidden") {
      document.documentElement.style.visibility = "visible";
    }
  }, 4000);
})();
