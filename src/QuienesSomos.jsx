import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import { FaUser, FaShoppingCart } from 'react-icons/fa';
import logo from './assets/img/logo.png';
import logoFooter from './assets/img/logo_footer.png';
import qnsms from './assets/img/qnsms.jpg';

import './assets/fonts/font-awesome.min.css';
import './assets/fonts/simple-line-icons.min.css';

function QuienesSomos() {
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id_usuario = Cookies.get("id_usuario");
    setIsLoggedIn(!!id_usuario);
    if (id_usuario) {
      obtenerCarrito(id_usuario);
    }
  }, []);

  const obtenerCarrito = (id_usuario) => {
    axios.get(`http://localhost:3000/carrito/${id_usuario}`)
      .then((response) => {
        setCarrito(response.data.productos);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          axios.post(`http://localhost:3000/carrito/${id_usuario}`, { productos: [] })
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

  const eliminarDelCarrito = (index) => {
    const id_usuario = Cookies.get("id_usuario");
    const productoAEliminar = carrito[index];
    console.log("Eliminando producto con ID:", productoAEliminar.id_producto, "del usuario con ID:", id_usuario);
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    axios.delete(`http://localhost:3000/carrito/${id_usuario}/${productoAEliminar.id_producto}`)
      .then((response) => {
        console.log("Producto eliminado del carrito:", response.data);
      })
      .catch((error) => {
        console.error("Error al eliminar el producto del carrito:", error);
      });
  };

  const cambiarCantidad = (index, cantidad) => {
    const id_usuario = Cookies.get("id_usuario");
    const productoAActualizar = carrito[index];
    const nuevoCarrito = carrito.map((item, i) => {
      if (i === index) {
        return { ...item, cantidad };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
    axios.put(`http://localhost:3000/carrito/${id_usuario}/${productoAActualizar.id_producto}`, {
      cantidad
    }).then((response) => {
      console.log("Cantidad de producto actualizada:", response.data);
    }).catch((error) => {
      console.error("Error al actualizar la cantidad del producto en el carrito:", error);
    });
  };

  const realizarCompra = () => {
    const id_usuario = Cookies.get("id_usuario");
    const compra = {
      id_usuario,
      productos: carrito.map(({ id_producto, cantidad }) => ({
        id_producto,
        cantidad
      }))
    };

    console.log("Compra a realizar:", compra);

    axios.post("http://localhost:3000/recibos", compra)
      .then((response) => {
        console.log("Compra realizada:", response.data);
        setCarrito([]);
        axios.put(`http://localhost:3000/carrito/${id_usuario}`, { productos: [] })
          .then((response) => {
            console.log("Carrito vaciado:", response.data);
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
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
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
            ) : (
              <Link to="/login" className="hover:text-blue-500 uppercase">INICIAR SESIÓN</Link>
            )}
          </div>
        </div>
      </nav>
      <main>
        <img src={qnsms} alt="Quienes Somos" className="w-full" />
        
        <section className="bg-[#111827] py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-white text-base mb-4">
                En Reverie, no somos solo una empresa de diseño web, somos tu socio en el viaje digital. Nuestra rica historia de innovación<br/>
                y nuestra pasión por la tecnología nos han permitido ayudar a numerosas marcas a contar sus historias de manera<br/>
                efectiva y atractiva.
              </p>
              <h2 className="text-white text-2xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-white text-base mb-4">
                Comprendemos las necesidades únicas de cada cliente. Ofrecemos soluciones a medida que reflejan su visión<br/>
                y objetivos. Creemos que el diseño no solo es estético, sino también funcional y transformador.
              </p>
              <p className="text-white text-base font-bold">
                ¡Bienvenidos a Reverie, donde las ideas cobran vida digitalmente!
              </p>
            </div>
          </div>
          
          <div className="container mx-auto px-4 border-4 border-[#2563eb] rounded-lg p-8 mt-12">
            <div className="flex flex-col lg:flex-row items-center justify-center">
              <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8 lg:pl-16">
                <p className="text-white text-base text-center lg:text-left">
                  Nuestro equipo está formado por expertos en diseño,<br/>
                  desarrollo y estrategia digital. Trabajamos juntos con<br/>
                  un objetivo común: crear experiencias web<br/>
                  excepcionales.<br/>
                  Creemos en el poder del diseño para resolver<br/>
                  problemas y mejorar la vida de las personas.
                </p>
              </div>
              <div className="container mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
    {[
      'Moises Aitor Estevez Cordova', 
      'Fernando Javier Loria Ceballos', 
      'Jose Luis Puga Perez',
      'Julio Esteban Gonzalez Molina'
    ].map((name, index) => {
      // Función para determinar la ocupación basada en el índice
      const getOcupacion = (idx) => {
        switch(idx) {
          case 0:
            return 'Diseñador grafico, Programacion';
          case 1:
            return 'Youtuber,Programador';
          case 2:
            return 'Programador';
          case 3:
            return 'Programador';
          default:
            return '';
        }
      };

      return (
        <div key={index} className="bg-[#202938] p-6 rounded-lg text-center w-72 shadow-xl transform transition-transform hover:scale-105">
          <i className="fa fa-user-circle text-white mb-4" style={{ fontSize: '100px' }}></i>
          <h3 className="text-white text-lg font-bold mb-3">{name}</h3>
          <p className="text-white text-sm">
            Estudiante de entornos virtuales<br/>
            {getOcupacion(index)}
          </p>
        </div>
      );
    })}
  </div>
</div>
            </div>
          </div>
        </section>
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

    </div>
  );
}

export default QuienesSomos;