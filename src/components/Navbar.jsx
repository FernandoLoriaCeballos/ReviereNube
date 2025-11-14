import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from "/src/CarritoContext";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "/src/assets/img/logo.png";
// import oxxoLogo from "/src/assets/img/oxxo_logo.png";
// import OxxoPayButton from "./OxxoPayButton";

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

  // ----------------------------------------------------------------
  // MODIFICACIÓN CLAVE: Esta función ahora redirige a /checkout (Stripe)
  // en lugar de realizar la compra directamente.
  // ----------------------------------------------------------------
  const handleCheckoutClick = async () => {
  try {
    console.log('🛒 Carrito actual:', carrito);
    console.log('👤 User ID:', Cookies.get("id_usuario"));
    
    // Validar que el carrito no esté vacío
    if (!carrito || carrito.length === 0) {
      setModalMessage("El carrito está vacío");
      setShowModal(true);
      return;
    }

    // Preparar los datos para enviar
    const checkoutData = {
      items: carrito.map(producto => ({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: producto.cantidad,
        foto: producto.foto,
        descripcion: producto.descripcion || `Producto: ${producto.nombre}`
      })),
      userId: Cookies.get("id_usuario")
    };

    console.log('📤 Enviando al backend:', checkoutData);

    const response = await fetch('http://localhost:3000/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta del backend:', data);

    if (data.url) {
      // Redirigir a Stripe Checkout
      window.location.href = data.url;
    } else {
      throw new Error('No se recibió URL de checkout');
    }
  } catch (error) {
    console.error('❌ Error al iniciar el pago:', error);
    setModalMessage(`Error: ${error.message}`);
    setShowModal(true);
  }
};

  // La función handleRealizarCompra se mantiene por si es usada en otro lugar, 
  // pero ya no será el destino del botón principal.
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

  const handleOxxoPayment = async () => {
    const clienteId = userId;
    const precioFinal = Cookies.get('precio_descuento') || calcularTotal().toFixed(2);
    const monto = parseFloat(precioFinal).toFixed(2);
    const clienteEmail = "ejemplo@cliente.com"; // Replace with actual user email

    if (!clienteId) {
      // Usar el modal en lugar de alert
      setModalMessage("Debes iniciar sesión para generar un pago OXXO.");
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch("/api/oxxo-pay", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: monto,
          email: clienteEmail,
          user_id: clienteId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Usar el modal en lugar de alert
        setModalMessage(`¡Referencia OXXO generada! Ref: ${data.reference}. Paga antes de: ${data.expirationDate}`);
        setShowModal(true);
      } else {
        // Usar el modal en lugar de alert
        setModalMessage(`Error al generar la referencia de OXXO: ${data.error || 'Intente de nuevo.'}`);
        setShowModal(true);
      }

    } catch (error) {
      // Usar el modal en lugar de alert
      setModalMessage("Ocurrió un error de conexión con el servidor.");
      setShowModal(true);
    }
  };

  const handleLogout = () => {
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

  const DireccionBlock = (
        <div className="py-6 border-t border-gray-200 mt-6"> 
            <h2 className="text-gray-800 text-xl font-bold mb-4">Agregar dirección de entrega o recolección</h2>
            <button className="bg-yellow-400 text-gray-800 px-4 py-3 rounded-md font-semibold hover:bg-yellow-500 transition-colors duration-300 mr-4">
                Agregar una nueva dirección de entrega
            </button>
            <button className="bg-white text-gray-800 border border-gray-300 px-4 py-3 rounded-md font-normal hover:bg-gray-50 transition-colors duration-300">
                Encuentra una ubicación de recolección cercana
            </button>
        </div>
    );

    // FUNCIÓN AÑADIDA PARA CALCULAR LOS VALORES DEL RESUMEN DE COMPRA
    const calcularResumen = () => {
        const subtotal = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
        // const ivaRate = 0.16; // Asumimos un 16% de IVA
        const costoEnvio = 0.00;
        let totalFinal = subtotal;

        if (cuponAplicado && cuponAplicado.descuento) {
            const descuento = (subtotal * cuponAplicado.descuento) / 100;
            totalFinal = subtotal - descuento;
        }

        // const iva = totalFinal * ivaRate;
        // const totalConIVA = totalFinal + iva + costoEnvio;

        const formatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN', 
            minimumFractionDigits: 2,
        });

        if (carrito.length === 0) {
            return { productos: formatter.format(0.00), envio: '--', total: formatter.format(0.00) }; 
        }

        return {
            productos: formatter.format(totalFinal),
            envio: '--',
            // total: formatter.format(totalConIVA)
        };
    };

    const resumen = calcularResumen();

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
              to="/suscripciones"
              className="block lg:inline hover:text-blue-600 uppercase lg:text-center font-medium transition-colors duration-300"
              onClick={toggleMobileMenu}
            >
              Metodos de Suscripcion
            </Link>
            <Link
              to="/compras"
              className="block lg:inline hover:text-blue-600 uppercase lg:text-center font-medium transition-colors duration-300"
              onClick={toggleMobileMenu}
            >
              MIS COMPRAS
            </Link>
          </div>
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

      {/* MODAL DEL CARRITO */}
      {carritoAbierto && !isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-5xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setCarritoAbierto(false)}
              className="absolute top-4 right-4 text-gray-600 rounded-full p-2 hover:bg-gray-100 transition duration-300 z-10"
            >
              X
            </button>

            {/* CONTENIDO MODAL REDISEÑADO */}
            <div className="flex flex-row">
                
                {/* 1. Columna Izquierda: Productos y Pago */}
                <div className="w-2/3 pr-10 border-r border-gray-100"> 
                    
                    {/* 1. SECCIÓN DE PRODUCTOS */}
                    <div className="py-6 border-b border-gray-200">
                        <h2 className="text-gray-800 text-xl font-bold mb-6">Artículos en Carrito</h2>
                        {carrito.length > 0 ? (
                            <table className="w-full text-gray-800">
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
                                                        {/* Asumo que 'foto' es una URL o ruta válida */}
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
                        ) : (
                            <p className="text-gray-600">El carrito está vacío. Agrega productos para continuar.</p>
                        )}
                    </div>
                    
                    {/* 2. SECCIÓN DE TOTAL Y MÉTODOS DE PAGO */}
                    <div className="py-6 border-b border-gray-200">
                        <h2 className="text-gray-800 text-xl font-bold mb-3 text-center">Opciones de Pago</h2>
                        
                        {carrito.length > 0 ? (
                            <>
                                {/* Formulario de Cupón */}
                                {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Aplicar Cupón</h3>
                                     <div className="flex items-center">
                                        <input
                                            type="text"
                                            placeholder="Código de cupón"
                                            value={codigoCupon}
                                            onChange={(e) => setCodigoCupon(e.target.value)}
                                            className="bg-white text-gray-800 p-2 rounded mr-4 border border-gray-300 focus:border-blue-500 focus:outline-none flex-grow"
                                        />
                                        <button
                                            onClick={handleAplicarCupon}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                    {cuponAplicado && (
                                        <p className="text-gray-700 mt-2 text-sm font-medium text-green-600">
                                            Cupón aplicado: {cuponAplicado.codigo} ({cuponAplicado.descuento}% de descuento)
                                        </p>
                                    )}
                                </div> */}
                                
                                {/* Contenedor de Opciones de Pago */}
                                <div className="flex flex-col items-center space-y-4 w-full">
                                    {/* Botón de Pagar con PayPal */}
                                    <PayPalScriptProvider>
                                        <PayPalButtons
                                            createOrder={(data, actions) => {
                                                const totalPagar = Cookies.get('precio_descuento') || calcularTotal().toFixed(2);
                                                return actions.order.create({
                                                    purchase_units: [{ amount: { value: totalPagar } }],
                                                });
                                            }}
                                            onApprove={(data, actions) => {
                                                return actions.order.capture().then((details) => {
                                                    console.log("Pago completado por " + details.payer.name.given_name);
                                                    handleRealizarCompra(); //  la lógica de vaciar carrito, etc.
                                                });
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                    
                                    {/* Botón de Pagar con OXXO */}
                                    {/* <OxxoPayButton 
                                        onClick={handleOxxoPayment} 
                                        logoSrc={oxxoLogo} 
                                        label="Pagar en Efectivo OXXO"
                                    /> */}
                                </div>
                                
                            </>
                        ) : (
                            <p className="text-gray-600">Agrega productos para ver las opciones de pago.</p>
                        )}
                    </div>

                    {/* 3. SECCIÓN DE DIRECCIÓN */}
                    {/* {DireccionBlock} */}

                </div>

                {/* 2. Columna Derecha: Resumen de Compra y Botón Checkout */}
                <div className="w-1/3 pl-10">
                    
                    {/* Resumen de Detalles */}
                    <div className="pt-6">
                        <h2 className="text-gray-800 text-xl font-bold mb-4">Resumen de Compra</h2>
                        <div className="flex justify-between text-gray-800 mb-2">
                            <span>Productos:</span>
                            <span>{resumen.productos}</span>
                        </div>
{/*                         <div className="flex justify-between text-gray-800 pb-4 border-b border-gray-200">
                            <span>IVA:</span>
                            <span>{resumen.envio}</span>
                        </div> */}

                        <div className="mt-4 flex justify-between items-center">
                            <span className="font-semibold text-gray-800 text-lg">Total</span>
                            <span className="font-bold text-gray-800 text-2xl ml-4">{resumen.total}</span> 
                        </div>
                    </div>

                    {/* Botón de Continuar a Checkout (Stripe) */}
                    <div className={`p-4 rounded-lg text-center mt-6 ${carrito.length > 0 ? 'bg-yellow-50' : 'bg-gray-100'}`}>
                        <button 
                            onClick={handleCheckoutClick} 
                            disabled={carrito.length === 0}
                            className={`w-full py-3 rounded-lg font-bold text-lg transition-colors duration-300 ${carrito.length > 0 ? 'bg-green-500 text-white hover:bg-green-600 shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            Continuar al Pago (Stripe)
                        </button>
                    </div>
                </div>
            </div>
          </div>
          
        </div>
      )}
      
      {/* Modal de Mensajes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <p className="text-gray-800 text-lg mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
