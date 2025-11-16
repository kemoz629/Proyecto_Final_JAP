// --- Inicializar carrito al cargar ---
document.addEventListener("DOMContentLoaded", () => {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  mostrarCarrito(carrito);
  updateValues();
  actualizarCostos(); // Calcular costos iniciales

  // Event listener para finalizar compra
  document.getElementById("checkoutButton").addEventListener("click", finalizarCompra);
});

// --- Mostrar carrito ---
// Función que renderiza la tabla del carrito con los productos actuales
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

  // Escuchar cambios en tipo de envío
  document.querySelectorAll('input[name="shippingType"]').forEach(radio => {
    radio.addEventListener("change", actualizarCostos);
  });

  actualizarCostos(); // Actualizar costos después de mostrar carrito
}

// --- Actualizar cantidad ---
// Función que actualiza la cantidad de un producto en el carrito
function actualizarCantidad(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito[index].quantity = parseInt(e.target.value);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
}

// --- Quitar producto ---
// Función que elimina un producto del carrito
function quitarProducto(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
  // Actualizar badges después de quitar
  const totalItems = carrito.reduce((total, producto) => total + producto.quantity, 0);
  updateValueBadges(totalItems);
}

// --- Actualizar valores al cambiar moneda ---
// Función que convierte los precios según la moneda seleccionada
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
  actualizarCostos(); // Recalcular costos después de cambio de moneda
}

// --- Finalizar compra ---
function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];

  // Validación 1: Dirección de envío no vacía
  const addressFields = [
    "addressDepartment",
    "addressCity",
    "addressStreet",
    "addressNumber",
    "addressCorner"
  ];
  for (let field of addressFields) {
    if (!document.getElementById(field).value.trim()) {
      alert("Por favor, complete todos los campos de dirección de envío.");
      return;
    }
  }

  // Validación 2: Tipo de envío seleccionado
  const shippingSelected = document.querySelector('input[name="shippingType"]:checked');
  if (!shippingSelected) {
    alert("Por favor, seleccione un tipo de envío.");
    return;
  }

  // Validación 3: Cantidad > 0 para cada producto
  for (let producto of carrito) {
    if (producto.quantity <= 0) {
      alert("La cantidad de cada producto debe ser mayor a 0.");
      return;
    }
  }

  // Validación 4: Forma de pago seleccionada
  const paymentMethod = document.querySelector('.nav-tabs .nav-link.active');
  if (!paymentMethod) {
    alert("Por favor, seleccione una forma de pago.");
    return;
  }

  // Validación 5: Campos de forma de pago no vacíos
  let paymentFields = [];
  if (paymentMethod.id === "credit-tab") {
    paymentFields = ["cardNumber", "cardName", "cardExp", "cardCvv"];
  } else if (paymentMethod.id === "bank-tab") {
    paymentFields = ["bankName", "accountNumber", "transferAlias"];
  }
  for (let field of paymentFields) {
    if (!document.getElementById(field).value.trim()) {
      alert("Por favor, complete todos los campos de la forma de pago seleccionada.");
      return;
    }
  }

  // Si todas las validaciones pasan, mostrar feedback de éxito
  alert("¡Compra realizada con éxito! Gracias por su compra.");
  // Limpiar carrito
  localStorage.removeItem("cart");
  // Recargar página o redirigir
  location.reload();
}

// --- Calcular y actualizar costos ---
function actualizarCostos() {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  const currency = document.getElementById("currency-select").value;

  // Calcular subtotal
  let subtotal = 0;
  carrito.forEach(producto => {
    subtotal += producto.cost * producto.quantity;
  });

  // Obtener porcentaje de envío
  const shippingSelected = document.querySelector('input[name="shippingType"]:checked');
  const percentage = shippingSelected ? parseFloat(shippingSelected.getAttribute('data-percentage')) : 0.15; // Default premium

  // Calcular costo de envío
  const shippingCost = subtotal * percentage;

  // Calcular total
  const total = subtotal + shippingCost;

  // Actualizar elementos en el DOM
  document.getElementById("summarySubtotal").textContent = `${subtotal.toFixed(2)} ${currency}`;
  document.getElementById("summaryShipping").textContent = `${shippingCost.toFixed(2)} ${currency}`;
  document.getElementById("summaryTotal").textContent = `${total.toFixed(2)} ${currency}`;
}
