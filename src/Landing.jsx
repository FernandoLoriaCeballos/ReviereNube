import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { FaShoppingCart, FaUser, FaTicketAlt, FaCheckCircle, FaStar, FaFire, FaBell } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from './CarritoContext';
import logo from './assets/img/logo.png';
import logoFooter from './assets/img/logo_footer.png';
import productosBackground from './assets/img/productos.jpg';

const ProductCard = ({ producto, handleAgregarAlCarrito }) => {
  const [isHovered, setIsHovered] = useState(false);
  

  return (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img src={producto.foto} alt={producto.nombre} className="w-full h-64 object-cover transition-all duration-300 transform hover:scale-110" />
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => handleAgregarAlCarrito(producto)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-300"
          >
            <FaShoppingCart />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-white text-xl font-bold mb-2">{producto.nombre}</h3>
        <p className="text-gray-300 mb-4 h-12 overflow-hidden">{producto.descripcion}</p>
        <div className="flex justify-between items-center">
          <p className="text-blue-400 font-bold text-2xl">${producto.precio.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const { carrito, agregarAlCarrito, eliminarDelCarrito, cambiarCantidad, vaciarCarrito, cuponAplicado, aplicarCupon, realizarCompra } = useContext(CarritoContext);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [totalConDescuento, setTotalConDescuento] = useState(0);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const userId = Cookies.get("id_usuario");

  useEffect(() => {
    const userId = Cookies.get("id_usuario");
    if (userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
  
    const handleOffline = () => {
      setIsOnline(false);
    };
  
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const showNotification = (message) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const options = {
          body: message,
          icon: logo,
          vibrate: [200, 100, 200],
          tag: message,
          renotify: true,
          actions: [
            { action: 'confirm', title: 'OK', icon: logo },
          ],
        };
        registration.showNotification('Reverie', options);
      }).catch((error) => {
        console.error('Error al mostrar la notificación:', error);
      });
    } else {
      alert(message);
    }
  };

  useEffect(() => {
    if (!userId) {
      setNotificationCount(1);
    }

    const fetchData = async () => {
      try {
        const productosResponse = await axios.get("http://localhost:3000/productos");
        const productosData = productosResponse.data;
        setProductos(productosData.filter(product => !product.esPromocion));

        const ofertasResponse = await axios.get("http://localhost:3000/ofertas");
        const ofertasData = ofertasResponse.data;

        const ofertasConProductos = ofertasData
          .filter(oferta => oferta.estado)
          .map(oferta => {
            const producto = productosData.find(p => p.id_producto === oferta.id_producto);
            if (producto) {
              return {
                id: oferta.id_producto,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precioOriginal: producto.precio,
                precioOferta: oferta.precio_oferta,
                imagen: producto.foto,
                descuento: oferta.descuento
              };
            }
            return null;
          })
          .filter(oferta => oferta !== null);

        setOfertas(ofertasConProductos);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
    
    const loggedIn = !!userId;
    setIsLoggedIn(loggedIn);

    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (loggedIn && justLoggedIn === 'true') {
      setShowWelcomeModal(true);
      sessionStorage.removeItem('justLoggedIn');
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setIsNotificationDropdownOpen(false);
      }
      if (!event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
    Cookies.set('totalSinDescuento', subtotal.toFixed(2));
    return subtotal;
  };

  const aplicarDescuento = (total, descuento) => {
    const totalConDescuento = total - (total * descuento) / 100;
    Cookies.set('totalConDescuento', totalConDescuento.toFixed(2));
    setTotalConDescuento(totalConDescuento);
  };

  useEffect(() => {
    const total = calcularTotal();
    if (cuponAplicado) {
      aplicarDescuento(total, cuponAplicado.descuento);
    } else {
      Cookies.remove('totalConDescuento');
      setTotalConDescuento(total);
    }
  }, [carrito, cuponAplicado]);

  const handleAplicarCupon = async () => {
    const cupon = await aplicarCupon(codigoCupon);
    if (cupon) {
      setModalMessage(`Cupón aplicado: ${cupon.codigo} (${cupon.descuento}% de descuento)`);
      setShowModal(true);
      setCodigoCupon('');
      const total = parseFloat(Cookies.get('totalSinDescuento'));
      aplicarDescuento(total, cupon.descuento);
    } else {
      setModalMessage("El cupón ingresado no es válido.");
      setShowModal(true);
    }
  };

  const handleCambiarCantidad = (id_producto, cantidad) => {
    if (cantidad === 0) {
      eliminarDelCarrito(id_producto);
    } else {
      cambiarCantidad(id_producto, cantidad);
    }
  };

  const handleAdminClick = () => navigate("/HomeAdmin");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setNotificationCount(1);
    Cookies.remove("id_usuario"); // Elimina la cookie al cerrar sesión
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleNotificationClick = () => {
    setShowNotificationModal(true);
    setIsNotificationDropdownOpen(false);
    setNotificationCount(0);
  };

  const handleRealizarCompra = async (detallesPago) => {
    try {
      // Crear el detalle de la compra
      const detalleCompra = carrito.map(producto => {
        return {
          id_producto: producto.id_producto,
          cantidad: producto.cantidad
        };
      });
  
      // Obtener el precio total con descuento de las cookies
      const totalConDescuento = parseFloat(Cookies.get('totalConDescuento')) || parseFloat(Cookies.get('totalSinDescuento'));
  
      // Datos para el recibo
      const compraData = {
        id_usuario: parseInt(userId),
        productos: detalleCompra,
        cupon_aplicado: cuponAplicado,
        total: totalConDescuento
      };
  
      // Realizar la petición POST al servidor
      const response = await axios.post("http://localhost:3000/recibos", compraData);
  
      if (response.status === 201) {
        // La compra se realizó exitosamente
        await vaciarCarrito();
        setModalMessage("¡Compra realizada exitosamente!");
        setShowModal(true);
        
        // Cerrar el modal después de 3 segundos
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

  const handleAgregarAlCarrito = (producto) => {
    if (!isLoggedIn) {
      setModalMessage("Debes iniciar sesión para agregar productos al carrito.");
      setShowModal(true);
      return;
    }
  
    if (!isOnline) {
      showNotification('No se puede agregar el producto al carrito sin conexión a Internet');
      return;
    }
  
    const productoConPrecioOferta = producto.precioOferta
      ? {
          ...producto,
          id_producto: producto.id,
          precio: producto.precioOferta,
          esPromocion: true,
          foto: producto.imagen
        }
      : producto;
  
    agregarAlCarrito(productoConPrecioOferta);
    setAddedProduct(productoConPrecioOferta);
    setShowAddedModal(true);
    setTimeout(() => {
      setShowAddedModal(false);
      setAddedProduct(null);
    }, 3000);
  };

  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxDescuento = Math.max(...ofertas.map(oferta => oferta.descuento));

  return (
    <div className="bg-[#111827] font-['Montserrat'] min-h-screen flex flex-col">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
          
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
        `}
      </style>
      
      <nav className="bg-[#111827] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/landing" className="flex items-center">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </Link>
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/inicio" className="hover:text-blue-500 uppercase">INICIO</Link>
            <Link to="/quienessomos" className="hover:text-blue-500 uppercase">QUIÉNES SOMOS</Link>
            <Link to="/landing" className="hover:text-blue-500 uppercase">CATÁLOGO DE PRODUCTOS</Link>
            <Link to="/contacto" className="hover:text-blue-500 uppercase">CONTACTO</Link>
            <Link to="/compras" className="hover:text-blue-500 uppercase">MIS COMPRAS</Link>
            {isLoggedIn && (
              // Modifica el botón del carrito en la navegación
            <button 
              onClick={() => {
                if (!isOnline) {
                  showNotification('No se puede abrir el carrito sin conexión a Internet');
                  return;
                }
                setCarritoAbierto(true);
              }} 
              className="text-2xl hover:text-blue-500 relative"
            >
              <FaShoppingCart />
              {carrito.length > 0 && (
                <span className="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full px-1 py-0.5 text-xs transform translate-y-1/2 translate-x-1/2">
                  {carrito.reduce((acc, producto) => acc + producto.cantidad, 0)}
                </span>
              )}
            </button>
            )}
            <Link to="/cuponeslanding" className="text-2xl hover:text-blue-500">
              <FaTicketAlt />
            </Link>
            <div className="relative notification-dropdown">
              <button 
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="text-2xl hover:text-blue-500 relative"
              >
                <FaBell />
                {notificationCount > 0 && (
                  <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              {isNotificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#202938] rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleNotificationClick}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2d3748]"
                  >
                    Notificaciones
                  </button>
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button onClick={toggleDropdown} className="text-2xl hover:text-blue-500">
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
              <Link to="/login" className="hover:text-blue-500 uppercase">INICIAR SESIÓN</Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        <img src={productosBackground} alt="Productos Background" className="w-full object-cover" />
        
        <section className="bg-gradient-to-b from-[#111827] to-[#1f2937] py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center text-blue-400 relative">
              Ofertas Especiales
            </h2>
            <div className="flex justify-center flex-wrap gap-8">
              {ofertas.map((oferta) => (
                <div
                  key={oferta.id}
                  className={`w-80 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-xl p-4 m-2 transition-all duration-500 transform hover:scale-105 hover:rotate-1 relative overflow-hidden group
                    ${oferta.descuento === maxDescuento ? 'animate-bounce-slow ring-4 ring-blue-500 shadow-2xl shadow-blue-500/50' : ''}`}
                >
                  <div className={`absolute top-0 right-0 ${
                    oferta.descuento === maxDescuento 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 text-lg font-bold animate-pulse'
                      : 'bg-blue-500 px-3 py-1 text-sm'
                  } text-white rounded-bl-md font-bold z-10 shadow-md`}>
                    {oferta.descuento}% OFF
                  </div>
                  {oferta.descuento === maxDescuento && (
                    <div className="absolute top-2 left-2 text-yellow-400 animate-pulse">
                    </div>
                  )}
                  <div className="relative mb-4 overflow-hidden rounded-md">
                    <img src={oferta.imagen} alt={oferta.nombre} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleAgregarAlCarrito(oferta)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-full transition-colors duration-300 transform hover:scale-105 flex items-center space-x-2"
                      >
                        <FaShoppingCart />
                        <span>Agregar al carrito</span>
                      </button>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-300">{oferta.nombre}</h2>
                  <p className="text-sm text-gray-300 mb-3">{oferta.descripcion}</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm line-through text-gray-500">${oferta.precioOriginal}</p>
                    <p className="text-2xl font-bold text-blue-400">${oferta.precioOferta}</p>
                  </div>
                  <div className="flex items-center justify-between">
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#111827] py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-blue-400 text-3xl font-bold mb-8 text-center">Productos:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((producto) => (
                <ProductCard
                  key={producto.id_producto}
                  producto={producto}
                  handleAgregarAlCarrito={handleAgregarAlCarrito}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {carritoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#202938] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setCarritoAbierto(false)} 
              className="absolute top-4 right-4 text-white rounded-full p-2 hover:bg-blue-700 transition duration-300"
            >
              X
            </button>
            
            <h2 className="text-white text-xl font-bold mb-6">Carrito de compras</h2>
            
            {carrito.length === 0 ? (
              <div>
                <p className="text-white mb-6 text-center">El carrito está vacío.</p>
              </div>
            ) : (
              <>
                <table className="w-full text-white mb-6">
                  <thead>
                    <tr>
                      <th className="text-left pb-4">Producto</th>
                      <th className="text-left pb-4">Precio</th>
                      <th className="text-left pb-4">Cantidad</th>
                      <th className="text-left pb-4">Subtotal</th>
                      <th className="text-left pb-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((producto, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex flex-col">
                            {producto.esPromocion && (
                              <span className="text-yellow-400 text-xs font-bold mb-1">Promoción</span>
                            )}
                            <div className="flex items-center">
                              <img src={producto.foto || producto.imagen} alt={producto.nombre} className="w-16 h-16 object-cover rounded-md mr-4" />
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
                            className="w-16 bg-gray-700 text-white p-1 rounded"
                            min="0"
                          />
                        </td>
                        <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                        <td>
                          <button onClick={() => eliminarDelCarrito(producto.id_producto)} className="text-red-500 hover:text-red-700">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-[#202938] mt-6 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded mr-4"
                    />
                    <button onClick={handleAplicarCupon} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
                      Aplicar cupón
                    </button>
                  </div>
                  {cuponAplicado && (
                    <p className="text-white mb-4">Cupón aplicado: {cuponAplicado.codigo} ({cuponAplicado.descuento}% de descuento)</p>
                  )}
                  <p className="text-white text-2xl">Total: ${totalConDescuento.toFixed(2)}</p>
                </div>
                <div className="mt-6">
                  <PayPalScriptProvider options={{
                    "client-id": "AX1Pjuu9wMgzgvk42SJBkl9VSsrc2Xrc10bvmsnLzmnZFiak55inFnB-WOnS_1BhyMSUYI5IBQS_JP_g",
                    currency: "MXN"
                  }}>
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        const totalPagar = Cookies.get('totalConDescuento') || Cookies.get('totalSinDescuento');
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: totalPagar
                            }
                          }]
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

      {userId === "1" && (
        <div className="fixed bottom-4 right-4">
          <button onClick={handleAdminClick} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">
            Modo Administrador
          </button>
        </div>
      )}

      <footer className="bg-[#111827] text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-2" />
          <p className="text-gray-400 mt-10">© 2024 Reviere Todos los derechos reservados.</p>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-6 relative max-w-md mx-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              X
            </button>
            <p className="text-white text-lg text-center pt-2">{modalMessage}</p>
          </div>
        </div>
      )}

      {showWelcomeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-2 max-w-md mx-auto relative">
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
          <div className="bg-[#202938] rounded-lg shadow-lg p-6 max-w-md mx-auto flex items-center space-x-4 transform transition-all duration-10 scale-110">
            <div className="flex-shrink-0">
              <img src={addedProduct.foto || addedProduct.imagen} alt={addedProduct.nombre} className="w-16 h-16 object-cover rounded-md" />
            </div>
            <div className="flex-grow">
              <h3 className="text-white text-lg font-semibold">{addedProduct.nombre}</h3>
              <p className="text-blue-400 text-sm">Se agregó al carrito</p>
            </div>
            <div className="flex-shrink-0 text-blue-400">
              <FaCheckCircle size={24} />
            </div>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#202938] rounded-lg shadow-lg p-0 max-w-md mx-auto relative">
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
            >
              ×
            </button>
            <div className="mt-2">
              <img
                src="https://i.imgur.com/VKWh0mU.jpeg"
                alt="Notificación"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;