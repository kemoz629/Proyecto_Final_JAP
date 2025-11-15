
const cartStore = (() => {
  const LS_KEY = 'miProyecto.cart.v1';

  // lee del localStorage
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('cartStore: error leyendo localStorage', e);
      return [];
    }
  }

  // guarda en localStorage y dispara evento
  function save(items) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('cartStore: error guardando en localStorage', e);
    }
    // evento custom para que otras partes de la app actualicen badge/contadores
    const detail = { totalQuantity: getTotalQuantity(items), totalDistinct: items.length, items };
    window.dispatchEvent(new CustomEvent('cart:updated', { detail }));
  }

 
  function findIndex(items, id) {
    return items.findIndex(i => String(i.id) === String(id));
  }

  function getItems() {
    return load();
  }

  function getTotalQuantity(items = load()) {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }

  function getTotalDistinct(items = load()) {
    return items.length;
  }


  function addItem(product, quantity = 1) {
    if (!product || typeof product.id === 'undefined') {
      throw new Error('cartStore.addItem requiere un objeto product con al menos .id');
    }
    const items = load();
    const idx = findIndex(items, product.id);
    if (idx >= 0) {
      items[idx].quantity = (Number(items[idx].quantity) || 0) + Number(quantity);
    } else {
      const toSave = {
        id: product.id,
        title: product.title || product.name || '',
        price: Number(product.price) || 0,
        image: product.image || product.img || '',
        quantity: Number(quantity) || 1,
        
      };
      items.push(toSave);
    }
    save(items);
    return items;
  }


  function updateQuantity(id, quantity) {
    const items = load();
    const idx = findIndex(items, id);
    if (idx === -1) return items;
    const q = Number(quantity) || 0;
    if (q <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = q;
    }
    save(items);
    return items;
  }

  function removeItem(id) {
    const items = load();
    const idx = findIndex(items, id);
    if (idx === -1) return items;
    items.splice(idx, 1);
    save(items);
    return items;
  }

  function clear() {
    localStorage.removeItem(LS_KEY);
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { totalQuantity: 0, totalDistinct: 0, items: [] } }));
  }

  // Sincronizar entre pestañas con 'storage' event
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) {
      const items = load();
      const detail = { totalQuantity: getTotalQuantity(items), totalDistinct: items.length, items };
      window.dispatchEvent(new CustomEvent('cart:updated', { detail }));
    }
  });

  // Inicializar (dispara evento con estado actual)
  (function init() {
    const items = load();
    const detail = { totalQuantity: getTotalQuantity(items), totalDistinct: items.length, items };
 
    setTimeout(() => window.dispatchEvent(new CustomEvent('cart:updated', { detail })), 0);
  })();

  return {
    addItem,
    updateQuantity,
    removeItem,
    getItems,
    getTotalQuantity,
    getTotalDistinct,
    clear,
  };
})();

(function () {
  // Ayudas
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const fmt = v => Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cartBody = $('#cart-body');
  const grandSubtotalEl = $('#grand-subtotal');
  const shippingCostEl = $('#shipping-cost');
  const grandTotalEl = $('#grand-total');
  const checkoutBtn = $('#checkout-btn');

  // Leer el porcentaje de envío desde el radio seleccionado (retorna número, ej. 0.15)
  function getSelectedShippingRate() {
    const checked = document.querySelector('input[name="shipping"]:checked');
    return checked ? parseFloat(checked.value) : 0;
  }

  // Recalcular el subtotal para una fila específica (tr.cart-item)
  function recalcRow(row) {
    const price = parseFloat(row.getAttribute('data-price')) || 0;
    const qtyInput = row.querySelector('.qty');
    let qty = Number(qtyInput.value);
    if (!isFinite(qty) || qty < 0) qty = 0;
    // Mantener cantidades enteras (opcional): qty = Math.floor(qty);
    // Actualizar el input si se ajustó
    if (String(qtyInput.value) !== String(qty)) qtyInput.value = qty;

    const subtotal = price * qty;
    const subtotalEl = row.querySelector('.line-subtotal');
    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    return subtotal;
  }

  // Recalcular todos los totales y actualizar el DOM
  function calculateTotals() {
    const rows = $$('.cart-item');
    let totalSubtotal = 0;
    rows.forEach(row => {
      totalSubtotal += recalcRow(row);
    });

    const shippingRate = getSelectedShippingRate();
    const shippingCost = totalSubtotal * shippingRate;
    const grandTotal = totalSubtotal + shippingCost;

    grandSubtotalEl.textContent = fmt(totalSubtotal);
    shippingCostEl.textContent = fmt(shippingCost);
    grandTotalEl.textContent = fmt(grandTotal);
  }

  // Listeners delegados: escuchar cambios en inputs de cantidad y cambios en envío
  function initEventListeners() {
    // Escuchar eventos 'input' en cantidades usando delegación
    cartBody.addEventListener('input', function (e) {
      if (e.target && e.target.classList.contains('qty')) {
        // Recalcular solo la fila afectada + totales
        const row = e.target.closest('.cart-item');
        if (row) {
          recalcRow(row);
          // actualizar totales usando todas las filas
          calculateTotals();
        }
      }
    });

    // Si las cantidades cambian por evento 'change' (ej., spinner), manejarlo también
    cartBody.addEventListener('change', function (e) {
      if (e.target && e.target.classList.contains('qty')) {
        const row = e.target.closest('.cart-item');
        if (row) {
          recalcRow(row);
          calculateTotals();
        }
      }
    });

    // Cambio de opción de envío
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(r => {
      r.addEventListener('change', () => {
        calculateTotals();
      });
    });

    // Si los productos se agregan/eliminan dinámicamente, observar mutaciones y recalcular
    const observer = new MutationObserver(() => {
      // No es necesario volver a adjuntar nada porque usamos delegación; solo recalcular totales
      calculateTotals();
    });
    observer.observe(cartBody, { childList: true, subtree: true });

    // Comportamiento inicial del botón - solo demostración (sin envío real, parte 3 únicamente)
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Para la parte 3 no se hacen validaciones; solo mostrar los totales actuales
      const totalsText = `Total actual: $${grandTotalEl.textContent} (Envío: $${shippingCostEl.textContent})`;
      const feedback = document.getElementById('feedback');
      if (feedback) {
        feedback.textContent = totalsText;
        // Borrar después de un pequeño retraso
        setTimeout(() => { feedback.textContent = ''; }, 4000);
      }
    });
  }

  // Inicializar los subtotales de línea según data-price y cantidades existentes
  function init() {
    // Asegurar que los precios unitarios se muestren formateados correctamente (si los atributos eran crudos)
    $$('.cart-item').forEach(row => {
      const price = parseFloat(row.getAttribute('data-price')) || 0;
      const unitPriceSpan = row.querySelector('.unit-price');
      if (unitPriceSpan) unitPriceSpan.textContent = fmt(price);
    });

    initEventListeners();
    calculateTotals();
  }

  // Ejecutar init en DOMContentLoaded (si el script está en <head>)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
