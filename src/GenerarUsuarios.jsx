import React, { useState } from 'react';
import axios from 'axios';

const GenerarUsuarios = () => {
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  const generarUsuarios = async () => {
    try {
      const response = await axios.post('http://localhost:3000/generar-usuarios', { cantidad });
      setMensaje(`Se generaron ${cantidad} usuarios falsos exitosamente.`);
    } catch (error) {
      setMensaje('Error al generar usuarios falsos.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Generar Usuarios Falsos</h2>
      <input
        type="number"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
        min="1"
      />
      <button onClick={generarUsuarios}>Generar Usuarios</button>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default GenerarUsuarios;