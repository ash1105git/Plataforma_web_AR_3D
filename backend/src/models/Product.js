const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String
  },
  imagen: {
    type: String // ruta o URL
  },
  modelo3D: {
    type: String // archivo .glb
  },
  categoria: {
    type: String
  },
  tags: {
    type: [String] // array de etiquetas
  },
  badge: {
    type: String, // nuevo, raro, etc.
    default: 'normal'
  }

}, { 
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);