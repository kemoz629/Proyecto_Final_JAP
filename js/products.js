document.addEventListener("DOMContentLoaded", () => {
  fetch("https://japceibal.github.io/emercado-api/cats_products/101.json")
    .then(response => response.json())
    .then(data => {
      const products = data.products;
      const container = document.getElementById("products-list");
      products.forEach(product => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
          <div class="card h-100">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <p class="card-text"><strong>Precio:</strong> ${product.currency} ${product.cost}</p>
              <p class="card-text"><small class="text-muted">${product.soldCount} vendidos</small></p>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    });
});
