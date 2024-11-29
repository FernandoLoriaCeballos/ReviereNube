import React, { useState } from 'react';
import axios from 'axios';

const GenerarResenas = () => {
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/generar-resenas', { cantidad });
      setMensaje(response.data.message);
    } catch (error) {
      setMensaje('Error al generar reseñas falsas');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Generar Reseñas Falsas</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="cantidad" className="block mb-2">Cantidad de reseñas a generar:</label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            min="1"
            className="border rounded px-2 py-1"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Generar Reseñas
        </button>
      </form>
      {mensaje && <p className="text-green-600">{mensaje}</p>}
    </div>
  );
};

export default GenerarResenas;