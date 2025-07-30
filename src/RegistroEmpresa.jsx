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
  const [alertType, setAlertType] = useState(""); // "error" o "success"
  const navigate = useNavigate();

  const validarCampos = () => {
    // Limpiar alertas previas
    setMessage("");
    setAlertType("");

    // Validar que todos los campos obligatorios estén completos
    const camposRequeridos = {
      nombre_empresa: 'Nombre de la Empresa',
      email: 'Email',
      password: 'Contraseña',
      descripcion: 'Descripción',
      telefono: 'Teléfono',
      logo_url: 'URL del Logo'
    };

    const camposVacios = Object.keys(camposRequeridos).filter(campo => {
      const valor = campo === 'nombre_empresa' ? nombre_empresa :
                   campo === 'email' ? email :
                   campo === 'password' ? password :
                   campo === 'descripcion' ? descripcion :
                   campo === 'telefono' ? telefono :
                   campo === 'logo_url' ? logo_url : '';
      return !valor.trim();
    });
    
    if (camposVacios.length > 0) {
      const camposFaltantes = camposVacios.map(campo => camposRequeridos[campo]).join(', ');
      setMessage(`Por favor, completa los siguientes campos obligatorios: ${camposFaltantes}`);
      setAlertType("error");
      return false;
    }

    // Validación adicional para el email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Por favor, ingresa un email válido.');
      setAlertType("error");
      return false;
    }

    // Validación adicional para el teléfono
    const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
    if (!telefonoRegex.test(telefono)) {
      setMessage('Por favor, ingresa un teléfono válido (solo números, espacios, guiones, paréntesis y signo +).');
      setAlertType("error");
      return false;
    }

    // Validación adicional para la contraseña
    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      setAlertType("error");
      return false;
    }

    // Validación de URL de imagen si hay error de vista previa
    if (previewError) {
      setMessage('La URL del logo no es válida. Por favor, ingresa una URL de imagen válida.');
      setAlertType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCampos()) {
      return; // Detener la ejecución si la validación falla
    }

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
        setAlertType("success");
        setTimeout(() => {
          navigate("/login"); // Cambiado de "/login-empresa" a "/login"
        }, 2000);
      } else {
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al registrar la empresa. Intenta nuevamente.");
      setAlertType("error");
    }
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-['Montserrat'] px-4 py-8">
      <img src={logo} alt="Logo" className="w-[116px] mb-8" />

      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-xl border border-gray-200 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Registro de Empresa</h2>
        
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

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nombre de la empresa"
              value={nombre_empresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Descripción de la empresa"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Logo (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="URL del logo (enlace a imagen)"
              value={logo_url}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setPreviewError(false); // Reinicia el error cuando se modifica el enlace
              }}
              required
              className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            
            {/* Previsualización de imagen */}
            {logo_url && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                  {!previewError ? (
                    <img
                      key={logo_url} // Fuerza a React a recargar la imagen cuando cambia el enlace
                      src={logo_url}
                      alt="Previsualización del logo"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="text-red-500 text-xs p-2 text-center">URL de imagen inválida</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Campos obligatorios
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md w-full"
          >
            Registrar Empresa
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una empresa registrada?{" "}
            <a href="/login" className="text-red-500 hover:text-red-600 font-medium">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegistroEmpresa;