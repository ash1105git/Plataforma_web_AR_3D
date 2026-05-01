const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.get('/test', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente' });
});

module.exports = app;