const express = require("express");
const app = express();
const puerto = 3000;


const listaCart = require('./data/cart/buy.json');
const listaUser = require('./data/user_cart/25801.json');
const listaSell = require('./data/sell/publish.json');
const listaCat = require('./data/cats/cat.json');

app.get('/api/cart', (req, res) => {
  res.json(listaCart);
});

app.get('/api/user', (req, res) => {
  res.json(listaUser);
});


app.get('/api/sell', (req, res) => {
  res.json(listaSell);
});

app.get('/api/cat', (req, res) => {
  res.json(listaCat);
});

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});