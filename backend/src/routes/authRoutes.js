const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const Admin = require('../models/Admin');

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ error: 'Usuario no existe' });
    }

    const passwordValido = await bcrypt.compare(password, admin.password);

    if (!passwordValido) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ mensaje: 'Login exitoso' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;