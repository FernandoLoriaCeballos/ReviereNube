import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

const LandingDesign = ({ ofertas = [], productos = [], handleAgregarAlCarrito, getNombreEmpresa }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isHovered, setIsHovered] = useState({});

  // Función de filtrado mejorada
  const filteredProducts = productos.filter(producto => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(searchLower) ||
      getNombreEmpresa(producto.id_empresa).toLowerCase().includes(searchLower) ||
      producto.precio.toString().includes(searchLower)
    );
  });

  const ProductCard = ({ producto }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img 
            src={producto.foto} 
            alt={producto.nombre} 
            className="w-full h-64 object-cover transition-all duration-300 transform hover:scale-110" 
          />
          <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAgregarAlCarrito(producto);
              }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <FaShoppingCart />
              <span>Agregar al carrito</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-gray-800 text-xl font-bold mb-2">{producto.nombre}</h3>
          <p className="text-gray-600 mb-4 h-12 overflow-hidden font-light">{producto.descripcion}</p>
          <div className="flex justify-between items-center">
            <p className="text-red-600 font-bold text-2xl">${producto.precio.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&display=swap');
          
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite;
          }
          
          * {
            font-family: 'Montserrat', sans-serif;
          }
        `}
      </style>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <header className="relative bg-gradient-to-r from-red-500 to-orange-500 py-12">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Descubre productos increíbles</h1>
              <p className="text-sm md:text-base text-white/90 mb-6">Calidad y una selección pensada para ti.</p>
                    <input
                      aria-label="Buscar"
                      type="text"
                      placeholder="Busca por producto, sucursal o precio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 rounded-full text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 z-40 relative"
                    />
            </div>
          </div>
        </header>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Nuestros Productos
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto"></div>
              </div>

              {/* Grid más compacto con animación naranja en hover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((producto) => (
                  <div 
                    key={producto._id}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(251,146,60,0.3)] group"
                    onMouseEnter={() => setIsHovered({...isHovered, [producto._id]: true})}
                    onMouseLeave={() => setIsHovered({...isHovered, [producto._id]: false})}
                  >
                    <div className="relative">
                      <img 
                        src={producto.foto} 
                        alt={producto.nombre} 
                        className="w-full h-40 object-cover transition-all duration-300 transform group-hover:scale-110" 
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/60 to-red-500/60 flex items-center justify-center transition-opacity duration-300 ${
                        isHovered[producto._id] ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAgregarAlCarrito(producto);
                          }}
                          className="bg-white text-gray-800 px-3 py-1.5 rounded-full flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <FaShoppingCart className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium">Agregar al carrito</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">
                          {producto.nombre}
                        </h3>
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm ml-2">
                          {getNombreEmpresa(producto.id_empresa)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{producto.descripcion}</p>
                      <div className="text-lg font-bold text-orange-500">
                        ${producto.precio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-xl">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Footer Mejorado */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2024 Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default LandingDesign;