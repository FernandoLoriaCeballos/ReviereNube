// Registro.jsx
import React, { useState } from "react";
import "tailwindcss/tailwind.css";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarCampos = () => {
    setMessage("");
    setAlertType("");

    const camposRequeridos = ['nombre', 'email', 'password'];
    const camposVacios = camposRequeridos.filter(campo => !formData[campo].trim());

    if (camposVacios.length > 0) {
      const nombresCampos = { nombre: 'Nombre', email: 'Email', password: 'Contraseña' };
      const camposFaltantes = camposVacios.map(campo => nombresCampos[campo]).join(', ');
      setMessage(`Por favor, completa los siguientes campos obligatorios: ${camposFaltantes}`);
      setAlertType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Por favor, ingresa un email válido.');
      setAlertType("error");
      return false;
    }

    if (formData.password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      setAlertType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setAlertType("success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setAlertType("error");
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("Error al registrar el usuario. Intenta nuevamente.");
      setAlertType("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-['Montserrat']">
      <img src={logo} alt="Logo" className="w-[116px] mb-8" />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Registrar Usuario</h2>

        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${alertType === "error"
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
              onClick={() => { setMessage(""); setAlertType(""); }}
              className="ml-3 flex-shrink-0 text-lg hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Introduce tu Nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
          <div>
            <button
              type="submit"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md w-full"
            >
              Registrar
            </button>
          </div>
        </form>

        <div className="text-sm text-gray-600 text-center">
          <span className="text-red-500">*</span> Campos obligatorios
        </div>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta? <a href="/login" className="text-red-500 hover:text-red-600 font-medium">¡Inicia Sesión!</a>
        </p>
      </div>
    </div>
  );
}

export default Registro;