// Endpoint del backend Express que valida las credenciales y emite el JWT
const LOGIN_URL = "http://localhost:3000/login";

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
	// Referencias a los elementos del formulario
	let form = document.getElementById('loginForm');
	let usuario = document.getElementById('usuario');
	let contrasena = document.getElementById('contrasena');
	let errorMsg = document.getElementById('loginError');
	let submitBtn = form.querySelector('.login-btn');

	// Si ya hay sesión iniciada y token válido, redirige a portada
	if (localStorage.getItem('usuarioLogueado') && localStorage.getItem('authToken')) {
		window.location.href = 'index.html';
		return;
	} else {
		localStorage.removeItem('usuarioLogueado');
		localStorage.removeItem('authToken');
	}

	// Maneja el envío del formulario y contacta al backend en lugar del JSON estático
	form.addEventListener('submit', async function (e) {
		e.preventDefault(); // Evita recarga de página

		// Validación: ambos campos deben estar completos
		if (usuario.value.trim() === '' || contrasena.value.trim() === '') {
			errorMsg.style.display = 'block';
			errorMsg.textContent = 'Debe completar ambos campos.';
			return;
		}

		errorMsg.style.display = 'none';
		submitBtn.disabled = true;
		submitBtn.textContent = 'Ingresando...';

		try {
			const response = await fetch(LOGIN_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: usuario.value.trim(),
					password: contrasena.value.trim()
				})
			});

			const data = await response.json().catch(() => ({ message: 'Error al procesar la respuesta del servidor' }));

			if (!response.ok) {
				throw new Error(data.message || 'Credenciales inválidas');
			}

			// Guardamos tanto el nombre como el token que se usará para las demás peticiones protegidas
			localStorage.setItem('usuarioLogueado', data.user.fullName || data.user.username);
			localStorage.setItem('authToken', data.token);
			window.location.href = 'index.html';
		} catch (err) {
			errorMsg.style.display = 'block';
			errorMsg.textContent = err.message || 'No se pudo iniciar sesión.';
		} finally {
			submitBtn.disabled = false;
			submitBtn.textContent = 'Iniciar sesión';
		}
	});
});
