import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from './components/Navbar';
import logoFooter from './assets/img/logo_footer.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ComprasRealizadas = () => {
  const [compras, setCompras] = useState([]);
  const [resenaAbierta, setResenaAbierta] = useState(false);
  const [resenaActual, setResenaActual] = useState({ id_recibo: null, comentario: '', calificacion: 5 });
  const [currentPage, setCurrentPage] = useState(1);
  const comprasPerPage = 10;
  const userId = Cookies.get("id_usuario");

  useEffect(() => {
    if (userId) {
      obtenerCompras();
    } else {
      console.error("No se encontró el ID del usuario en las cookies");
    }
  }, [userId]);

  const obtenerCompras = () => {
    axios.get(`${API_URL}/recibos`)
      .then((response) => {
        const comprasFiltradas = response.data.filter(compra => compra.id_usuario === parseInt(userId));
        setCompras(comprasFiltradas);
      })
      .catch((error) => {
        console.error("Error al obtener las compras:", error);
      });
  };

  const abrirModalResena = (id_recibo) => {
    setResenaActual({ id_recibo, comentario: '', calificacion: 5 });
    setResenaAbierta(true);
  };

  const handleResenaChange = (e) => {
    const { name, value } = e.target;
    setResenaActual(prev => ({ ...prev, [name]: value }));
  };

  const enviarResena = () => {
    if (userId) {
      axios.post(`${API_URL}/resenas`, {
        id_producto: resenaActual.id_recibo,
        id_usuario: parseInt(userId),
        calificacion: parseInt(resenaActual.calificacion),
        comentario: resenaActual.comentario
      })
        .then((response) => {
          console.log("Reseña agregada:", response.data);
          setResenaAbierta(false);
        })
        .catch((error) => {
          console.error("Error al agregar la reseña:", error);
        });
    } else {
      console.error("No se encontró el ID del usuario en las cookies");
    }
  };

  // Paginación
  const indexOfLastCompra = currentPage * comprasPerPage;
  const indexOfFirstCompra = indexOfLastCompra - comprasPerPage;
  const currentCompras = compras.slice(indexOfFirstCompra, indexOfLastCompra);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(compras.length / comprasPerPage)));
  
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-gray-50 font-['Montserrat'] min-h-screen flex flex-col">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      
      {/* Integración de la nueva Navbar */}
      <Navbar />

      <main className="container mx-auto px-4 pb-12 flex-grow">
        <h2 className="text-gray-800 text-xl font-bold mt-8 mb-6">Mis Compras Realizadas</h2>
        
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          {currentCompras.length === 0 ? (
            <p className="text-gray-600">No has realizado ninguna compra.</p>
          ) : (
            <table className="w-full text-gray-800">
              <thead>
                <tr>
                  <th className="text-left pb-4 font-semibold">Numero de Ticket</th>
                  <th className="text-left pb-4 text-center font-semibold">Detalle</th>
                  <th className="text-left pb-4 text-center font-semibold">Total</th>
                  <th className="text-left pb-4 text-center font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentCompras.map((compra) => (
                  <tr key={compra.id_recibo} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 text-center">{compra.id_recibo}</td>
                    <td className="py-4 text-center">{compra.detalle}</td>
                    <td className="py-4 text-center font-semibold text-red-600">${compra.precio_total}</td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => abrirModalResena(compra.id_recibo)}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        Escribir reseña
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          <div className="flex justify-center mt-6">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 px-3 py-2 mx-1 rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {[...Array(Math.ceil(compras.length / comprasPerPage)).keys()].map(num => (
              <button
                key={num + 1}
                onClick={() => paginate(num + 1)}
                className={`px-3 py-2 mx-1 rounded-lg transition duration-300 ${
                  currentPage === num + 1 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(compras.length / comprasPerPage)}
              className="bg-gray-200 text-gray-700 px-3 py-2 mx-1 rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {resenaAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-gray-800 text-xl font-bold mb-6">Escribir Reseña</h2>
            <div className="mb-4">
              <label htmlFor="comentario" className="block text-gray-700 mb-2 font-medium">Comentario:</label>
              <textarea
                id="comentario"
                name="comentario"
                value={resenaActual.comentario}
                onChange={handleResenaChange}
                className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
                placeholder="Escribe tu reseña aquí..."
              ></textarea>
            </div>
            <div className="mb-6">
              <label htmlFor="calificacion" className="block text-gray-700 mb-2 font-medium">Calificación:</label>
              <select
                id="calificacion"
                name="calificacion"
                value={resenaActual.calificacion}
                onChange={handleResenaChange}
                className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="1">⭐ 1 Estrella</option>
                <option value="2">⭐⭐ 2 Estrellas</option>
                <option value="3">⭐⭐⭐ 3 Estrellas</option>
                <option value="4">⭐⭐⭐⭐ 4 Estrellas</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Estrellas</option>
              </select>
            </div>
            <div className="flex justify-between gap-4">
              <button
                onClick={enviarResena}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md flex-1"
              >
                Enviar Reseña
              </button>
              <button
                onClick={() => setResenaAbierta(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-300 flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 text-gray-800 py-8 mt-auto">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-600 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ComprasRealizadas;