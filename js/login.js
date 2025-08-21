/*
 * ARCHIVO: login.js
 * DESCRIPCIÓN: Maneja toda la funcionalidad del formulario de login
 * FUNCIONES PRINCIPALES:
 * - Validación de campos de usuario y contraseña
 * - Mostrar/ocultar contraseña
 * - Guardar sesión en localStorage
 * - Redirección después del login exitoso
 */

// Esperamos a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function() {
  
  // =============================
  // VARIABLES Y ELEMENTOS DEL DOM
  // =============================
  
  // Obtenemos referencias a los elementos principales del formulario
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("loginError");
  const passwordInput = document.getElementById('contrasena');
  const toggleBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  
  // Variable para controlar si la contraseña está visible o no
  let passwordVisible = false;

  // =============================
  // FUNCIÓN: MOSTRAR/OCULTAR CONTRASEÑA
  // =============================
  
  // Verificamos que el botón de toggle existe antes de agregar el evento
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      
      // Cambiamos el estado de visibilidad
      passwordVisible = !passwordVisible;
      
      // Cambiamos el tipo de input entre 'password' y 'text'
      passwordInput.type = passwordVisible ? 'text' : 'password';
      
      // Cambiamos el icono del ojo según el estado
      eyeIcon.innerHTML = passwordVisible
        ? // Icono de ojo tachado (contraseña visible)
          '<path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 4.22-5.94M1 1l22 22"/><circle cx="12" cy="12" r="3"/>'
        : // Icono de ojo normal (contraseña oculta)
          '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // =============================
  // FUNCIÓN: VALIDACIÓN Y ENVÍO DEL FORMULARIO
  // =============================
  
  // Agregamos el evento de envío al formulario
  form.addEventListener("submit", function(e) {
    
    // Prevenimos el envío normal del formulario para manejarlo con JavaScript
    e.preventDefault();
    
    // Obtenemos los valores de los campos y eliminamos espacios en blanco
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    
    // Validamos que ambos campos tengan contenido
    if (usuario && contrasena) {
      
      // =============================
      // LOGIN EXITOSO
      // =============================
      
      // Ocultamos cualquier mensaje de error previo
      errorDiv.classList.add("d-none");
      
      // Guardamos el usuario en localStorage para mantener la sesión
      // Esto permite que otras páginas sepan que el usuario está logueado
      localStorage.setItem("usuario", usuario);
      
      // Redirigimos al usuario a la página principal
      window.location.href = "index.html";
      
    } else {
      
      // =============================
      // ERROR DE VALIDACIÓN
      // =============================
      
      // Mostramos el mensaje de error si faltan datos
      errorDiv.classList.remove("d-none");
      
      // Enfocamos el primer campo vacío para mejor experiencia de usuario
      if (!usuario) {
        document.getElementById("usuario").focus();
      } else {
        document.getElementById("contrasena").focus();
      }
    }
  });
  
  // =============================
  // FUNCIÓN: OCULTAR ERROR AL ESCRIBIR
  // =============================
  
  // Ocultamos el mensaje de error cuando el usuario comience a escribir
  document.getElementById("usuario").addEventListener("input", function() {
    errorDiv.classList.add("d-none");
  });
  
  document.getElementById("contrasena").addEventListener("input", function() {
    errorDiv.classList.add("d-none");
  });
  
});
