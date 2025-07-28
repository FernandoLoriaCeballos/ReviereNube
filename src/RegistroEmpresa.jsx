import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RegistroEmpresa() {
  const [nombre_empresa, setNombreEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [logo_url, setLogoUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/registro/empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_empresa,
          email,
          password,
          descripcion,
          telefono,
          logo_url
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        navigate("/login-empresa");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al registrar la empresa");
    }
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] font-['Montserrat'] px-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
          body { font-family: 'Montserrat', sans-serif; }
        `}
      </style>

      <img src={logo} alt="Reverie Logo" className="w-60 h-48 mb-6" />

      <div className="w-full max-w-xl p-8 bg-[#1E293B] rounded-lg shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Registro de Empresa</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de la empresa"
            value={nombre_empresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />
          <textarea
            placeholder="Descripción de la empresa"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />
          <input
            type="url"
            placeholder="URL del logo (enlace a imagen)"
            value={logo_url}
            onChange={(e) => setLogoUrl(e.target.value)}
            required
            className="w-full px-3 py-2 text-white bg-[#334155] rounded-md"
          />

          {/* Previsualización de imagen */}
          {logo_url && (
            <div className="flex flex-col items-center mt-2">
              <div className="w-[240px] h-[180px] bg-white rounded overflow-hidden border border-gray-400 flex items-center justify-center">
                {!previewError ? (
                  <img
                    src={logo_url}
                    alt="Previsualización del logo"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-red-500 text-sm p-2 text-center">URL de imagen inválida</span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Registrar Empresa
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-green-400 mt-4">{message}</p>
        )}

        <p className="text-center text-sm text-gray-300 mt-2">
          ¿Ya tienes una empresa registrada?{" "}
          <a href="/login-empresa" className="text-blue-400 hover:underline">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}

export default RegistroEmpresa;
