import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import { FaShoppingCart, FaUser, FaTicketAlt, FaCheckCircle, FaSearch, FaStar } from 'react-icons/fa';
import logo from './assets/img/logo.png';
import logoFooter from './assets/img/logo_footer.png';

const ComprasRealizadas = () => {
  const [compras, setCompras] = useState([]);
  const [resenaAbierta, setResenaAbierta] = useState(false);
  const [resenaActual, setResenaActual] = useState({ id_recibo: null, comentario: '', calificacion: 5 });
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userId = Cookies.get("id_usuario");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const id_usuario = Cookies.get("id_usuario");
      setIsLoggedIn(!!id_usuario);
      if (id_usuario) {
        obtenerCompras();
        obtenerCarrito();
      } else {
        console.error("No se encontró el ID del usuario en las cookies");
      }
    };

    checkLoginStatus();
  }, []);

  const obtenerCompras = () => {
    axios.get("http://localhost:3000/recibos")
      .then((response) => {
        const comprasFiltradas = response.data.filter(compra => compra.id_usuario === parseInt(userId));
        setCompras(comprasFiltradas);
      })
      .catch((error) => {
        console.error("Error al obtener las compras:", error);
      });
  };

  const obtenerCarrito = () => {
    axios.get(`http://localhost:3000/carrito/${userId}`)
      .then((response) => {
        setCarrito(response.data.productos);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          axios.post(`http://localhost:3000/carrito/${userId}`, { productos: [] })
            .then((response) => {
              setCarrito([]);
            })
            .catch((err) => {
              console.error("Error al crear un carrito vacío:", err);
            });
        } else {
          console.error("Error al obtener el carrito:", error);
        }
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
      axios.post("http://localhost:3000/resenas", {
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

  const eliminarDelCarrito = (index) => {
    const productoAEliminar = carrito[index];
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    axios.delete(`http://localhost:3000/carrito/${userId}/${productoAEliminar.id_producto}`)
      .then((response) => {
        console.log("Producto eliminado del carrito:", response.data);
      })
      .catch((error) => {
        console.error("Error al eliminar el producto del carrito:", error);
      });
  };

  const cambiarCantidad = (index, cantidad) => {
    const productoAActualizar = carrito[index];
    const nuevoCarrito = carrito.map((item, i) => {
      if (i === index) {
        return { ...item, cantidad };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
    axios.put(`http://localhost:3000/carrito/${userId}/${productoAActualizar.id_producto}`, {
      cantidad
    }).then((response) => {
      console.log("Cantidad de producto actualizada:", response.data);
    }).catch((error) => {
      console.error("Error al actualizar la cantidad del producto en el carrito:", error);
    });
  };

  const realizarCompra = () => {
    const compra = {
      id_usuario: parseInt(userId),
      productos: carrito.map(({ id_producto, cantidad }) => ({
        id_producto,
        cantidad
      }))
    };

    axios.post("http://localhost:3000/recibos", compra)
      .then((response) => {
        console.log("Compra realizada:", response.data);
        setCarrito([]);
        axios.put(`http://localhost:3000/carrito/${userId}`, { productos: [] })
          .then((response) => {
            console.log("Carrito vaciado:", response.data);
            setCarritoAbierto(false);
            obtenerCompras();
          })
          .catch((error) => {
            console.error("Error al vaciar el carrito:", error);
          });
      })
      .catch((error) => {
        console.error("Error al realizar la compra:", error);
      });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
  };

  const handleLogout = () => {
    Cookies.remove("id_usuario");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-[#111827] font-['Montserrat'] min-h-screen flex flex-col">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
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
            {isLoggedIn ? (
              <>
                <div className="relative">
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
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-500 uppercase">INICIAR SESIÓN</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-12 flex-grow">
        <h2 className="text-white text-xl font-bold mt-8 mb-6">Mis Compras Realizadas</h2>
        
        <div className="bg-[#202938] rounded-lg p-6">
          {compras.length === 0 ? (
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
                {compras.map((compra) => (
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

      {carritoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#202938] p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-6">Carrito de compras</h2>
            {carrito.length === 0 ? (
              <div>
                <p className="text-white mb-6">El carrito está vacío.</p>
                <button onClick={() => setCarritoAbierto(false)} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition duration-300">
                  Cerrar
                </button>
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
                        <td className="py-4 flex items-center">
                          <img src={producto.foto} alt={producto.nombre} className="w-[106px] h-auto rounded-md mr-4" />
                          {producto.nombre}
                        </td>
                        <td>${producto.precio}</td>
                        <td>
                          <input
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) => cambiarCantidad(index, parseInt(e.target.value))}
                            className="w-16 bg-gray-700 text-white p-1 rounded"
                            min="1"
                          />
                        </td>
                        <td>${producto.precio * producto.cantidad}</td>
                        <td>
                          <button onClick={() => eliminarDelCarrito(index)} className="text-red-500 hover:text-red-700">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-white text-xl font-bold mb-6">
                  Total: ${calcularTotal()}
                </div>
                <div className="flex justify-between">
                  <button onClick={realizarCompra} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300">
                    Realizar compra
                  </button>
                  <button onClick={() => setCarritoAbierto(false)} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition duration-300">
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ComprasRealizadas;