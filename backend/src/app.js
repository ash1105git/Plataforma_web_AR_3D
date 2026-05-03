const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a productos
const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);

// Conexión a autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);
 

app.get('/', (req, res) => {
  res.send('API funcionando');
});


app.get('/test', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente' });
});

module.exports = app;