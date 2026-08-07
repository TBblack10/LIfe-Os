/**
 * LIFE OS — guest-guard.js
 * Lo opuesto a auth-guard.js: se usa en login.html/register.html. Si ya
 * hay sesión, manda directo a Inicio en vez de mostrar el login de nuevo.
 */
(function () {
  Auth.onReady((user) => {
    if (user) {
      window.location.replace("index.html");
    }
  });
})();
