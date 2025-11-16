// Inicializar carrito al cargar 
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
//---Explicación breve por Facu:agarra el índice del producto desde el input que tocaste,
//  carga el carrito del localStorage, cambia la cantidad de ese producto con el valor nuevo del input, 
// guarda el carrito actualizado de vuelta en localStorage y finalmente vuelve a renderizar el carrito en pantalla. 
function actualizarCantidad(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito[index].quantity = parseInt(e.target.value);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
  actualizarCostos();
}

// --- Quitar producto --- 
//agarramos el índice del producto desde el botón que toca el usuario usando el data-index, 
// después carga el carrito que está guardado en el localStorage, borra ese producto del array usando splice, 
// vuelve a guardar el carrito ya actualizado en el localStorage y, por último, llama a mostrarCarrito para refrescar la vista en pantalla.
function quitarProducto(e) {
  const index = e.target.dataset.index;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(carrito));
  mostrarCarrito(carrito);
  actualizarCostos();
}

// --- Actualizar valores al cambiar moneda ---
// Función que convierte los precios según la moneda seleccionada
function updateValues() {
  const currencySelect = document.getElementById("currency-select");
  const selectedCurrency = currencySelect.value;
  let carrito = JSON.parse(localStorage.getItem("cart")) || [];
  const DOLLAR_EXCHANGE_VALUE = 40;

  if(selectedCurrency === "USD") {
    carrito = carrito.map(producto => {
      if (producto.currency === "UYU") {
        producto.cost = producto.cost / DOLLAR_EXCHANGE_VALUE;
        producto.currency = "USD";
      }
      return producto;
    });
  } else if(selectedCurrency === "UYU") {ç
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
  actualizarCostos();
}

// --- Calcular y actualizar costos ---
function actualizarCostos() {
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  
  if (carrito.length === 0) return;

  // Calcular subtotal
  let subtotal = 0;
  carrito.forEach(producto => {
    subtotal += producto.cost * producto.quantity;
  });

  // Obtener porcentaje de envío
  const shippingSelected = document.querySelector('input[name="shippingType"]:checked');
  const percentage = shippingSelected ? parseFloat(shippingSelected.getAttribute('data-percentage')) : 0.15;

  // Calcular costo de envío
  const shippingCost = subtotal * percentage;

  // Calcular total
  const total = subtotal + shippingCost;
  
  // Mostrar valores
  const currency = carrito[0].currency;
  document.getElementById("summarySubtotal").textContent = `${subtotal.toFixed(2)} ${currency}`;
  document.getElementById("summaryShipping").textContent = `${shippingCost.toFixed(2)} ${currency}`;
  document.getElementById("summaryTotal").textContent = `${total.toFixed(2)} ${currency}`;
}

// --- Evento para actualizar costos cuando cambia envío ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[name="shippingType"]').forEach(radio => {
    radio.addEventListener("change", actualizarCostos);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const btnFinalizar = document.getElementById("checkoutButton");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", finalizarCompra);
  }
});

function finalizarCompra() {
  // Validación 1: Campos de dirección
  const depto = document.getElementById("addressDepartment").value.trim();
  const ciudad = document.getElementById("addressCity").value.trim();
  const calle = document.getElementById("addressStreet").value.trim();
  const numero = document.getElementById("addressNumber").value.trim();
  const esquina = document.getElementById("addressCorner").value.trim();

  if (!depto || !ciudad || !calle || !numero || !esquina) {
    mostrarAlerta("Por favor, completa todos los campos de dirección", "error");
    return;
  }

  // Validación 2: Forma de envío
  const envio = document.querySelector('input[name="shippingType"]:checked');
  if (!envio) {
    mostrarAlerta("Por favor, selecciona una forma de envío", "error");
    return;
  }

  // Validación 3: Cantidades de productos
  const carrito = JSON.parse(localStorage.getItem("cart")) || [];
  if (carrito.length === 0) {
    mostrarAlerta("Tu carrito está vacío", "error");
    return;
  }

  for (let producto of carrito) {
    if (!producto.quantity || parseInt(producto.quantity) <= 0) {
      mostrarAlerta("Por favor, verifica que todos los productos tengan cantidad mayor a 0", "error");
      return;
    }
  }

  // Validación 4 y 5: Forma de pago y campos
  const creditTab = document.getElementById("credit");
  const bankTab = document.getElementById("bank");
  const isCreditActive = creditTab && creditTab.classList.contains("show");
  const isBankActive = bankTab && bankTab.classList.contains("show");

  if (isCreditActive) {
    // Validar campos de tarjeta
    const numTarjeta = document.getElementById("cardNumber").value.trim();
    const nomTarjeta = document.getElementById("cardName").value.trim();
    const exp = document.getElementById("cardExp").value.trim();
    const cvv = document.getElementById("cardCvv").value.trim();

    if (!numTarjeta || !nomTarjeta || !exp || !cvv) {
      mostrarAlerta("Por favor, completa todos los campos de la tarjeta de crédito", "error");
      return;
    }
  } else if (isBankActive) {
    // Validar campos de transferencia
    const banco = document.getElementById("bankName").value.trim();
    const cuenta = document.getElementById("accountNumber").value.trim();
    const alias = document.getElementById("transferAlias").value.trim();

    if (!banco || !cuenta || !alias) {
      mostrarAlerta("Por favor, completa todos los campos de la transferencia bancaria", "error");
      return;
    }
  } else {
    mostrarAlerta("Por favor, selecciona una forma de pago", "error");
    return;
  }

  // Si todo está bien, mostrar éxito
  const tipoEnvio = envio.nextElementSibling.textContent;
  const tipoPago = isCreditActive ? "Tarjeta de crédito" : "Transferencia bancaria";

  mostrarAlerta(`<strong>¡Compra exitosa!</strong><br>Envío: ${tipoEnvio}<br>Pago: ${tipoPago}`, "success");

  // Limpiar carrito y redirigir
  setTimeout(() => {
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  }, 3000);
}

// Alertas
function mostrarAlerta(mensaje, tipo = "info") {
  const colores = {
    "error": "alerta-error",
    "success": "alerta-success",
    "warning": "alerta-warning",
    "info": "alerta-info"
  };

  const iconos = {
    "error": "fa-exclamation-circle",
    "success": "fa-check-circle",
    "warning": "fa-exclamation-triangle",
    "info": "fa-info-circle"
  };

  const alerta = document.createElement("div");
  alerta.className = `alerta ${colores[tipo]}`;
  alerta.innerHTML = `
    <i class="fas ${iconos[tipo]}"></i>
    <span>${mensaje}</span>
  `;
  
  document.body.appendChild(alerta);

  const tiempo = tipo === "success" ? 3000 : 5000;
  setTimeout(() => {
    alerta.style.animation = "slideOut 0.3s ease-in-out";
    setTimeout(() => alerta.remove(), 300);
  }, tiempo);
}