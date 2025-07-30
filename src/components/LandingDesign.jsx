import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import logoFooter from "/src/assets/img/logo_footer.png";

const LandingDesign = ({ ofertas = [], productos = [], handleAgregarAlCarrito }) => {
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
              className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-300 shadow-lg"
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
            <p className="text-blue-600 font-bold text-2xl">${producto.precio.toFixed(2)}</p>
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
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Bienvenido a nuestra tienda
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre los mejores productos con ofertas increíbles
            </p>
          </div>
        </div>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center text-blue-600">
              Ofertas Especiales
            </h2>
            <div className="flex justify-center flex-wrap gap-8">
              {ofertas.map((oferta) => (
                <div
                  key={oferta.id_producto}
                  className={`w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 m-2 transition-all duration-500 transform hover:scale-105 hover:rotate-1 relative overflow-hidden group hover:shadow-2xl
                    ${oferta.descuento === Math.max(...ofertas.map(o => o.descuento)) ? 'ring-4 ring-blue-500 shadow-2xl shadow-blue-500/30 animate-bounce-slow' : ''}`}
                >
                  <div className={`absolute top-0 right-0 ${
                    oferta.descuento === Math.max(...ofertas.map(o => o.descuento))
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 text-lg font-bold animate-pulse'
                      : 'bg-blue-500 px-3 py-1 text-sm'
                  } text-white rounded-bl-md font-bold z-10 shadow-md`}>
                    {oferta.descuento}% OFF
                  </div>
                  <div className="relative mb-4 overflow-hidden rounded-md">
                    <img 
                      src={oferta.imagen || oferta.foto}
                      alt={oferta.nombre}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleAgregarAlCarrito(oferta)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                      >
                        <FaShoppingCart />
                        <span>Agregar al carrito</span>
                      </button>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{oferta.nombre}</h2>
                  <p className="text-sm text-gray-600 mb-3 font-light">{oferta.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm line-through text-gray-400 font-light">${oferta.precio}</p>
                    <p className="text-2xl font-bold text-blue-600">${oferta.precioOferta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-blue-600 text-3xl font-bold mb-8 text-center">
              Productos:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((producto) => (
                <ProductCard 
                  key={producto.id_producto}
                  producto={producto}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-gray-800 py-8">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-600 mt-4 font-light">© 2024 Reviere Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
};

export default LandingDesign;