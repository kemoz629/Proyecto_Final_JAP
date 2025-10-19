document.addEventListener("DOMContentLoaded", function () {
  // Simulación: tomamos ID del producto desde localStorage o query string
  let productID = localStorage.getItem("productID") || 50921; 

  getJSONData(PRODUCT_INFO_URL + productID + EXT_TYPE).then(function (resultObj) {
    if (resultObj.status === "ok") {
      let product = resultObj.data;

      // Render principal
      document.getElementById("productName").textContent = product.name;
      document.getElementById("productDescription").textContent = product.description;
      document.getElementById("soldCount").textContent = product.soldCount;
      document.getElementById("productPrice").textContent = product.currency + " " + product.cost;

      // Imagen principal
      const mainImg = document.getElementById("mainImg");
      // Mostrar spinner inicialmente
      document.getElementById("imageSpinner").style.display = "block";
      mainImg.src = product.images[0];

      // Miniaturas
      const thumbnails = document.getElementById("thumbnails");
      thumbnails.innerHTML = "";
      product.images.forEach((img, index) => {
        let thumb = document.createElement("img");
        thumb.src = img;
        thumb.className = "img-thumbnail";
        thumb.style.cursor = "pointer";
        thumb.style.width = "60px";
        thumb.onclick = () => mainImg.src = img;
        thumbnails.appendChild(thumb);
      });

      // Cargar calificaciones
      loadReviews(productID);

      // PRODUCTOS RELACIONADOS 
      if (product.relatedProducts && product.relatedProducts.length > 0) {
        const contenedorRelacionados = document.getElementById("productosRelacionados");
        contenedorRelacionados.innerHTML = ""; 

        product.relatedProducts.forEach(relacionado => {
          let tarjeta = document.createElement("div");
          tarjeta.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
          
          tarjeta.innerHTML = `
            <div class="card-relacionado">
              <div class="img-relacionado">
                <img src="${relacionado.image}" alt="${relacionado.name}">
              </div>
              <div class="body-relacionado">
                <h6 class="titulo-relacionado">${relacionado.name}</h6>
              </div>
            </div>
          `;

          tarjeta.onclick = () => {
            localStorage.setItem("productID", relacionado.id);
            window.scrollTo(0, 0);
            location.reload();
          };

          contenedorRelacionados.appendChild(tarjeta);
        });
      } else {
        // Ocultar la sección si no tiene productos relacionados para mostrar
        const seccionRelacionados = document.getElementById("seccionRelacionados");
        if (seccionRelacionados) {
          seccionRelacionados.style.display = "none";
        }
      }
    }
  });

  // Manejar envío del formulario de calificación
  document.getElementById("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById("comment").value;

    if (!rating) {
      alert("Por favor selecciona una calificación");
      return;
    }

    // Simulación: agregar la calificación (en un proyecto real, enviar a servidor)
    addReview(rating, comment);
    // Limpiar formulario
    this.reset();
  });
});

// Función para mostrar la imagen cuando cargue
function showImage() {
  document.getElementById("imageSpinner").style.display = "none";
  document.getElementById("mainImg").style.display = "block";
}

// Función para cargar y mostrar calificaciones
function loadReviews(productID) {
  // Obtengo reviews del API
  let reviews = [];
  getJSONData(PRODUCT_INFO_COMMENTS_URL + productID + EXT_TYPE).then(function (resultObj) {
    if (resultObj.status === "ok") {

      // Propiedades de cada review: product, score, description, user, dateTime
      reviews = resultObj.data;

      // Obtener reviews de localStorage y agregarlas a las que trae el api
      const storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
      const productReviews = storedReviews.filter(review => review.idProducto === productID);
      const allReviews = [...productReviews, ...reviews];

      // Mostrar reviews
      const reviewsContainer = document.getElementById("reviews");
      reviewsContainer.innerHTML = "";
      allReviews.forEach(review => {
        const reviewDiv = document.createElement("div");
        reviewDiv.className = "col-md-6";
        reviewDiv.innerHTML = `
          <div class="p-3 border border-secondary rounded shadow-sm contenedorReviews">
            <h6 class="mb-2"><i class="fas fa-user-circle me-2"></i>${review.user}</h6>
            <p class="text-muted small mb-2"><i class="far fa-calendar me-2"></i>${review.dateTime}</p>
            <p class="review-description mb-2">${review.description}</p>
            <div class="mt-2">${generateStars(review.score)}</div>
          </div>
        `;
        reviewsContainer.appendChild(reviewDiv);
      });
    }
  });
}

// Función para generar estrellas
function generateStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star text-warning"></i>'; // Estrella llena
    } else {
      stars += '<i class="far fa-star text-warning"></i>'; // Estrella vacía
    }
  }
  // Comentario: En caso de querer cambiar el icono, remplaza "fa-star" por otro icono de FontAwesome, por ejemplo "fa-heart" para corazones
  return stars;
}

// Función para agregar una nueva calificación (simulada)
function addReview(rating, comment) {
  // TODO: Cambiar por una alerta mas bonita luego
  alert("Calificación enviada: " + rating + " estrellas, comentario: " + comment);

  // Obtener idProducto
  let idProducto = localStorage.getItem("productID") || 50921;

  // Obtener usuario logueado
  let usuario = localStorage.getItem("usuarioLogueado") || "Invitado";

  // Obtener fecha actual en formato YYYY-MM-DD HH:MM:SS
  let fecha = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Obtener reviews de localStorage y agregar la nueva
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.push({ idProducto, user: usuario, score: rating, description: comment, dateTime: fecha });

  // Guardar en localStorage para simular persistencia
  localStorage.setItem("reviews", JSON.stringify(reviews));

  // Recargar calificaciones para mostrar la nueva
  loadReviews(idProducto);
}