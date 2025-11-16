const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";
const DOLLAR_EXCHANGE_VALUE = 40; // Valor fijo del dólar en pesos para conversiones

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
  let result = {};
  showSpinner();
  return fetch(url)
  .then(response => {
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
      localStorage.removeItem("usuarioLogueado");
      window.location.href = "login.html";
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
    verificarCarrito();
  }
});

if (!localStorage.getItem('usuarioLogueado')) {
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