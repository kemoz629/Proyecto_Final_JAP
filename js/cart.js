
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
