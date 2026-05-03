require('dotenv').config();

const app = require('./src/app.js');
const connectDB = require('./src/config/db'); 

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});