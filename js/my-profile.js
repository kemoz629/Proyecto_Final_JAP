// Persistencia de foto de perfil: localStorage con fallback a IndexedDB
// Requiere en el HTML los elementos con IDs:
// #file-input (input type="file"), #remove-btn (botón), #profile-img (img), #placeholder (div/texto), #drop-zone (zona clic/drag)
// Guardará la imagen en localStorage si es pequeña; si es grande, la guardará como Blob en IndexedDB.

(() => {
  const LS_KEY = 'miPerfil.profileImage.dataURL';
  const IDB_DB = 'miPerfil-db';
  const IDB_STORE = 'images';
  const IDB_KEY = 'profileImage';

  const fileInput = document.getElementById('file-input');
  const removeBtn = document.getElementById('remove-btn');
  const profileImg = document.getElementById('profile-img');
  const placeholder = document.getElementById('placeholder');
  const dropZone = document.getElementById('drop-zone');

  // si faltan elementos, no continuar (evita errores silenciosos)
  if (!fileInput || !profileImg || !placeholder || !dropZone || !removeBtn) {
    console.warn('script.js: faltan elementos HTML requeridos. IDs esperados: file-input, remove-btn, profile-img, placeholder, drop-zone');
    return;
  }

  // --- IndexedDB helpers ---
  function openIDB() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function idbPutBlob(blob) {
    const db = await openIDB();
    if (!db) throw new Error('IndexedDB no disponible');
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const putReq = store.put(blob, IDB_KEY);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject(putReq.error);
    });
  }

  async function idbGetBlob() {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(IDB_KEY);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function idbDelete() {
    const db = await openIDB();
    if (!db) return true;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const delReq = store.delete(IDB_KEY);
      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => reject(delReq.error);
    });
  }

  // --- Utilities ---
  function dataURLSizeBytes(dataURL) {
    const idx = dataURL.indexOf(',');
    const payload = idx >= 0 ? dataURL.slice(idx + 1) : dataURL;
    return Math.ceil((payload.length * 3) / 4);
  }

  function showImageFromDataURL(dataURL) {
    profileImg.src = dataURL;
    profileImg.style.display = 'block';
    placeholder.style.display = 'none';
  }

  function showImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    profileImg.src = url;
    profileImg.onload = () => URL.revokeObjectURL(url);
    profileImg.style.display = 'block';
    placeholder.style.display = 'none';
  }

  function hideImage() {
    profileImg.src = '';
    profileImg.style.display = 'none';
    placeholder.style.display = 'block';
  }

  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const header = parts[0];
    const base64 = parts[1] || '';
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(base64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  async function saveDataURL(dataURL, fileBlob) {
    try {
      const size = dataURLSizeBytes(dataURL);
      const LS_LIMIT_GUESS = 2 * 1024 * 1024; // estimación de 2MB para evitar excepción en localStorage
      if (size <= LS_LIMIT_GUESS) {
        localStorage.setItem(LS_KEY, dataURL);
        await idbDelete().catch(() => {});
        return { method: 'localStorage', bytes: size };
      } else {
        const blob = fileBlob || dataURLToBlob(dataURL);
        await idbPutBlob(blob);
        localStorage.removeItem(LS_KEY);
        return { method: 'indexedDB', bytes: size };
      }
    } catch (err) {
      // fallback a IDB si localStorage falla
      try {
        const blob = fileBlob || dataURLToBlob(dataURL);
        await idbPutBlob(blob);
        localStorage.removeItem(LS_KEY);
        return { method: 'indexedDB', bytes: dataURLSizeBytes(dataURL) };
      } catch (e) {
        console.error('No se pudo guardar la imagen:', e);
        return { method: 'none', error: e };
      }
    }
  }

  async function loadSavedImage() {
    const ds = localStorage.getItem(LS_KEY);
    if (ds) {
      showImageFromDataURL(ds);
      return;
    }
    try {
      const blob = await idbGetBlob();
      if (blob) {
        showImageFromBlob(blob);
        return;
      }
    } catch (e) {
      console.warn('Error leyendo IndexedDB:', e);
    }
    hideImage();
  }

  // --- Handlers ---
  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataURL = ev.target.result;
      showImageFromDataURL(dataURL);
      const result = await saveDataURL(dataURL, file);
      console.log('Imagen guardada vía', result.method, result);
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    handleFile(f);
    e.target.value = '';
  });

  removeBtn.addEventListener('click', async () => {
    localStorage.removeItem(LS_KEY);
    await idbDelete().catch(() => {});
    hideImage();
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(f);
  });

  // click en zona para abrir file dialog
  dropZone.addEventListener('click', () => fileInput.click());

  // Inicializar
  loadSavedImage();

})();
