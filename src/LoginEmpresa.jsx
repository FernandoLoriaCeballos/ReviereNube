import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LoginEmpresa() {
  const [nombre_empresa, setNombreEmpresa] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login/empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_empresa, password })
      });

      const data = await response.json();
      setMessage(data.message);
      console.log("📥 LoginEmpresa response:", data);

      if (response.ok) {
        if (data.id_empresa) {
          Cookies.set("id_empresa", data.id_empresa, { expires: 7 });
          console.log("✅ Cookie id_empresa seteada:", data.id_empresa);
        } else {
          console.warn("⚠️ No se recibió id_empresa en la respuesta");
        }

        // Redirigir a login de empleados
        console.log("➡️ Redirigiendo a /login-empleado con empresaId:", data.id_empresa);
        navigate("/login-empleado", { state: { empresaId: data.id_empresa } });
      } else {
        console.warn("❌ Login de empresa fallido:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Hubo un error al intentar iniciar sesión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A]">
      <img src={logo} alt="Logo" className="w-62 h-52 mb-8" />
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1E293B] rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white">Login Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Nombre de la empresa"
            value={nombre_empresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#334155] text-white rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#334155] text-white rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </form>
        {message && <p className="text-red-500 text-sm text-center">{message}</p>}

        <p className="text-sm text-center text-gray-300">
          ¿No tienes una empresa registrada?{" "}
          <a href="/registro-empresa" className="text-blue-400 hover:underline">Regístrala aquí</a>
        </p>

        <p className="text-sm text-center text-gray-300">
          ¿No eres una empresa?{" "}
          <a href="/login" className="text-blue-400 hover:underline">Inicia sesión como usuario</a>
        </p>
      </div>
    </div>
  );
}

export default LoginEmpresa;
