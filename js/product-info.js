function redirectToProduct(id) {
    localStorage.setItem("productID", id);
    window.location = "product-info.html";
}

document.addEventListener("DOMContentLoaded", function() {
    const productID = localStorage.getItem("productID");

    if (!productID) {
        alert("No se ha seleccionado ningún producto.");
        window.location = "products.html"; // Redirige la pagina actual a products.html si no existe el producto seleccionado.
        return;
    }

    // URL completa para la solicitud a la API
    const fullProductURL = `${PRODUCT_INFO_URL}${productID}.json`;

    // Solicitud fetch a la API
    fetch(fullProductURL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Hubo un problema con la solicitud.");
            }
            return response.json();
        })
        .then(productData => {
            document.getElementById("product-name").textContent = productData.name;
            document.getElementById("product-price").textContent = `${productData.currency} ${productData.cost}`;
            document.getElementById("product-description").textContent = productData.description;
            document.getElementById("product-sold-count").textContent = productData.soldCount;

            // Imágenes 
            const imagesContainer = document.getElementById("carousel-images-container");
            
            productData.images.forEach((imageSrc, index) => {
                // Crear item del carrusel
                const carouselItem = document.createElement("div");
                carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                carouselItem.innerHTML = `<img src="${imageSrc}" class="d-block w-100" alt="Imagen del producto">`;
                imagesContainer.appendChild(carouselItem);
            });
        });

});