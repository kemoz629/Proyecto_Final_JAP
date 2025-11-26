PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Usuario (
  Id INTEGER PRIMARY KEY,
  Nombre TEXT NOT NULL,
  Apellido TEXT NOT NULL,
  Email TEXT NOT NULL UNIQUE,
  Telefono TEXT
);

CREATE TABLE IF NOT EXISTS Categoria (
  Id INTEGER PRIMARY KEY,
  Nombre TEXT NOT NULL,
  Descripcion TEXT,
  CantProduct INTEGER,
  Imagen TEXT
);

CREATE TABLE IF NOT EXISTS Producto (
  Id INTEGER PRIMARY KEY,
  Nombre TEXT NOT NULL,
  Descripcion TEXT,
  Categoria INTEGER NOT NULL,
  Costo REAL NOT NULL,
  Moneda TEXT NOT NULL,
  CantVendidos INTEGER DEFAULT 0,
  Imagen TEXT,
  FOREIGN KEY (Categoria) REFERENCES Categoria(Id)
);

CREATE TABLE IF NOT EXISTS Comentario (
  Id INTEGER PRIMARY KEY,
  IdProducto INTEGER NOT NULL,
  IdUsuario INTEGER NOT NULL,
  Calificacion INTEGER CHECK (Calificacion BETWEEN 1 AND 5),
  Descripcion TEXT,
  Fecha TEXT NOT NULL,
  FOREIGN KEY (IdProducto) REFERENCES Producto(Id),
  FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id)
);

CREATE TABLE IF NOT EXISTS Direccion (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  IdUsuario INTEGER NOT NULL,
  Departamento TEXT NOT NULL,
  Numero INTEGER NOT NULL,
  Localidad TEXT NOT NULL,
  Calle TEXT NOT NULL,
  Esquina TEXT,
  FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id)
);

CREATE TABLE IF NOT EXISTS Compra (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  IdUsuario INTEGER NOT NULL,
  TipoEnvio TEXT NOT NULL,
  Direccion INTEGER NOT NULL,
  FormaPago TEXT NOT NULL,
  Total REAL NOT NULL,
  FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id),
  FOREIGN KEY (Direccion) REFERENCES Direccion(Id)
);

CREATE TABLE IF NOT EXISTS CompraProducto (
  IdProducto INTEGER NOT NULL,
  IdCompra INTEGER NOT NULL,
  Cantidad INTEGER NOT NULL CHECK (Cantidad > 0),
  PRIMARY KEY (IdProducto, IdCompra),
  FOREIGN KEY (IdProducto) REFERENCES Producto(Id),
  FOREIGN KEY (IdCompra) REFERENCES Compra(Id)
);

CREATE TABLE IF NOT EXISTS Carrito (
  IdProducto INTEGER NOT NULL,
  IdUsuario INTEGER NOT NULL,
  CantProducto INTEGER,
  PRIMARY KEY (IdProducto, IdUsuario),
  FOREIGN KEY (IdProducto) REFERENCES Producto(Id),
  FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id)
);
