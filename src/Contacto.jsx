import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import logo from './assets/img/logo.png';
import logoFooter from './assets/img/logo_footer.png';

import './assets/fonts/font-awesome.min.css';
import './assets/fonts/simple-line-icons.min.css';

function Contacto() {
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    const id_usuario = Cookies.get("id_usuario");
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

  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        `}
      </style>
      <nav className="bg-[#111827] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </Link>
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/inicio" className="hover:text-blue-500 uppercase">INICIO</Link>
            <Link to="/quienessomos" className="hover:text-blue-500 uppercase">QUIÉNES SOMOS</Link>
            <Link to="/landing" className="hover:text-blue-500 uppercase">CATÁLOGO DE PRODUCTOS</Link>
            <Link to="/contacto" className="hover:text-blue-500 uppercase">CONTACTO</Link>
            <Link to="/compras" className="hover:text-blue-500 uppercase">MIS COMPRAS</Link>
          </div>
        </div>
      </nav>

      <main className="page landing-page">
        <section className="px-[10%]">
          <div className="container text-center py-[52px]">
            <div className="block-heading">
              <h2 className="text-white text-2xl font-bold mb-4">¿Tienes alguna pregunta o comentario?</h2>
              <p className="text-white text-base">
                ¡Déjanos saber! Completa el siguiente formulario y nos pondremos en contacto<br />
                contigo lo antes posible.
              </p>
            </div>
          </div>
          <div className="container">
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-4">
                <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="text" placeholder="Nombre" />
              </div>
              <div className="w-full md:w-1/2 px-4 mb-4">
                <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="email" placeholder="Email" />
              </div>
            </div>
            <div className="mb-4">
              <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="text" placeholder="Asunto" />
            </div>
            <div className="mb-4">
              <textarea className="w-full bg-[#1f2937] text-white p-4 rounded-xl h-[281px]" placeholder="Mensaje"></textarea>
            </div>
            <div className="flex justify-center">
              <button className="w-full bg-[#2563eb] text-white py-4 rounded-xl hover:bg-blue-600 transition duration-300">
                Enviar
              </button>
            </div>
          </div>
        </section>
        
        <section className="mt-[71px]">
          <div className="w-full bg-[#2563eb]">
            <div className="relative w-full pb-[30%]">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-50 pointer-events-none"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14905.403594583984!2d-89.6164944!3d20.938419!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f5672270a784baf%3A0x764b40010695f0d9!2sUniversidad%20Tecnol%C3%B3gica%20Metropolitana!5e0!3m2!1ses-419!2smx!4v1720054054661!5m2!1ses-419!2smx"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
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

export default Contacto;