// Modulos base que usamos en todo el servidor
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

// Configuracion generica del backend
const PORT = 3000;
const JWT_SECRET = "curso-jap-secret";
const DATA_DIR = path.join(__dirname, "data");
const DB_DIR = path.join(__dirname, "db");
const DB_PATH = path.join(DB_DIR, "ecommerce.db");
const SQL_SCHEMA_PATH = path.join(__dirname, "ecommerce.sql");

// Creamos la carpeta para la base si no existe
if (!fs.existsSync(DB_DIR)) {
	fs.mkdirSync(DB_DIR, { recursive: true });
}

// Lee un archivo JSON de la carpeta data y devuelve su contenido como objeto
const readJSON = (relativePath) => {
	const absolutePath = path.join(DATA_DIR, relativePath);
	if (!fs.existsSync(absolutePath)) {
		return null;
	}

	const json = fs.readFileSync(absolutePath, "utf8");
	return JSON.parse(json);
};

// Instanciamos Express y configuramos middlewares comunes
const app = express();
app.use(cors());
app.use(express.json());

// Abrimos/creamos la base de datos SQLite una sola vez
const db = new sqlite3.Database(DB_PATH, (err) => {
	if (err) {
		console.error("No se pudo abrir la base de datos", err.message);
	} else {
		console.log("Base SQLite lista en", DB_PATH);
	}
});

// Crea las tablas ejecutando el archivo ecommerce.sql si existe
const runSchemaScript = () => {
	if (!fs.existsSync(SQL_SCHEMA_PATH)) {
		console.warn("Archivo ecommerce.sql no encontrado, no se ejecutará la creación de tablas");
		return;
	}

	const schema = fs.readFileSync(SQL_SCHEMA_PATH, "utf8");
	db.exec(schema, (err) => {
		if (err) {
			console.error("Error al aplicar el esquema", err.message);
		}
	});
};

runSchemaScript();

// Ejecuta consultas simples con promesas para evitar anidar callbacks
const run = (sql, params = []) =>
	new Promise((resolve, reject) => {
		db.run(sql, params, function runCallback(err) {
			if (err) {
				reject(err);
				return;
			}

			resolve({ lastID: this.lastID, changes: this.changes });
		});
	});

// Cargamos los usuarios de ejemplo que venian con el proyecto
const usersPath = path.join(DATA_DIR, "users.json");
const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, "utf8")) : [];
const categoriesPath = path.join(DATA_DIR, "cats", "cat.json");
const catsProductsDir = path.join(DATA_DIR, "cats_products");

// Llena la tabla Usuario con los usuarios del JSON solo si no existen
const seedUsersTable = () => {
	if (!users.length) return;
	users.forEach((user) => {
		const fullName = user.fullName || user.username;
		const [firstName, ...rest] = fullName.trim().split(" ");
		const lastName = rest.join(" ") || firstName;
		db.run(
			`INSERT OR IGNORE INTO Usuario (Id, Nombre, Apellido, Email, Telefono)
			 VALUES (?, ?, ?, ?, ?)`,
			[user.id, firstName, lastName, user.username, user.phone || ""]
		);
	});
};

seedUsersTable();

// Inserta categorias de ejemplo para cumplir las FK de productos y compras
const seedCategoriesTable = async () => {
	if (!fs.existsSync(categoriesPath)) {
		console.warn("Archivo de categorias no encontrado, se omite el seed");
		return;
	}

	const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf8"));
	for (const category of categories) {
		await run(
			`INSERT OR IGNORE INTO Categoria (Id, Nombre, Descripcion, CantProduct, Imagen)
			 VALUES (?, ?, ?, ?, ?)`
			,
			[
				category.id,
				category.name,
				category.description || "",
				parseInt(category.productCount, 10) || 0,
				category.imgSrc || "",
			]
		);
	}
};

// Inserta productos por cada JSON de cats_products para habilitar la FK de CompraProducto
const seedProductsTable = async () => {
	if (!fs.existsSync(catsProductsDir)) {
		console.warn("Carpeta cats_products no encontrada, se omite el seed de productos");
		return;
	}

	const files = fs.readdirSync(catsProductsDir).filter((file) => file.endsWith(".json"));
	for (const file of files) {
		const data = readJSON(path.join("cats_products", file));
		if (!data || !Array.isArray(data.products)) continue;

		for (const product of data.products) {
			await run(
				`INSERT OR IGNORE INTO Producto (Id, Nombre, Descripcion, Categoria, Costo, Moneda, CantVendidos, Imagen)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				,
				[
					product.id,
					product.name,
					product.description || "",
					data.catID,
					product.cost,
					product.currency || "USD",
					product.soldCount || 0,
					product.image || "",
				]
			);
		}
	}
};

// Al iniciar intentamos sembrar tablas basicas y avisamos si falla algo
seedCategoriesTable()
	.then(() => seedProductsTable())
	.catch((err) => console.error("No se pudieron insertar categorias/productos", err));

// Middleware basico para revisar el token enviado por el frontend
const authorize = (req, res, next) => {
	const authHeader = req.headers.authorization || "";
	const token = authHeader.replace("Bearer ", "").trim();

	if (!token) {
		return res.status(401).json({ message: "Token requerido" });
	}

	jwt.verify(token, JWT_SECRET, (err, payload) => {
		if (err) {
			return res.status(401).json({ message: "Token inválido" });
		}

		req.user = payload;
		next();
	});
};

// Endpoint sencillo de login: valida usuario, compara password y entrega token
app.post("/login", (req, res) => {
	// Tomamos las credenciales enviadas por el formulario
	const { username, password } = req.body;

	// Validamos que no vengan vacias
	if (!username || !password) {
		return res.status(400).json({ message: "Usuario y contraseña son obligatorios" });
	}

	// Buscamos el usuario en el JSON cargado al iniciar el servidor
	const user = users.find((u) => u.username === username);
	if (!user) {
		return res.status(401).json({ message: "Credenciales inválidas" });
	}

	// Comparamos la contraseña en texto con el hash guardado
	const match = bcrypt.compareSync(password, user.passwordHash);
	if (!match) {
		return res.status(401).json({ message: "Credenciales inválidas" });
	}

	// Firmamos un token sencillo con el id y username
	const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });

	res.json({
		token,
		user: {
			id: user.id,
			username: user.username,
			fullName: user.fullName,
		},
	});
});

// Router agrupado para las rutas /api
const apiRouter = express.Router();

// Devuelve el contenido de un JSON estatico o envia errores simples
const respondWithFile = (res, relativePath) => {
	try {
		const data = readJSON(relativePath);
		if (!data) {
			return res.status(404).json({ message: "Recurso no encontrado" });
		}
		return res.json(data);
	} catch (error) {
		console.error(`Error leyendo ${relativePath}`, error);
		return res.status(500).json({ message: "No se pudo leer el archivo" });
	}
};

// Rutas que entregan exactamente el mismo JSON que usaban los ejercicios originales
apiRouter.get("/cats/cat.json", (req, res) => respondWithFile(res, path.join("cats", "cat.json")));
apiRouter.get("/sell/publish.json", (req, res) => respondWithFile(res, path.join("sell", "publish.json")));
apiRouter.get("/cart/buy.json", (req, res) => respondWithFile(res, path.join("cart", "buy.json")));

apiRouter.get("/cats_products/:file", (req, res) => {
	const fileName = req.params.file;
	return respondWithFile(res, path.join("cats_products", fileName));
});

apiRouter.get("/products/:file", (req, res) => {
	const fileName = req.params.file;
	return respondWithFile(res, path.join("products", fileName));
});

apiRouter.get("/products_comments/:file", (req, res) => {
	const fileName = req.params.file;
	return respondWithFile(res, path.join("products_comments", fileName));
});

apiRouter.get("/user_cart/:file", (req, res) => {
	const fileName = req.params.file;
	return respondWithFile(res, path.join("user_cart", fileName));
});

// Todas las rutas /api requieren token y usan el router anterior
app.use("/api", authorize, apiRouter);

// Guarda el carrito con inserts simples (sin transacciones complejas para mantenerlo didactico)
const insertCart = async ({ userId, items, shipping, payment, totals }) => {
	// Convertimos el numero de puerta a entero (o 0 si viene vacio)
	const numeroPuerta = parseInt(shipping?.number, 10);
	// Guardamos la direccion vinculada al usuario
	const direccionResult = await run(
		`INSERT INTO Direccion (IdUsuario, Departamento, Numero, Localidad, Calle, Esquina)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		[
			userId,
			shipping?.department || "",
			Number.isNaN(numeroPuerta) ? 0 : numeroPuerta,
			shipping?.city || "",
			shipping?.street || "",
			shipping?.corner || "",
		]
	);

	// Creamos la compra principal con el total enviado desde el frontend
	const totalCompra = Number(totals?.total) || 0;
	const compraResult = await run(
		`INSERT INTO Compra (IdUsuario, TipoEnvio, Direccion, FormaPago, Total)
		 VALUES (?, ?, ?, ?, ?)`,
		[
			userId,
			shipping?.method || "standard",
			direccionResult.lastID,
			payment?.method || "unknown",
			totalCompra,
		]
	);

	// Por cada item del carrito guardamos su cantidad
	for (const item of items) {
		await run(
			`INSERT INTO CompraProducto (IdProducto, IdCompra, Cantidad)
			 VALUES (?, ?, ?)`,
			[item.id, compraResult.lastID, item.quantity || 1]
		);
	}

	// Devolvemos el id de la compra para mostrarlo en el frontend
	return compraResult.lastID;
};

// Endpoint de carrito: valida datos basicos y delega en insertCart
app.post("/cart", authorize, async (req, res) => {
	// El frontend envia los productos, datos de envio y totales en el body
	const { items, shipping, payment, totals } = req.body;

	// Si no hay productos devolvemos error antes de tocar la base
	if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ message: "Se requiere al menos un producto en el carrito" });
	}

	try {
		// Guardamos todo y obtenemos el id de la compra almacenada
		const cartId = await insertCart({
			userId: req.user.id,
			items,
			shipping,
			payment,
			totals,
		});

		return res.status(201).json({
			message: "Carrito almacenado correctamente",
			cartId,
		});
	} catch (error) {
		console.error("Error guardando carrito", error);
		return res.status(500).json({ message: "No se pudo guardar el carrito" });
	}
});

// Respuesta generica para rutas inexistentes
app.use((req, res) => {
	res.status(404).json({ message: "Ruta no encontrada" });
});

// Levantamos el servidor HTTP en el puerto indicado
app.listen(PORT, () => {
	console.log(`Escuchando en http://localhost:${PORT}`);
});
