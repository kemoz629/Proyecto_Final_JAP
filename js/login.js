// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
	// Referencias a los elementos del formulario
	let form = document.getElementById('loginForm');
	let usuario = document.getElementById('usuario');
	let contrasena = document.getElementById('contrasena');
	let errorMsg = document.getElementById('loginError');

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
