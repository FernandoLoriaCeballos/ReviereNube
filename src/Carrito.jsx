import React, { useContext, useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CarritoContext } from './CarritoContext';
import Navbar from './components/Navbar';
import Cookies from 'js-cookie'; 
import logoFooter from './assets/img/logo_footer.png';
import OxxoPayButton from "./components/OxxoPayButton"; 
import oxxoLogo from "./assets/img/oxxo_logo.png"; // Asegúrate de tener el logo en esta ruta

// Asumo que el carrito de productos (tabla o móvil view) se mostrará dentro de la sección "Revisar los artículos y el envío"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Carrito = () => {
  const {
    carrito,
    eliminarDelCarrito,
    cambiarCantidad,
    vaciarCarrito,
    cuponAplicado,
    aplicarCupon,
    userId
  } = useContext(CarritoContext);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [totalConDescuento, setTotalConDescuento] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const calcularTotal = () => carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

  // Calcular el total, incluyendo un 16% de IVA (asumiendo que IVA incluido es 16%)
  const calcularTotalConIVA = () => {
    return totalConDescuento * 1.16;
  };

  useEffect(() => {
    const total = calcularTotal();
    if (cuponAplicado) {
      const descuento = total * cuponAplicado.descuento / 100;
      setTotalConDescuento(total - descuento);
    } else {
      setTotalConDescuento(total);
    }
    // Guardar el precio con descuento en una cookie, ajustado para el total.
    // Lo mantengo, pero es una práctica dudosa para el flujo de pago.
    Cookies.set('precio_descuento', totalConDescuento.toFixed(2), { expires: 1 });
  }, [carrito, cuponAplicado]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  const handleOxxoPayment = async () => {
      const clienteId = userId; 
      // Usamos el total con descuento para el monto
      const monto = calcularTotalConIVA().toFixed(2); 
      const clienteEmail = "ejemplo@cliente.com"; // **REEMPLAZA ESTO CON EL EMAIL REAL DEL USUARIO**
  
      if (!clienteId) {
          alert("Debes iniciar sesión para generar un pago OXXO.");
          return;
      }
  
      try {
          console.log(`Attempting to fetch from: ${API_URL}/oxxo-pay`);
          const response =  await fetch(`${API_URL}/oxxo-pay`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  total: monto,
                  email: clienteEmail,
                  user_id: clienteId
              }),
          });
          
          console.log('Huntrix Dont Miss');
          const data = await response.json();
          
          if (response.ok && data.success) {
              alert(`¡Referencia OXXO generada! Ref: ${data.reference}. Paga antes de: ${data.expirationDate}`);
              // Aquí puedes redirigir al usuario a una página de instrucciones de pago
          } else {
              alert(`Error al generar la referencia de OXXO: ${data.error || 'Intente de nuevo.'}`);
          }
  
      } catch (error) {
          console.error("Error al llamar al backend para OXXO:", error);
          alert("Ocurrió un error de conexión con el servidor.");
      }
  };
  
  
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

  // Estructura de checkout principal
//   const checkoutStructure = (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
//         {/* Columna Izquierda: Pasos del Checkout */}
//         <div className="lg:col-span-2 space-y-6">
//             {/* 1. Agregar dirección de entrega o recolección */}
//             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//                 <h3 className="text-xl font-bold mb-4 text-gray-900">Agregar dirección de entrega o recolección</h3>
//                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
//                     <button className="bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition duration-150">
//                         Agregar una nueva dirección de entrega
//                     </button>
//                     <button className="bg-white border border-gray-400 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-150">
//                         Encuentra una ubicación de recolección cercana
//                     </button>
//                 </div>
//             </div>

  // Estructura de checkout principal
  const checkoutStructure = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Columna Izquierda: Pasos del Checkout */}
      <div className="lg:col-span-2 space-y-6">
        {/* 2. Método de pago */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Método de pago</h3>
          {/* Opciones de Pago */}
          <div className="space-y-4">
            <PayPalScriptProvider options={{
              "client-id": "AX1Pjuu9wMgzgvk42SJBkl9VSsrc2Xrc10bvmsnLzmnZFiak55inFnB-WOnS_1BhyMSUYI5IBQS_JP_g",
              currency: "MXN"
            }}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        value: calcularTotalConIVA().toFixed(2) // Usar total con IVA
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
            <OxxoPayButton 
              onClick={handleOxxoPayment} 
              logoSrc={oxxoLogo} 
              label="Pagar en Efectivo OXXO"
            />
            {/* Sección de Cupón (la muevo aquí ya que afecta el total y está antes del pago) */}
            {/*
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Aplicar Cupón</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  className="border border-gray-300 p-2 rounded flex-grow"
                />
                <button onClick={handleAplicarCupon} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
                  Aplicar
                </button>
              </div>
              {cuponAplicado && (
                <p className="text-green-600 mt-2">Cupón aplicado: {cuponAplicado.codigo} ({cuponAplicado.descuento}% de descuento)</p>
              )}
            </div>
            */}
          </div>
        </div>
      
      </div>

     
        
          

          <div className="p-6">
            {/* Detalles del Total */}
            <div className="text-gray-700 space-y-2 pb-4 border-b border-gray-200">
              <div className="flex justify-between">
                <span>Productos:</span>
                <span>${totalConDescuento.toFixed(2)}</span>
              </div>
{/*               <div className="flex justify-between">
                <span>Envío:</span>
                <span>--</span> {/* Sin datos de envío en el código actual */}
              </div>
            </div>
             
            {/* Total Final */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold text-gray-900">Total (IVA incluido, en caso de ser aplicable)</span>
              <span className="text-2xl font-bold text-gray-900">${calcularTotalConIVA().toFixed(2)}</span>
            </div>
          </div>

  );


  return (
    <div className="bg-white font-['Montserrat'] min-h-screen"> 
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      
      <Navbar />

      <main className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mt-8 mb-6 text-gray-900">Checkout</h2> {/* Cambié el título a algo más genérico */}

        {carrito.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-700 text-center py-10">El carrito está vacío.</p>
            </div>
        ) : (
          checkoutStructure
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Carrito;