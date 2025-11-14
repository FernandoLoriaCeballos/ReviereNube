import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { CarritoProvider } from "./CarritoContext";

import Registro from "./Registro";
import Login from "./Login";
import Usuarios from "./Usuarios";
import Productos from "./Productos";
import Resenas from "./Resenas";
import Catalogo from "./Catalogo";
import Recibos from "./Recibos";
import Landing from "./Landing";
import ComprasRealizadas from "./ComprasRealizadas";
import Inicio from "./Inicio";
import QuienesSomos from "./QuienesSomos";
import Contacto from "./Contacto";
import HomeAdmin from "./HomeAdmin";
import Cupones from "./Cupones";
import Carrito from "./Carrito";
import Ofertas from "./Ofertas";
import CuponesLanding from "./CuponesLanding";
import GenerarUsuarios from "./GenerarUsuarios";
import GenerarResenas from "./GenerarResenas";
import GenerarCompras from "./GenerarCompras";
import LoginEmpresa from "./LoginEmpresa";
import LoginEmpleado from "./LoginEmpleado";
import RegistroEmpresa from "./RegistroEmpresa";
import Empresas from "./Empresas";
import Suscripciones from "./Suscripciones";
import CheckoutForm from "./checkoutform";
import "./App.css";
import Sucursales from "./components/Sucursales"; //Marielle

// Stripe config
const stripePromise = loadStripe("pk_test_51S8q8MEwPHsvqkshj7Jd7PYSzvSCzGelSEJ3vnIjSIoJrGBRjMbPwOXza4M2L3jXMA3obEpEG9yfkSuQmZcdGmb800r5GI607U");

// Componente de confirmación de pago
const Complete = () => {
  const [status, setStatus] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentIntentStatus, setPaymentIntentStatus] = useState("");
  const [iconColor, setIconColor] = useState("");
  const [icon, setIcon] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const SuccessIcon = (
      <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.4695 0.232963C15.8241 0.561287 15.8454 1.1149 15.5171 1.46949L6.14206 11.5945C5.97228 11.7778 5.73221 11.8799 5.48237 11.8748C5.23253 11.8698 4.99677 11.7582 4.83452 11.5681L0.459523 6.44311C0.145767 6.07557 0.18937 5.52327 0.556912 5.20951C0.924454 4.89575 1.47676 4.93936 1.79051 5.3069L5.52658 9.68343L14.233 0.280522C14.5613 -0.0740672 15.1149 -0.0953599 15.4695 0.232963Z" fill="white" />
      </svg>
    );

    const ErrorIcon = (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M1.25628 1.25628C1.59799 0.914573 2.15201 0.914573 2.49372 1.25628L8 6.76256L13.5063 1.25628C13.848 0.914573 14.402 0.914573 14.7437 1.25628C15.0854 1.59799 15.0854 2.15201 14.7437 2.49372L9.23744 8L14.7437 13.5063C15.0854 13.848 15.0854 14.402 14.7437 14.7437C14.402 15.0854 13.848 15.0854 13.5063 14.7437L8 9.23744L2.49372 14.7437C2.15201 15.0854 1.59799 15.0854 1.25628 14.7437C0.914573 14.402 0.914573 13.848 1.25628 13.5063L6.76256 8L1.25628 2.49372C0.914573 2.15201 0.914573 1.59799 1.25628 1.25628Z" fill="white" />
      </svg>
    );

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

    if (!sessionId) {
      setText("No se encontró el ID de la sesión.");
      return;
    }

    fetch(`http://localhost:3000/session-status?session_id=${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo obtener el estado de la sesión");
        return await res.json();
      })
      .then((data) => {
        setStatus(data.status);
        setPaymentIntentId(data.payment_intent_id);
        setPaymentStatus(data.payment_status);
        setPaymentIntentStatus(data.payment_intent_status);

        if (data.status === "complete") {
          setIconColor("#30B130");
          setIcon(SuccessIcon);
          setText("Payment succeeded");

          // redirige a /landing tras 3 segundos
          setTimeout(() => navigate("/landing"), 3000);
        } else {
          setIconColor("#DF1B41");
          setIcon(ErrorIcon);
          setText("Something went wrong, please try again.");
        }
      })
      .catch((err) => {
        console.error("Error al obtener estado de sesión:", err);
        setText("Error al obtener información del pago.");
      });
  }, [navigate]);

  return (
    <div id="payment-status">
      <div id="status-icon" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <h2 id="status-text">{text}</h2>
      <div id="details-table">
        <table>
          <tbody>
            <tr>
              <td className="TableLabel">Payment Intent ID</td>
              <td id="intent-id" className="TableContent">{paymentIntentId}</td>
            </tr>
            <tr>
              <td className="TableLabel">Status</td>
              <td id="intent-status" className="TableContent">{status}</td>
            </tr>
            <tr>
              <td className="TableLabel">Payment Status</td>
              <td id="session-status" className="TableContent">{paymentStatus}</td>
            </tr>
            <tr>
              <td className="TableLabel">Payment Intent Status</td>
              <td id="payment-intent-status" className="TableContent">{paymentIntentStatus}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a href={`https://dashboard.stripe.com/payments/${paymentIntentId}`} id="view-details" rel="noopener noreferrer" target="_blank">
        View details
      </a>
      <a id="retry-button" href="/checkout">Test another</a>
    </div>
  );
};

// Componente principal App
const App = () => {
 const promise = useMemo(() => {
  return fetch("http://localhost:3000/create-checkout-session", { method: "POST" })
    .then(async (res) => {
      if (!res.ok) throw new Error("Error al crear sesión de checkout");
      const clientSecret = await res.json();
      console.log("Client Secret recibido:", clientSecret);
      return clientSecret;
    })
    .catch((err) => {
      console.error("Error de red en create-checkout-session:", err);
      return null;
    });
}, []);

  const appearance = { theme: "stripe" };

  return (
    <CarritoProvider>
      <Router>
        <CheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret: promise,
            elementsOptions: { appearance },
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-empresa" element={<LoginEmpresa />} />
            <Route path="/login-empleado" element={<LoginEmpleado />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/registro-empresa" element={<RegistroEmpresa />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/resenas" element={<Resenas />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/recibos" element={<Recibos />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/compras" element={<ComprasRealizadas />} />
            <Route path="/Cupones" element={<Cupones />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/quienessomos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/HomeAdmin" element={<HomeAdmin />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/generar-usuarios" element={<GenerarUsuarios />} />
            <Route path="/Ofertas" element={<Ofertas />} />
            <Route path="/cuponeslanding" element={<CuponesLanding />} />
            <Route path="/generar-resenas" element={<GenerarResenas />} />
            <Route path="/generar-compras" element={<GenerarCompras />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/suscripciones" element={<Suscripciones />} />
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/sucursales" element={<Sucursales />} />
            {/* fallback: redirigir rutas no reconocidas al login/home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CheckoutProvider>
      </Router>
    </CarritoProvider>
  );
};

export default App;