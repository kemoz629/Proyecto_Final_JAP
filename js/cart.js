// --- Inicializar carrito al cargar ---
document.addEventListener("DOMContentLoaded", () => {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  mostrarCarrito(carrito);
  updateValues();
});

// --- Mostrar carrito ---
function mostrarCarrito(carrito) {
  const contenedorCarrito = document.getElementById("cart-container");

  if (!carrito || carrito.length === 0) {
    contenedorCarrito.innerHTML = `<p class="text-center fw-bold mt-3">Tu carrito está vacío</p>`;
    document.getElementById("cart-total-container").style.display = "none";
    return;
  }

  let contenido = `
    <table class="table table-hover align-middle text-center">
      <thead class="table-dark">
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Costo</th>
          <th>Moneda</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
  `;

  let total = 0;

  carrito.forEach((producto, i) => {
    const subtotal = producto.cost * producto.quantity;
    total += subtotal;

    contenido += `
      <tr>
        <td><img src="${producto.image}" width="80" class="rounded shadow-sm"></td>
        <td>${producto.name}</td>
        <td>${producto.cost}</td>
        <td>${producto.currency}</td>
        <td>
          <input 
            type="number" 
            class="form-control text-center cantidad-input" 
            value="${producto.quantity}" 
            min="1" 
            data-index="${i}" 
            style="max-width: 80px; margin: auto;">
        </td>
        <td class="subtotal">${subtotal} ${producto.currency}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-quitar" data-index="${i}">Quitar</button>
        </td>
      </tr>
    `;
  });

  contenido += `
      </tbody>
    </table>
  `;

  contenedorCarrito.innerHTML = contenido;

  // Mostrar total en la misma fila
  const totalContainer = document.getElementById("cart-total");
  if (totalContainer) {
    totalContainer.innerHTML = `
      <div class="p-3 shadow-sm rounded bg-custom">
        <h4 class="text-center mb-3 fw-bold">Resumen del Pedido</h4>
        <p class="d-flex justify-content-between">
          <span>Total:</span> <span class="fw-bold text-success">${total} ${carrito[0].currency}</span>
        </p>
        <button class="btn btn-warning w-100 mt-3 fw-bold">Finalizar Compra</button>
      </div>
    `;
    document.getElementById("cart-total-container").style.display = "block";
  }

  // Escuchar cambios de cantidad
  document.querySelectorAll(".cantidad-input").forEach(input => {
    input.addEventListener("input", actualizarCantidad);
  });

  // Escuchar clicks en botones "Quitar"
  document.querySelectorAll(".btn-quitar").forEach(btn => {
    btn.addEventListener("click", quitarProducto);
  });
}

// --- Actualizar cantidad ---
function actualizarCantidad(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito[index].quantity = parseInt(e.target.value);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
}

// --- Quitar producto ---
function quitarProducto(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
}

// --- Actualizar valores al cambiar moneda ---
function updateValues() {
  const currencySelect = document.getElementById("currency-select");
  const selectedCurrency = currencySelect.value;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  const DOLLAR_EXCHANGE_VALUE = 40; // Valor fijo del dólar en pesos para conversiones

  if(selectedCurrency === "USD") {
    carrito = carrito.map(producto => {
      if (producto.currency === "UYU") {
        producto.cost = producto.cost / DOLLAR_EXCHANGE_VALUE;
        producto.currency = "USD";
      }
      return producto;
    });
  } else if(selectedCurrency === "UYU") {
    carrito = carrito.map(producto => {
      if (producto.currency === "USD") {
        producto.cost = producto.cost * DOLLAR_EXCHANGE_VALUE;
        producto.currency = "UYU";
      }
      return producto;
    });
  }

  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
}
