import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RegistroEmpresa() {
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    email: "",
    password: "",
    descripcion: "",
    telefono: "",
    logo_url: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/registro/empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setTimeout(() => {
          navigate("/login-empresa");
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Hubo un error al registrar la empresa");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A]">
      <img src={logo} alt="Logo" className="w-62 h-52 mb-6" />
      <div className="w-full max-w-xl p-8 space-y-6 bg-[#1E293B] rounded-lg shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4">Registro de Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="nombre_empresa" placeholder="Nombre de la empresa" value={formData.nombre_empresa} onChange={handleChange} required className="w-full p-2 bg-[#334155] rounded" />
          <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-[#334155] rounded" />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="w-full p-2 bg-[#334155] rounded" />
          <input type="text" name="telefono" placeholder="Teléfono de contacto" value={formData.telefono} onChange={handleChange} required className="w-full p-2 bg-[#334155] rounded" />
          <textarea name="descripcion" placeholder="Descripción de la empresa" value={formData.descripcion} onChange={handleChange} rows={3} className="w-full p-2 bg-[#334155] rounded"></textarea>
          <input type="url" name="logo_url" placeholder="URL del logo de la empresa" value={formData.logo_url} onChange={handleChange} required className="w-full p-2 bg-[#334155] rounded" />

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Registrar Empresa
          </button>
        </form>

        {message && <p className="text-sm text-center mt-2 text-green-400">{message}</p>}

        <p className="text-sm text-center text-gray-300">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login-empresa" className="text-blue-400 hover:underline">Inicia sesión como empresa</a>
        </p>
      </div>
    </div>
  );
}

export default RegistroEmpresa;
