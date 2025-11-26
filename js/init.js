// URLs base del backend Express que creamos para reemplazar los JSON locales
const BACKEND_BASE_URL = "http://localhost:3000";
const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
// Endpoints que siguen entregando los archivos de la letra pero ahora pasan por el backend (y su middleware)
const CATEGORIES_URL = `${API_BASE_URL}/cats/cat.json`;
const PUBLISH_PRODUCT_URL = `${API_BASE_URL}/sell/publish.json`;
const PRODUCTS_URL = `${API_BASE_URL}/cats_products/`;
const PRODUCT_INFO_URL = `${API_BASE_URL}/products/`;
const PRODUCT_INFO_COMMENTS_URL = `${API_BASE_URL}/products_comments/`;
const CART_INFO_URL = `${API_BASE_URL}/user_cart/`;
const CART_BUY_URL = `${API_BASE_URL}/cart/buy.json`;
const CART_SAVE_URL = `${BACKEND_BASE_URL}/cart`; // Ruta nueva para guardar el carrito en SQLite
const EXT_TYPE = ".json";
const DOLLAR_EXCHANGE_VALUE = 40; // Valor fijo del dólar en pesos para conversiones

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

// Función auxiliar que envuelve a fetch: agrega el token, muestra el spinner y captura errores
let getJSONData = function(url, fetchOptions = {}){
  let result = {};
  showSpinner();

  const token = localStorage.getItem("authToken");
  const headers = new Headers(fetchOptions.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`); // Todas las llamadas pasan por el backend autenticado
  }

  const options = { ...fetchOptions, headers };

  return fetch(url, options)
  .then(response => {
    if (response.status === 401) {
      hideSpinner();
      handleUnauthorizedAccess(); // Si el token ya no sirve volvemos al login para evitar errores en cascada
      throw Error("Sesión expirada");
    }

    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  })
  .then(function(response) {
    result.status = 'ok';
    result.data = response;
    hideSpinner();
    return result;
  })
  .catch(function(error) {
    result.status = 'error';
    result.data = error;
    hideSpinner();
    return result;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  applySavedTheme();

  // Mostrar usuario logueado
  let usuario = localStorage.getItem("usuarioLogueado");
  if (usuario) {
    let userDropdownContainer = document.documentElement.clientWidth > 768 ?
      document.getElementById("userDropdownContainer") :
      document.getElementById("userDropdownContainerMobile");

    let userName = document.documentElement.clientWidth > 768 ?
      document.getElementById("userName") :
      document.getElementById("userNameMobile");

    userDropdownContainer.style.display = "block";
    userName.textContent = usuario;

    let logoutBtn = document.documentElement.clientWidth > 768 ?
      document.getElementById("logoutBtn") :
      document.getElementById("logoutBtnMobile");

    logoutBtn.addEventListener("click", function () {
      handleUnauthorizedAccess();
    });
    
    let totalItems = obtenerCantidadTotal();
    updateValueBadges(totalItems);
  }

  // Imagen de perfil en navbar
  const savedImage = localStorage.getItem('miPerfil.profileImage.dataURL');
  if (savedImage) {
    let navbarImg = document.getElementById("navbarProfileImg");
    if(navbarImg) {
      navbarImg.src = savedImage;
      navbarImg.style.display = "inline-block";
    }
    let navbarImgMobile = document.getElementById("navbarProfileImgMobile");
    if(navbarImgMobile) {
      navbarImgMobile.src = savedImage;
      navbarImgMobile.style.display = "inline-block";
    }
  } else {
    let navbarImg = document.getElementById("navbarProfileImg");
    if(navbarImg) navbarImg.style.display = "inline-block";
    let navbarImgMobile = document.getElementById("navbarProfileImgMobile");
    if(navbarImgMobile) navbarImgMobile.style.display = "inline-block";
  }

  // --- Verificar contenido del carrito si estamos en cart.html ---
  if (window.location.pathname.includes("cart.html")) {
    verificarCarrito(); // Revisa el carrito guardado localmente antes de mostrar la tabla
  }
});

if (!localStorage.getItem('usuarioLogueado') || !localStorage.getItem('authToken')) {
  window.location.href = 'login.html';
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-bs-theme', newTheme);

  const icon = document.getElementById('theme-icon');
  if (newTheme === 'dark') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }

  localStorage.setItem('theme', newTheme);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  html.setAttribute('data-bs-theme', savedTheme);

  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// --- Función para verificar carrito ---
function verificarCarrito() {
  const contenedorCarrito = document.getElementById("cart-container");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = `
      <div class="text-center py-5">
        <h4>No hay productos en el carrito 🛒</h4>
        <p>Agrega productos desde la sección de productos para verlos aquí.</p>
      </div>
    `;
  } else {
    mostrarCarrito(carrito);
  }
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', applySavedTheme);

// --- Obtener cantidad total de productos en el carrito ---
function obtenerCantidadTotal() {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  return carrito.reduce((total, producto) => total + producto.quantity, 0);
}

// --- Actualizar badges de conteo en el navbar ---
//--- Breve explicación por Facu: Agarra los elementos del contador del carrito tanto en la versión normal como en la versión mobile usando sus IDs, 
// y les actualiza el texto con la cantidad total de ítems que le pasámos. 
function updateValueBadges(totalItems) {
  const badge = document.getElementById("cartItemCount");
  const badgeMobile = document.getElementById("cartItemCountMobile");
  if(badge) badge.textContent = totalItems;
  if(badgeMobile) badgeMobile.textContent = totalItems;
}

function handleUnauthorizedAccess() {
  // Borra datos de sesión y fuerza al usuario a reingresar, evitando llamadas con tokens vencidos
  localStorage.removeItem("usuarioLogueado");
  localStorage.removeItem("authToken");
  window.location.href = "login.html";
}