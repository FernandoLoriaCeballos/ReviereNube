import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from './components/Navbar'; // Asegúrate de que la ruta sea correcta
import logoFooter from './assets/img/logo_footer.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CuponCard = ({ cupon }) => {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(cupon.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div className="bg-[#2d3748] rounded-lg overflow-hidden shadow-lg relative">
      <div className="absolute top-2 right-2">
        <button
          onClick={copiarCodigo}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
        >
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <img
        src={cupon.fotocupon || "https://via.placeholder.com/300x200?text=Cupón+No+Disponible"}
        alt={cupon.codigo}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/300x200?text=Cupón+No+Disponible";
        }}
      />
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-2 text-center">{cupon.codigo}</h3>
        <p className="text-gray-300 text-center">Descuento: {cupon.descuento}%</p>
        <br />
        <p className="text-gray-300 mb-4 text-center">Expira: {new Date(cupon.fecha_expiracion).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const CuponesLanding = () => {
  const [cupones, setCupones] = useState([]);
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
        obtenerCupones();
        obtenerCarrito();
      } else {
        console.error("No se encontró el ID del usuario en las cookies");
      }
    };

    checkLoginStatus();
  }, []);

  const obtenerCupones = () => {
    axios.get(`${API_URL}/cupones`)
      .then((response) => {
        setCupones(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los cupones:", error);
      });
  };

  const obtenerCarrito = () => {
    axios.get(`${API_URL}/carrito/${userId}`)
      .then((response) => {
        setCarrito(response.data.productos);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          axios.post(`${API_URL}/carrito/${userId}`, { productos: [] })
            .then(() => {
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

  const eliminarDelCarrito = (index) => {
    const productoAEliminar = carrito[index];
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    axios.delete(`${API_URL}/carrito/${userId}/${productoAEliminar.id_producto}`)
      .then(() => {
        console.log("Producto eliminado del carrito");
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
    axios.put(`${API_URL}/carrito/${userId}/${productoAActualizar.id_producto}`, {
      cantidad
    }).then(() => {
      console.log("Cantidad de producto actualizada");
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

    axios.post(`${API_URL}/recibos`, compra)
      .then(() => {
        console.log("Compra realizada");
        setCarrito([]);
        axios.put(`${API_URL}/carrito/${userId}`, { productos: [] })
          .then(() => {
            console.log("Carrito vaciado");
            setCarritoAbierto(false);
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
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&display=swap');
        `}
      </style>

      <Navbar /> {/* Se asegura la correcta integración de la Navbar */}

      <div className="overflow-hidden">
        <img
          src="https://imgur.com/274H0uW.jpeg"
          alt=""
          className="w-full"
        />
      </div>

      <main className="container mx-auto px-4 pb-12 flex-grow">
        <h2 className="text-white text-xl font-bold mt-8 mb-6">Cupones Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cupones.map((cupon) => (
            <CuponCard key={cupon.id_cupon} cupon={cupon} />
          ))}
        </div>
      </main>

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

      <footer className="bg-[#111827] text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CuponesLanding;