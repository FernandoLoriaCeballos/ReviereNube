import React, { useState } from 'react';
import axios from 'axios';

const GenerarCompras = () => {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comprasGeneradas, setComprasGeneradas] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setComprasGeneradas(null);

    try {
      const response = await axios.post('http://localhost:3000/generar-compras', { cantidad });
      setComprasGeneradas(response.data);
    } catch (error) {
      setError('Error al generar compras falsas: ' + (error.response?.data?.message || error.message));
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a
            href="/landing"
            className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-700"
          >
            ← Volver al inicio
          </a>
        </div>

        {/* Formulario */}
        <div className="bg-[#1F2937] rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Generador de Compras de Prueba
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-200">
                Cantidad de compras a generar
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  id="cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese la cantidad"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors
                    ${loading 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                    }`}
                >
                  {loading ? 'Generando...' : 'Generar Compras'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-lg p-4">
                <h3 className="font-medium">Error</h3>
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Resultados */}
        {comprasGeneradas && (
          <div className="bg-[#1F2937] rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Compras Generadas
            </h2>

            <div className="bg-green-900/50 border border-green-500 text-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium">¡Éxito!</h3>
              <p>{comprasGeneradas.message}</p>
            </div>

            <div className="space-y-4">
              {comprasGeneradas.compras.map((compra, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-gray-400">ID Compra:</span> {compra.id_compra}
                    </div>
                    <div>
                      <span className="text-gray-400">Usuario:</span> {compra.usuario}
                    </div>
                    <div>
                      <span className="text-gray-400">Fecha:</span> {compra.fecha}
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span> ${compra.total.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Productos:</span>
                    <ul className="mt-2 space-y-1">
                      {compra.productos.map((producto, prodIndex) => (
                        <li key={prodIndex} className="text-sm">
                          {producto.cantidad}x {producto.nombre} - ${producto.precio_unitario} c/u 
                          (Subtotal: ${producto.subtotal})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerarCompras;