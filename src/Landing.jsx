import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import Navbar from "./components/Navbar";
import LandingDesign from "./components/LandingDesign";
import { useCarrito } from "./CarritoContext";
import Cookies from 'js-cookie';

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  const navigate = useNavigate();
  const { agregarAlCarrito, isLoggedIn, setIsLoggedIn, userId, setUserId } = useCarrito();

  useEffect(() => {
    const id = Cookies.get("id_usuario");
    setUserId(id);
    setIsLoggedIn(!!id);
  }, [setUserId, setIsLoggedIn]);

  const fetchData = async () => {
    try {
      const [productosResponse, ofertasResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/productos`),
        axios.get(`${import.meta.env.VITE_API_URL}/ofertas`),
      ]);

      const productosData = productosResponse.data;
      setProductos(productosData.filter((product) => !product.esPromocion));

      const ofertasData = ofertasResponse.data;
      const ofertasConProductos = ofertasData
        .filter((oferta) => oferta.estado)
        .map((oferta) => {
          const producto = productosData.find((p) => p.id_producto === oferta.id_producto);
          return producto
            ? {
                ...producto,
                precioOferta: oferta.precio_oferta,
                descuento: oferta.descuento,
              }
            : null;
        })
        .filter(Boolean);

      setOfertas(ofertasConProductos);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (userId && justLoggedIn === "true") {
      setShowWelcomeModal(true);
      sessionStorage.removeItem("justLoggedIn");
    }
  }, [userId]);

  const handleAgregarAlCarrito = async (producto) => {
    if (!isLoggedIn) {
      setModalMessage("Debes iniciar sesión para agregar productos al carrito.");
      setShowModal(true);
      return;
    }

    try {
      await agregarAlCarrito(producto);
      setAddedProduct(producto);
      setShowAddedModal(true);
      setTimeout(() => {
        setShowAddedModal(false);
        setAddedProduct(null);
      }, 3000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      setModalMessage("Error al agregar el producto al carrito");
      setShowModal(true);
    }
  };

  const filteredProducts = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#111827] font-['Montserrat'] min-h-screen flex flex-col">
      <Navbar />
      <LandingDesign 
        ofertas={ofertas}
        productos={filteredProducts}
        handleAgregarAlCarrito={handleAgregarAlCarrito}
      />
      
      {showWelcomeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-2 max-w-md mx-auto relative">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 font-['Montserrat']"
            >
              ×
            </button>
            <div>
              <img
                src="https://i.imgur.com/VKWh0mU.jpeg"
                alt="Imagen de bienvenida"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {showAddedModal && addedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-6 max-w-md mx-auto flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src={addedProduct.foto} 
                alt={addedProduct.nombre} 
                className="w-16 h-16 object-cover rounded-md" 
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-white text-lg font-semibold font-['Montserrat']">{addedProduct.nombre}</h3>
              <p className="text-blue-400 text-sm font-['Montserrat']">Se agregó al carrito</p>
            </div>
            <div className="flex-shrink-0 text-blue-400">
              <FaCheckCircle size={24} />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-6 relative max-w-md mx-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 font-['Montserrat']"
            >
              ×
            </button>
            <p className="text-white text-lg text-center font-['Montserrat']">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;