import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from "./assets/img/logo.png";
import { Workbox } from 'workbox-window';

// URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Conectado a Internet');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('No tienes conexión a Internet');
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Solicitar permiso para mostrar notificaciones push
    Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        console.log('Permiso concedido para mostrar notificaciones');
      } else {
        console.log('Permiso denegado para mostrar notificaciones');
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Verificando conexión a Internet...");
    console.log("isOnline:", isOnline);

    if (!isOnline) {
      // No hay conexión a Internet
      console.log("No hay conexión a Internet");
      showNotification('No se puede iniciar sesión sin conexión a Internet');
      return;
    }

    console.log("Hay conexión a Internet, realizando inicio de sesión...");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setMessage(data.message);

      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        console.log("Inicio de sesión exitoso, redirigiendo a /landing...");
        Cookies.set("id_usuario", data.id_usuario, { expires: 7 }); // Establece la cookie con una expiración de 7 días
        navigate("/landing");
      } else {
        console.log("Error en el inicio de sesión");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Hubo un error al intentar iniciar sesión");
    }
  };

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', sans-serif;
          }
        `}
      </style>
      <img src={logo} alt="Reverie Logo" className="w-62 h-52 mb-8" />
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1E293B] rounded-lg shadow-xl">
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-2xl font-bold text-white text-left mt-3">Inicio de Sesión</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-white">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 text-white bg-[#334155] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduce tu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-white">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 text-white bg-[#334155] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduce tu Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
        {message && <p className="mt-2 text-sm text-center text-red-500">{message}</p>}
        <p className="mt-4 text-sm text-center text-gray-300">
          ¿No tienes una cuenta? <a href="/registro" className="text-blue-500 hover:text-blue-400">¡Regístrate!</a>
        </p>
      </div>
    </div>
  );
}

export default Login;