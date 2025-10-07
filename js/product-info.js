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
});