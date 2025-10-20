const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

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
      }else{
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
  applySavedTheme()
  let usuario = localStorage.getItem("usuarioLogueado");
  if (usuario) {
  let userDropdownContainer = document.documentElement.clientWidth > 768 ? document.getElementById("userDropdownContainer") : document.getElementById("userDropdownContainerMobile");
  let userName = document.documentElement.clientWidth > 768 ? document.getElementById("userName") : document.getElementById("userNameMobile");
    userDropdownContainer.style.display = "block";
    userName.textContent = usuario;
    let logoutBtn = document.documentElement.clientWidth > 768 ? document.getElementById("logoutBtn") : document.getElementById("logoutBtnMobile");
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("usuarioLogueado");
      window.location.href = "login.html";
    });
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
});

if (!localStorage.getItem('usuarioLogueado')) {
    window.location.href = 'login.html';
}


function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Cambiar el atributo data-bs-theme
    html.setAttribute('data-bs-theme', newTheme);

    // Actualizar el ícono
    const icon = document.getElementById('theme-icon');
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
    
    // Guardar en localStorage (para persistencia)
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

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', applySavedTheme);