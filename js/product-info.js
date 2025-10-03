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
      let productID = localStorage.getItem("productID") || 50921;

      // Funcion para mostrar calificaciones
      function mostrarCalificaciones () {
        const ratings = JSON.parse (localStorage.getItem("ratings_" + productID)) || [];
        const ratingsList = document.getElementById("ratingsList");
        ratingsList.innerHTML = "";
        ratings.forEach(rating => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${rating.user}:</strong> ${rating.score}/5 - ${rating.comment}`;
          ratingsList.appendChild(li);
        });
      }
      mostrarCalificaciones();
    }
    // Evento para agregar una nueva calificación
document.getElementById("addRatingForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const user = document.getElementById("ratingUser").value;
  const score = parseInt(document.getElementById("ratingScore").value);
  const comment = document.getElementById("ratingComment").value;
  const nuevaCalificacion = { user, score, comment };

  // Obtener calificaciones actuales y agregar la nueva
  const ratings = JSON.parse(localStorage.getItem("ratings_" + productID)) || [];
  ratings.push(nuevaCalificacion);

  // Guardar en localStorage
  localStorage.setItem("ratings_" + productID, JSON.stringify(ratings));

  // Actualizar la vista (mostrar la nueva calificación)
  mostrarCalificaciones();

  // Limpiar el formulario
  this.reset();
});

// Al cargar la página, mostrar las calificaciones
document.addEventListener("DOMContentLoaded", mostrarCalificaciones);
  });
});
