import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from './CarritoContext';
import logo from './assets/img/logo.png';
import logoFooter from './assets/img/logo_footer.png';

function Carrito() {
  const { carrito, eliminarDelCarrito, cambiarCantidad, vaciarCarrito, cuponAplicado, aplicarCupon } = useContext(CarritoContext);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [totalConDescuento, setTotalConDescuento] = useState(0);
  const userId = Cookies.get("id_usuario");

  // Calcular el total del carrito sin descuento
  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
    Cookies.set('totalSinDescuento', subtotal.toFixed(2));
    return subtotal;
  };

  // Aplicar el descuento al total
  const aplicarDescuento = (total, descuento) => {
    const totalConDescuento = total - (total * descuento) / 100;
    Cookies.set('totalConDescuento', totalConDescuento.toFixed(2));
    setTotalConDescuento(totalConDescuento);
  };

  // Efecto para calcular el total al cambiar el carrito
  useEffect(() => {
    const total = calcularTotal();
    if (cuponAplicado) {
      aplicarDescuento(total, cuponAplicado.descuento);
    } else {
      Cookies.remove('totalConDescuento');
      setTotalConDescuento(total);
    }
  }, [carrito, cuponAplicado]);

  // Aplicar el cupón
  const handleAplicarCupon = async () => {
    const cupon = await aplicarCupon(codigoCupon);
    if (cupon) {
      alert(`Cupón aplicado: ${cupon.codigo} (${cupon.descuento}% de descuento)`);
      setCodigoCupon('');
      const total = parseFloat(Cookies.get('totalSinDescuento'));
      aplicarDescuento(total, cupon.descuento);
    } else {
      alert("El cupón ingresado no es válido.");
    }
  };

  // Realizar la compra
  const realizarCompra = async () => {
    try {
      const totalPagar = Cookies.get('totalConDescuento') || Cookies.get('totalSinDescuento');
      
      const compra = {
        id_usuario: parseInt(userId),
        productos: carrito.map(({ id_producto, cantidad }) => ({
          id_producto,
          cantidad
        })),
        cupon_aplicado: cuponAplicado,
        total: parseFloat(totalPagar)
      };

      await axios.post("http://localhost:3000/recibos", compra);
      vaciarCarrito();
      Cookies.remove('totalSinDescuento');
      Cookies.remove('totalConDescuento');
      alert("Compra realizada exitosamente.");
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      alert("Hubo un error al realizar la compra. Por favor, intente de nuevo.");
    }
  };

  // Cambiar la cantidad de un producto
  const handleCambiarCantidad = (id_producto, cantidad) => {
    if (cantidad === 0) {
      eliminarDelCarrito(id_producto);
    } else {
      cambiarCantidad(id_producto, cantidad);
    }
  };

  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
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
            <Link to="/carrito" className="text-2xl hover:text-blue-500">
              <i className="fa fa-shopping-cart"></i>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-12">
        <h2 className="text-white text-xl font-bold mt-8 mb-6">Carrito de compras</h2>

        <div className="bg-[#202938] rounded-lg p-6">
          <table className="w-full text-white">
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
                      onChange={(e) => handleCambiarCantidad(producto.id_producto, parseInt(e.target.value))}
                      className="w-16 bg-gray-700 text-white p-1 rounded"
                      min="0"
                    />
                  </td>
                  <td>${producto.precio * producto.cantidad}</td>
                  <td>
                    <button onClick={() => eliminarDelCarrito(producto.id_producto)} className="text-red-500 hover:text-red-700">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  realizarCompra();
                });
              }}
            />
          </PayPalScriptProvider>
        </div>
      </main>

      <footer className="bg-[#202938] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <img src={logoFooter} alt="Logo Footer" className="max-w-full h-auto" />
            </div>
            <div className="flex space-x-8">
              <Link to="/" className="text-white text-sm hover:text-blue-500 uppercase">INICIO</Link>
              <Link to="/quienes-somos" className="text-white text-sm hover:text-blue-500 uppercase">QUIÉNES SOMOS</Link>
              <Link to="/landing" className="text-white text-sm hover:text-blue-500 uppercase">CATÁLOGO DE PRODUCTOS</Link>
              <Link to="/contacto" className="text-white text-sm hover:text-blue-500 uppercase">CONTACTO</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Carrito;