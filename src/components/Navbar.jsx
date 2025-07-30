import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
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
    // Eliminar todas las cookies existentes
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    
    setUserId(null);
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white text-gray-800 shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link to="/landing">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </Link>
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-2xl focus:outline-none text-gray-700 hover:text-blue-600"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } lg:flex lg:items-center lg:space-x-8 mt-4 lg:mt-0 w-full justify-end`}
        >
          <div className="flex flex-col items-start lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 w-full lg:w-auto">
            <Link
              to="/landing"
              className="block lg:inline hover:text-blue-600 uppercase lg:text-center font-medium transition-colors duration-300"
              onClick={toggleMobileMenu}
            >
              CATÁLOGO DE PRODUCTOS
            </Link>
            <Link
              to="/compras"
              className="block lg:inline hover:text-blue-600 uppercase lg:text-center font-medium transition-colors duration-300"
              onClick={toggleMobileMenu}
            >
              MIS COMPRAS
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 mt-4 lg:mt-0">
            {isLoggedIn && (
              <button
                onClick={handleCarritoClick}
                className="text-2xl hover:text-blue-600 relative transition-colors duration-300"
              >
                <FaShoppingCart />
                {carrito.length > 0 && (
                  <span className="absolute bottom-0 left-0 bg-blue-600 text-white rounded-full px-1 py-0.5 text-xs transform translate-y-1/2 translate-x-1/2">
                    {carrito.reduce((acc, producto) => acc + producto.cantidad, 0)}
                  </span>
                )}
              </button>
            )}
            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button onClick={handleToggleDropdown} className="text-2xl hover:text-blue-600 transition-colors duration-300">
                  <FaUser />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors duration-300"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hover:text-blue-600 uppercase font-medium transition-colors duration-300"
                onClick={toggleMobileMenu}
              >
                INICIAR SESIÓN
              </Link>
            )}
          </div>
        </div>
      </div>

      {carritoAbierto && !isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setCarritoAbierto(false)}
              className="absolute top-4 right-4 text-gray-600 rounded-full p-2 hover:bg-gray-100 transition duration-300"
            >
              X
            </button>

            <h2 className="text-gray-800 text-xl font-bold mb-6">Carrito de compras</h2>

            {isLoading ? (
              <p className="text-gray-600">Cargando carrito...</p>
            ) : carrito.length === 0 ? (
              <div>
                <p className="text-gray-600 mb-6 text-center">El carrito está vacío.</p>
              </div>
            ) : (
              <>
                <table className="w-full text-gray-800 mb-6">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-4 font-semibold">Producto</th>
                      <th className="text-left pb-4 font-semibold">Precio</th>
                      <th className="text-left pb-4 font-semibold">Cantidad</th>
                      <th className="text-left pb-4 font-semibold">Subtotal</th>
                      <th className="text-left pb-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((producto, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4">
                          <div className="flex flex-col">
                            {producto.esPromocion && (
                              <span className="text-orange-500 text-xs font-bold mb-1">Promoción</span>
                            )}
                            <div className="flex items-center">
                              <img src={producto.foto} alt={producto.nombre} className="w-16 h-16 object-cover rounded-md mr-4" />
                              <span>{producto.nombre}</span>
                            </div>
                          </div>
                        </td>
                        <td>${producto.precio}</td>
                        <td>
                          <input
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) => handleCambiarCantidad(producto.id_producto, parseInt(e.target.value))}
                            className="w-16 bg-gray-100 text-gray-800 p-1 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                            min="0"
                          />
                        </td>
                        <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                        <td>
                          <button onClick={() => eliminarDelCarrito(producto.id_producto)} className="text-red-500 hover:text-red-700 transition-colors duration-300">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 mt-6 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value)}
                      className="bg-white text-gray-800 p-2 rounded mr-4 border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={handleAplicarCupon}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                      Aplicar cupón
                    </button>
                  </div>
                  {cuponAplicado && (
                    <p className="text-gray-700 mb-4">
                      Cupón aplicado: {cuponAplicado.codigo} ({cuponAplicado.descuento}% de descuento)
                    </p>
                  )}
                  <p className="text-gray-800 text-2xl font-bold">Total: ${calcularTotal().toFixed(2)}</p>
                </div>
                <div className="mt-6">
                  <PayPalScriptProvider
                    options={{
                      "client-id": "AX1Pjuu9wMgzgvk42SJBkl9VSsrc2Xrc10bvmsnLzmnZFiak55inFnB-WOnS_1BhyMSUYI5IBQS_JP_g",
                      currency: "MXN",
                    }}
                  >
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        const totalPagar = Cookies.get('precio_descuento') || calcularTotal().toFixed(2);
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: totalPagar,
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then((details) => {
                          console.log("Pago completado por " + details.payer.name.given_name);
                          handleRealizarCompra();
                        });
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md mx-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              X
            </button>
            <p className="text-gray-800 text-lg text-center pt-2">{modalMessage}</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;