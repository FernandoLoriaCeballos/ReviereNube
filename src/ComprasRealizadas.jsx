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
    <div className="bg-[#111827] font-['Montserrat'] min-h-screen flex flex-col">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      
      {/* Integración de la nueva Navbar */}
      <Navbar />

      <main className="container mx-auto px-4 pb-12 flex-grow">
        <h2 className="text-white text-xl font-bold mt-8 mb-6">Mis Compras Realizadas</h2>
        
        <div className="bg-[#202938] rounded-lg p-6">
          {currentCompras.length === 0 ? (
            <p className="text-white">No has realizado ninguna compra.</p>
          ) : (
            <table className="w-full text-white">
              <thead>
                <tr>
                  <th className="text-left pb-4">Numero de Ticket</th>
                  <th className="text-left pb-4 text-center">Detalle</th>
                  <th className="text-left pb-4 text-center">Total</th>
                  <th className="text-left pb-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentCompras.map((compra) => (
                  <tr key={compra.id_recibo} className="border-b border-gray-700">
                    <td className="py-4 text-center">{compra.id_recibo}</td>
                    <td className="py-4 text-center">{compra.detalle}</td>
                    <td className="py-4 text-center">${compra.precio_total}</td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => abrirModalResena(compra.id_recibo)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
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
          <div className="flex justify-center mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-gray-700 text-white px-3 py-1 mx-1 rounded hover:bg-gray-600 transition duration-300"
            >
              &lt;
            </button>
            {[...Array(Math.ceil(compras.length / comprasPerPage)).keys()].map(num => (
              <button
                key={num + 1}
                onClick={() => paginate(num + 1)}
                className={`bg-gray-700 text-white px-3 py-1 mx-1 rounded hover:bg-gray-600 transition duration-300 ${currentPage === num + 1 ? 'bg-blue-600' : ''}`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(compras.length / comprasPerPage)}
              className="bg-gray-700 text-white px-3 py-1 mx-1 rounded hover:bg-gray-600 transition duration-300"
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {resenaAbierta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#202938] p-8 rounded-lg w-full max-w-md">
            <h2 className="text-white text-xl font-bold mb-6">Escribir Reseña</h2>
            <div className="mb-4">
              <label htmlFor="comentario" className="block text-white mb-2">Comentario:</label>
              <textarea
                id="comentario"
                name="comentario"
                value={resenaActual.comentario}
                onChange={handleResenaChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
                rows="4"
              ></textarea>
            </div>
            <div className="mb-6">
              <label htmlFor="calificacion" className="block text-white mb-2">Calificación:</label>
              <select
                id="calificacion"
                name="calificacion"
                value={resenaActual.calificacion}
                onChange={handleResenaChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
              >
                <option value="1">1 Estrella</option>
                <option value="2">2 Estrellas</option>
                <option value="3">3 Estrellas</option>
                <option value="4">4 Estrellas</option>
                <option value="5">5 Estrellas</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={enviarResena}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
              >
                Enviar Reseña
              </button>
              <button
                onClick={() => setResenaAbierta(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#111827] text-white py-4 mt-auto">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ComprasRealizadas;