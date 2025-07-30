import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from "/src/CarritoContext";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "/src/assets/img/logo.png";

const Navbar = () => {
  const {
    carrito,
    eliminarDelCarrito,
    cambiarCantidad,
    vaciarCarrito,
    cuponAplicado,
    aplicarCupon,
    isLoading,
    isLoggedIn,
    setIsLoggedIn,
    userId,
    setUserId
  } = useContext(CarritoContext);

  const [codigoCupon, setCodigoCupon] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentUserId = Cookies.get("id_usuario");
    setIsLoggedIn(!!currentUserId);
  }, [setIsLoggedIn]);

  const calcularTotal = () => {
    let subtotal = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    if (cuponAplicado && cuponAplicado.descuento) {
      const descuento = (subtotal * cuponAplicado.descuento) / 100;
      subtotal = subtotal - descuento;
      Cookies.set('precio_descuento', subtotal.toFixed(2));
    } else {
      Cookies.remove('precio_descuento');
    }
    return subtotal;
  };

  const handleAplicarCupon = async () => {
    try {
      const cupon = await aplicarCupon(codigoCupon);
      if (cupon) {
        const subtotal = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
        const descuento = (subtotal * cupon.descuento) / 100;
        const totalConDescuento = subtotal - descuento;

        Cookies.set('precio_descuento', totalConDescuento.toFixed(2));

        setModalMessage(`Cupón aplicado: ${cupon.codigo} (${cupon.descuento}% de descuento)`);
        setShowModal(true);
        setCodigoCupon("");
      } else {
        setModalMessage("El cupón ingresado no es válido.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error al aplicar cupón:", error);
      setModalMessage("Error al aplicar el cupón");
      setShowModal(true);
    }
  };

  const handleCambiarCantidad = (id_producto, cantidad) => {
    if (cantidad === 0) {
      eliminarDelCarrito(id_producto);
    } else {
      cambiarCantidad(id_producto, cantidad);
      if (cuponAplicado) {
        calcularTotal();
      }
    }
  };

  const handleCarritoClick = () => {
    if (isMobileView) {
      navigate("/carrito");
    } else {
      setCarritoAbierto(true);
    }
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRealizarCompra = async () => {
    const userIdFromCookies = Cookies.get("id_usuario");
    if (!userIdFromCookies) {
      setModalMessage("Debe iniciar sesión para realizar la compra");
      setShowModal(true);
      return;
    }

    try {
      const detalleCompra = carrito.map((producto) => ({
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
      }));

      const precioFinal = Cookies.get('precio_descuento') || calcularTotal().toFixed(2);

      const compraData = {
        id_usuario: parseInt(userIdFromCookies),
        productos: detalleCompra,
        cupon_aplicado: cuponAplicado,
        total: parseFloat(precioFinal)
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/recibos`, 
        compraData
      );

      if (response.status === 201) {
        Cookies.remove('precio_descuento');
        await vaciarCarrito();
        setModalMessage("¡Compra realizada exitosamente!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setCarritoAbierto(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      setModalMessage("Hubo un error al procesar la compra. Por favor, intente de nuevo.");
      setShowModal(true);
    }
  };

  const handleLogout = () => {
    Cookies.remove("id_usuario");
    Cookies.remove("id_empresa");
    Cookies.remove("id_empleado");
    Cookies.remove("rol");
    Cookies.remove("precio_descuento");
    setUserId(null);
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-[#111827] text-white">
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link to="/landing">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </Link>
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-2xl focus:outline-none"
            >
              {isMobileMenuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} lg:flex lg:items-center lg:space-x-8 mt-4 lg:mt-0 w-full justify-end`}>
          <div className="flex flex-col items-start lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 w-full lg:w-auto">
            <Link to="/landing" className="block lg:inline hover:text-blue-500 uppercase lg:text-center" onClick={toggleMobileMenu}>
              CATÁLOGO DE PRODUCTOS
            </Link>
            <Link to="/compras" className="block lg:inline hover:text-blue-500 uppercase lg:text-center" onClick={toggleMobileMenu}>
              MIS COMPRAS
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 mt-4 lg:mt-0">
            {isLoggedIn && (
              <button onClick={handleCarritoClick} className="text-2xl hover:text-blue-500 relative">
                <FaShoppingCart />
                {carrito.length > 0 && (
                  <span className="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full px-1 py-0.5 text-xs transform translate-y-1/2 translate-x-1/2">
                    {carrito.reduce((acc, producto) => acc + producto.cantidad, 0)}
                  </span>
                )}
              </button>
            )}
            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button onClick={handleToggleDropdown} className="text-2xl hover:text-blue-500">
                  <FaUser />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#202938] rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-white hover:bg-[#2d3748] w-full text-left"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-blue-500 uppercase" onClick={toggleMobileMenu}>
                INICIAR SESIÓN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
