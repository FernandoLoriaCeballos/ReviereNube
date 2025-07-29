import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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

      console.log("🔒 Login response:", data);

      if (response.ok) {
        Cookies.set("id_usuario", data.id_usuario, { expires: 7 });
        Cookies.set("rol", data.rol, { expires: 7 });

        console.log("✅ Cookie id_usuario:", data.id_usuario);
        console.log("✅ Cookie rol:", data.rol);

        if (data.empresa_id) {
          Cookies.set("id_empresa", data.empresa_id, { expires: 7 });
          console.log("✅ Cookie id_empresa:", data.empresa_id);
        } else {
          console.warn("⚠️ No se recibió empresa_id en la respuesta.");
        }

        // Redirección según el rol
        if (data.rol === "superadmin") {
          console.log("➡️ Redirigiendo a /usuarios como superadmin");
          navigate("/usuarios");
        } else if (data.rol === "admin_empresa") {
          console.log("➡️ Redirigiendo a /usuarios como admin_empresa");
          navigate("/usuarios");
        } else {
          console.log("➡️ Redirigiendo a /landing como otro rol:", data.rol);
          navigate("/landing");
        }
      } else {
        console.error("❌ Error de login:", data.message);
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      setMessage("Hubo un error al intentar iniciar sesión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
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
              className="w-full px-3 py-2 mt-1 text-white bg-[#334155] rounded-md"
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
              className="w-full px-3 py-2 mt-1 text-white bg-[#334155] rounded-md"
              placeholder="Introduce tu Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
        {message && <p className="mt-2 text-sm text-center text-red-500">{message}</p>}
        <p className="mt-4 text-sm text-center text-gray-300">
          ¿No tienes una cuenta?{" "}
          <a href="/registro" className="text-blue-500 hover:text-blue-400">
            ¡Regístrate!
          </a>
        </p>
        <p className="text-sm text-center text-gray-300">
          ¿Eres una empresa?{" "}
          <a href="/login-empresa" className="text-blue-400 hover:underline">
            Inicia sesión como empresa
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
