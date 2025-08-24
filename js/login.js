// login.js
// Lógica de validación y gestión de sesión para el login

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
	// Referencias a los elementos del formulario
	const form = document.getElementById('loginForm');
	const usuario = document.getElementById('usuario');
	const contrasena = document.getElementById('contrasena');
	const errorMsg = document.getElementById('loginError');

	// Si ya hay sesión iniciada, redirige a portada (index.html)
	if (localStorage.getItem('usuarioLogueado')) {
		window.location.href = 'index.html';
		return;
	}

	// Maneja el envío del formulario
	form.addEventListener('submit', function (e) {
		e.preventDefault(); // Evita recarga de página

		// Validación: ambos campos deben estar completos
		if (usuario.value.trim() === '' || contrasena.value.trim() === '') {
			errorMsg.style.display = 'block';
			errorMsg.textContent = 'Debe completar ambos campos.';
			return;
		}

		// Si pasa la validación, oculta el mensaje de error
		errorMsg.style.display = 'none';

		// Guarda el usuario en localStorage para simular sesión
		localStorage.setItem('usuarioLogueado', usuario.value.trim());

		// Redirige a la portada
		window.location.href = 'index.html';
	});
});

// Protección para otras páginas: si no hay sesión, redirige a login.html
// (Este fragmento se puede reutilizar en otras páginas JS)
// if (!localStorage.getItem('usuarioLogueado')) {
//   window.location.href = 'login.html';
// }
