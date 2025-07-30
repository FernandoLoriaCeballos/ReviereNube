import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" o "success"
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setMessage(data.message);
      console.log("📥 Login response:", data);

      if (response.ok) {
        setAlertType("success");
        Cookies.set("id_usuario", data.id_usuario, { expires: 7 });
        Cookies.set("rol", data.rol, { expires: 7 });

        if (data.empresa_id) {
          Cookies.set("id_empresa", data.empresa_id, { expires: 7 });
          console.log("✅ Cookie id_empresa:", data.empresa_id);
        } else {
          console.warn("⚠️ No se recibió empresa_id en la respuesta.");
        }

        // Redirección según el rol
        setTimeout(() => {
          switch (data.rol) {
            case "superadmin":
            case "admin_empresa":
              console.log("➡️ Redirigiendo a /usuarios");
              navigate("/usuarios");
              break;
            case "empleado":
              console.log("➡️ Redirigiendo a /productos");
              navigate("/productos");
              break;
            case "usuario":
            default:
              console.log("➡️ Redirigiendo a /landing");
              navigate("/landing");
          }
        }, 1500);
      } else {
        setAlertType("error");
        console.warn("❌ Login fallido:", data.message);
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setMessage("Hubo un error al intentar iniciar sesión");
      setAlertType("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-['Montserrat']">
      <img src={logo} alt="Logo" className="w-[116px] mb-8" />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Inicio de Sesión</h2>
        
        {/* Componente de alerta personalizada */}
        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${
            alertType === "error" 
              ? "bg-red-50 border-red-500 text-red-700" 
              : "bg-green-50 border-green-500 text-green-700"
          } flex items-center`}>
            <div className="flex-shrink-0 mr-3">
              {alertType === "error" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button 
              onClick={() => {setMessage(""); setAlertType("");}}
              className="ml-3 flex-shrink-0 text-lg hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Introduce tu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Introduce tu Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md w-full"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
        
        <div className="text-sm text-gray-600 text-center">
          <span className="text-red-500">*</span> Campos obligatorios
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta? <a href="/registro" className="text-red-500 hover:text-red-600 font-medium">¡Regístrate!</a>
          </p>
          <p className="text-sm text-gray-600">
            ¿No tienes una empresa registrada?{" "}
            <a href="/registro-empresa" className="text-red-500 hover:text-red-600 font-medium">Regístrala aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;