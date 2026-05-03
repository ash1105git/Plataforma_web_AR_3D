require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Admin = require('./src/models/Admin');

mongoose.connect(process.env.MONGO_URI);

const crearAdmin = async () => {
  const hash = await bcrypt.hash('123456', 10);

  const admin = new Admin({
    email: 'admin@test.com',
    password: hash
  });

  await admin.save();
  console.log('Admin creado');
  process.exit();
};

crearAdmin();