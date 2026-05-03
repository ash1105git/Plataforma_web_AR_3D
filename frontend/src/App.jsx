import { useEffect, useState } from 'react';
import { getProducts } from './services/api';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(data => {
      console.log(data);
      setProducts(data);
    });
  }, []);

  return (
    <div>
      <h1>Productos</h1>

      {products.map((p) => (
        <div key={p._id}>
          <h3>{p.nombre}</h3>
          <p>${p.precio}</p>
        </div>
      ))}
    </div>
  );
}

export default App;