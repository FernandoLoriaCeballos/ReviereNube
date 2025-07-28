import React, { useContext, useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from './CarritoContext';
import Navbar from './components/Navbar';
import logoFooter from './assets/img/logo_footer.png';

const Carrito = () => {
  const {
    carrito,
    eliminarDelCarrito,
    cambiarCantidad,
    vaciarCarrito,
    cuponAplicado,
    aplicarCupon
  } = useContext(CarritoContext);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [totalConDescuento, setTotalConDescuento] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const calcularTotal = () => carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

  useEffect(() => {
    const total = calcularTotal();
    if (cuponAplicado) {
      const descuento = total * cuponAplicado.descuento / 100;
      setTotalConDescuento(total - descuento);
    } else {
      setTotalConDescuento(total);
    }
  }, [carrito, cuponAplicado]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAplicarCupon = async () => {
    try {
      const cupon = await aplicarCupon(codigoCupon);
      if (cupon) {
        alert(`Cupón aplicado: ${cupon.codigo} (${cupon.descuento}% de descuento)`);
        setCodigoCupon('');
      } else {
        alert("El cupón ingresado no es válido.");
      }
    } catch (error) {
      console.error("Error al aplicar el cupón:", error);
      alert("Hubo un error al aplicar el cupón.");
    }
  };

  const realizarCompra = async () => {
    try {
      await vaciarCarrito();
      alert("Compra realizada exitosamente.");
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      alert("Hubo un error al realizar la compra. Por favor, intente de nuevo.");
    }
  };

  return (
    <div className="bg-[#111827] font-['Montserrat'] min-h-screen">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      
      <Navbar />

      <main className="container mx-auto px-4 pb-12">
        <h2 className="text-white text-xl font-bold mt-8 mb-6">Carrito de compras</h2>

        <div className="bg-[#202938] rounded-lg p-6">
          {carrito.length === 0 ? (
            <p className="text-white text-center py-10">El carrito está vacío.</p>
          ) : (
            <>
              {!isMobileView && (
                <table className="w-full text-white mb-4">
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
                            onChange={(e) => cambiarCantidad(producto.id_producto, parseInt(e.target.value))}
                            className="w-16 bg-gray-700 text-white p-1 rounded"
                            min="1"
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
              )}
              {isMobileView && (
                <div className="space-y-4">
                  {carrito.map((producto, index) => (
                    <div key={index} className="flex items-start border-b border-gray-700 py-4">
                      <img src={producto.foto} alt={producto.nombre} className="w-20 h-auto rounded-md mr-4" />
                      <div className="flex-grow">
                        <span className="text-white">{producto.nombre}</span>
                        <span className="text-gray-400 block">${producto.precio.toFixed(2)}</span>
                        <div className="flex justify-between mt-1">
                          <div className="flex flex-col items-start">
                            <span className="text-gray-400 text-sm font-bold">Cantidad:</span>
                            <input
                              type="number"
                              value={producto.cantidad}
                              onChange={(e) => cambiarCantidad(producto.id_producto, parseInt(e.target.value))}
                              className="w-16 bg-gray-700 text-white p-1 rounded"
                              min="1"
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-gray-400 text-sm font-bold">Subtotal:</span>
                            <span className="text-white">${(producto.precio * producto.cantidad).toFixed(2)}</span>
                          </div>
                          <button onClick={() => eliminarDelCarrito(producto.id_producto)} className="text-red-500 hover:text-red-700 ml-4">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {carrito.length > 0 && (
          <>
            <div className="bg-[#202938] mt-6 p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded w-full sm:w-auto"
                />
                <button onClick={handleAplicarCupon} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
                  Aplicar cupón
                </button>
              </div>
              {cuponAplicado && (
                <p className="text-white mb-4">Cupón aplicado: {cuponAplicado.codigo} ({cuponAplicado.descuento}% de descuento)</p>
              )}
              <p className="text-white text-2xl text-center sm:text-left">Total: ${totalConDescuento.toFixed(2)}</p>
            </div>

            <div className="mt-6">
              <PayPalScriptProvider options={{
                "client-id": "AX1Pjuu9wMgzgvk42SJBkl9VSsrc2Xrc10bvmsnLzmnZFiak55inFnB-WOnS_1BhyMSUYI5IBQS_JP_g",
                currency: "MXN"
              }}>
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: totalConDescuento.toFixed(2)
                        }
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                      console.log("Pago completado por " + details.payer.name.given_name);
                      realizarCompra();
                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </>
        )}
      </main>

      <footer className="bg-[#111827] text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Carrito;