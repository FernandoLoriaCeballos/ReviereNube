// LoginEmpleado.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LoginEmpleado() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login/empleado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        Cookies.set("id_empleado", data.id_empleado, { expires: 7 });
        Cookies.set("id_empresa", data.id_empresa, { expires: 7 });
        navigate("/landing", { state: { empleadoId: data.id_empleado } });
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
        <h2 className="text-2xl font-bold text-white">Login Empleado</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-[#334155] text-white rounded" />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-[#334155] text-white rounded" />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Iniciar Sesión</button>
        </form>
        {message && <p className="text-red-500 text-sm text-center">{message}</p>}
        <p className="text-sm text-center text-gray-300">
          ¿No eres un empleado? <a href="/login" className="text-blue-400 hover:underline">Inicia sesión como usuario</a>
        </p>
      </div>
    </div>
  );
}

export default LoginEmpleado;