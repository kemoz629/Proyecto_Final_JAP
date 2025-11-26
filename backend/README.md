# Backend - Proyecto Final JAP

Este documento explica cómo resolví cada pauta solicitada en la letra del proyecto dentro de la carpeta `backend`. Está escrito para quienes recién comienzan con Node.js y Express, por lo que cada concepto se detalla paso a paso.

## 1. Preparación del entorno local

- **Dependencias**: todo el backend usa únicamente los módulos declarados en `package.json` (Express, CORS, bcrypt, jsonwebtoken y sqlite3). No hay configuraciones ocultas ni variables de entorno.
- **Base de datos**: SQLite genera el archivo `backend/db/ecommerce.db` automáticamente la primera vez que se ejecuta el servidor.
- **Comandos básicos**:
  1. Abrí una terminal en `backend/`.
  2. Instalá dependencias: `npm install`.
  3. Ejecutá el servidor: `node server.js`.

### Credenciales de prueba

- Usuario: `usuario@jap.com`
- Contraseña: `123456`

## 2. Servidor Express configurado

**Archivo**: `backend/server.js`

1. **Importación de módulos (líneas iniciales)**: se cargan los módulos nativos (`path`, `fs`) y los externos (`express`, `cors`, `bcryptjs`, `jsonwebtoken`, `sqlite3`). Esto cumple la pauta de iniciar un servidor HTTP con Express.
2. **Configuración básica (sección "Configuración genérica")**: se definen constantes simples (`PORT = 3000`, `JWT_SECRET = "curso-jap-secret"`) para mantener todo local. No se usa `.env` porque la letra pide un proyecto sencillo para estudiantes.
3. **Instancia de Express**: `const app = express(); app.use(cors()); app.use(express.json());` agrega CORS (para permitir peticiones del frontend) y el parser de JSON. Así se cubre la pauta de aceptar requests en formato JSON.

## 3. Manejo de archivos JSON del curso

**Funciones principales**: `readJSON` y `respondWithFile` en `server.js`.

- La función `readJSON(relativePath)` abre archivos de la carpeta `backend/data/`. Se usa para reutilizar los mismos JSON que venían en el curso (categorías, productos, etc.).
- `respondWithFile` envuelve la lectura y envía respuestas HTTP. Si el archivo no existe devuelve `404`. Esto satisface la pauta de exponer los datasets originales bajo `/api`.

## 4. Rutas públicas protegidas con middleware

- Se creó el router `apiRouter` que responde a:
  - `/api/cats/cat.json`
  - `/api/sell/publish.json`
  - `/api/cart/buy.json`
  - `/api/cats_products/:file`
  - `/api/products/:file`
  - `/api/products_comments/:file`
  - `/api/user_cart/:file`
- Todas estas rutas pasan por `app.use("/api", authorize, apiRouter);`. El middleware `authorize` revisa el encabezado `Authorization`, verifica el JWT con `jwt.verify` y sólo deja pasar si es válido. Con esto se cumple la pauta de “proteger las rutas con autenticación”.

## 5. Login con JWT

**Ubicación**: `server.js`, función `app.post("/login", ...)`.

Pasos implementados:
1. Se toman `username` y `password` del `req.body` (la petición).
2. Se buscan los datos en el array `users`, cargado desde `data/users.json` al iniciar el servidor.
3. Se valida la contraseña usando `bcrypt.compareSync` comparando el texto ingresado con el hash almacenado.
4. Si todo es correcto se genera un token JWT con `jwt.sign`. El token incluye el `id` y el `username` del usuario y dura 2 horas (`expiresIn: "2h"`).
5. Se responde con el token y los datos básicos del usuario. Esto cubre la pauta de autenticación solicitada.

## 6. Base de datos SQLite con el esquema del curso

- **Archivo**: `backend/ecommerce.sql` contiene toda la definición de tablas (`Usuario`, `Categoria`, `Producto`, `Direccion`, `Compra`, `CompraProducto`, etc.).
- **Ejecución del script**: la función `runSchemaScript()` lee `ecommerce.sql` y lo ejecuta con `db.exec`. De esta forma, cada vez que arranca el servidor se aseguran las tablas. Cumple la pauta “usar la misma estructura de la letra con SQLite”.
- **Carga inicial de usuarios**: `seedUsersTable()` recorre `data/users.json` e inserta los usuarios en la tabla `Usuario` usando `INSERT OR IGNORE`. Esto evita duplicados y cumple con la pauta de contar con usuarios iniciales sin depender de SQL Server.

## 7. Guardar compras y direcciones

**Función clave**: `insertCart` en `server.js`.

1. Convierte el número de puerta a entero para evitar `NaN`.
2. Inserta la dirección en la tabla `Direccion` vinculada al usuario (`IdUsuario`).
3. Inserta la compra en la tabla `Compra`, guardando tipo de envío, forma de pago y total enviado por el frontend.
4. Inserta cada producto del carrito en `CompraProducto` con la cantidad solicitada.
5. Devuelve el `Id` de la compra creada para informar al frontend.

Esto satisface la pauta de “persistir los carritos” usando las tablas provistas por la letra sin agregar lógica avanzada (se usa una secuencia de `INSERT` sencillos para mantenerlo didáctico).

## 8. Endpoint `/cart` con validaciones simples

- Ruta: `app.post("/cart", authorize, async (req, res) => { ... })`.
- Valida que `items` sea un arreglo con al menos un producto.
- Llama a `insertCart` pasando `items`, `shipping`, `payment` y `totals` que llegan desde el frontend.
- Si todo sale bien responde con `201` y el `cartId`. Si hay error devuelve `500` con un mensaje claro.

Completa la pauta de “recibir el pedido completo desde el frontend y guardarlo en la base”.

## 9. Manejo de errores y rutas inexistentes

- Cualquier ruta que no esté definida responde con `app.use((req, res) => { ... 404 ... })`, lo cual evita que Express deje la conexión colgando. Esta es la pauta de “manejar rutas no encontradas”.
- Todas las funciones tienen `try/catch` simples (por ejemplo, en `/cart`). Los mensajes están en español para que el estudiante entienda qué ocurrió.

## 10. Resumen de dónde encontrar cada solución

| Pauta / requisito                               | Sección del código |
|------------------------------------------------|--------------------|
| Servidor Express con JSON + CORS               | `server.js`, configuración inicial |
| Lectura de datasets del curso                  | `readJSON`, `respondWithFile`, rutas `/api` |
| Login con JWT                                  | `app.post("/login")` |
| Middleware de autorización                     | `const authorize = ...` y `app.use("/api", authorize, ...)` |
| Esquema SQLite del curso                       | `ecommerce.sql` + `runSchemaScript()` |
| Usuarios iniciales                             | `seedUsersTable()` |
| Guardado de carrito/dirección/compra           | `insertCart()` + `app.post("/cart")` |
| Manejo de errores básicos                      | `respondWithFile`, `/cart` y middleware 404 |

Con esta guía podés entender rápidamente qué archivo modificar si querés cambiar una parte puntual (por ejemplo, ajustar el login o agregar más campos al carrito). Ante cualquier duda podés seguir los comentarios en `server.js`, que describen cada línea crítica pensando en estudiantes que recién comienzan.
