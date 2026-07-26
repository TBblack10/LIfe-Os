/**
 * LIFE OS — render-auth.js
 * -----------------------------------------------------------------------
 * No hay backend ni autenticación real todavía. Esto es una simulación
 * honesta: "registrarte" guarda tu nombre en el Store local (el mismo
 * que usa toda la app) y te lleva a Inicio. "Iniciar sesión" simplemente
 * continúa con los datos que ya están guardados en este navegador.
 * No se valida contraseña ni existe backend de por medio.
 */

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("name").value.trim();
    if (nombre) {
      Store.data().usuario.nombre = nombre;
      Store.save();
    }
    window.location.href = "index.html";
  });
}
