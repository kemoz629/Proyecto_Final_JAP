const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// Necesario para leer JSON del body
app.use(express.json());

// Usuario “de ejemplo” 
const USER = {
  username: "admin",
  password: "1234"
};

// Clave secreta para firmar el token
const SECRET_KEY = "mi_clave_secreta_super_segura";

// POST /login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // Verificar credenciales 
  if (username !== USER.username || password !== USER.password) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  // Generar token JWT
  const token = jwt.sign(
    { username: username },   // payload
    SECRET_KEY,               // clave secreta
    { expiresIn: "1h" }       // tiempo válido
  );
// Responder con el token
  return res.json({
    message: "Login exitoso",
    token: token
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
