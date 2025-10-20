document.addEventListener('DOMContentLoaded', function() {
  // Cargar datos del perfil desde localStorage
  loadProfileData();

  // Manejar cambio de imagen de perfil
  document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        // Mostrar la imagen seleccionada
        document.getElementById('profileImage').src = event.target.result;
        // Guardar en localStorage
        localStorage.setItem('profileImage', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Manejar envío del formulario
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const profileData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    };

    // Guardar en localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));

    // Mostrar mensaje de éxito
    alert('Perfil guardado correctamente');
  });
});

// Función para cargar datos del perfil
function loadProfileData() {
  // Cargar imagen de perfil
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    document.getElementById('profileImage').src = savedImage;
  }

  // Cargar datos del formulario
  const savedData = localStorage.getItem('profileData');
  if (savedData) {
    const profileData = JSON.parse(savedData);
    document.getElementById('firstName').value = profileData.firstName || '';
    document.getElementById('lastName').value = profileData.lastName || '';
    document.getElementById('email').value = profileData.email || '';
    document.getElementById('phone').value = profileData.phone || '';
  } else {
    // Si no hay datos guardados, usar el email del usuario logueado
    const userEmail = localStorage.getItem('usuarioLogueado');
    if (userEmail) {
      document.getElementById('email').value = userEmail;
    }
  }
}
