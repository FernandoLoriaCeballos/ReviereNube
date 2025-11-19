// /src/pages/Cancel.jsx - Versión simple
import React from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>😔 Pago Cancelado</h1>
      <p>El pago no se completó. Puedes intentarlo nuevamente.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/landing" style={{ marginRight: '10px' }}>
          <button>Volver a Comprar</button>
        </Link>
        <Link to="/carrito">
          <button>Ver Carrito</button>
        </Link>
      </div>
    </div>
  );
};

export default Cancel;