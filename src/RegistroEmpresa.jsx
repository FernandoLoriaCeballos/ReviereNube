import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RegistroEmpresa() {
  const [nombre_empresa, setNombreEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [logoStr, setLogoStr] = useState(""); // nombre o identificador del logo
  const [logoFile, setLogoFile] = useState(null); // archivo de imagen
  const [logoPreview, setLogoPreview] = useState(null); // vista previa
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" o "success"
  const navigate = useNavigate();

  // ===== Validaciones =====
  const validarCampos = () => {
    setMessage("");
    setAlertType("");

    if (!nombre_empresa.trim() || !email.trim() || !password.trim() || !descripcion.trim() || !telefono.trim()) {
      setMessage("Por favor, completa todos los campos obligatorios.");
      setAlertType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Por favor, ingresa un email válido.");
      setAlertType("error");
      return false;
    }

    const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
    if (!telefonoRegex.test(telefono)) {
      setMessage("Por favor, ingresa un teléfono válido.");
      setAlertType("error");
      return false;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      setAlertType("error");
      return false;
    }

    if (!logoFile && !logoStr.trim()) {
      setMessage("Debes subir un logo o escribir un identificador de logo.");
      setAlertType("error");
      return false;
    }

    return true;
  };

  // ===== Mostrar vista previa =====
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  // ===== Enviar formulario =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    try {
      const fd = new FormData();
      fd.append("nombre_empresa", nombre_empresa);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("descripcion", descripcion);
      fd.append("telefono", telefono);

      if (logoFile) {
        fd.append("logo", logoFile);
      } else if (logoStr.trim()) {
        fd.append("logoStr", logoStr.trim());
      }

      const resp = await fetch(`${API_URL}/registro/empresa`, {
        method: "POST",
        body: fd, // el navegador se encarga del Content-Type
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setMessage(data.message || `Error al registrar empresa: ${resp.status}`);
        setAlertType("error");
        return;
      }

      // Mostrar vista previa si backend devuelve el nombre del archivo
      const logoUrl =
        data.logoUrl ||
        (data.logo && `${API_URL}/uploads/companies/${data.logo}`) ||
        null;
      if (logoUrl) setLogoPreview(logoUrl);

      setMessage(data.message || "Empresa registrada correctamente.");
      setAlertType("success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al registrar la empresa. Intenta nuevamente.");
      setAlertType("error");
    }
  };

  return (
    <>
      {/* --- NAV (insertado) --- */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/homeadmin" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">DASHBOARD</a>
            <a href="/usuarios" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">USUARIOS</a>
            <a href="/productos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">PRODUCTOS</a>
            <a href="/empresas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">SUCURSALES</a>
            <a href="/sucursales" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">INVENTARIO(S)</a>
            <a href="/recibos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RECIBOS</a>
            <a href="/reporte-ventas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">REPORTE DE VENTAS</a>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-['Montserrat'] px-4 py-8">
        <img src={logo} alt="Logo" className="w-[116px] mb-8" />

        <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-xl border border-gray-200 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Registro de Empresa</h2>

          {/* Mensajes de alerta */}
          {message && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                alertType === "error"
                  ? "bg-red-50 border-red-500 text-red-700"
                  : "bg-green-50 border-green-500 text-green-700"
              } flex items-center`}
            >
              <div className="flex-1 text-sm font-medium">{message}</div>
              <button
                onClick={() => {
                  setMessage("");
                  setAlertType("");
                }}
                className="ml-3 text-lg hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Campo label="Nombre de la Empresa" value={nombre_empresa} onChange={setNombreEmpresa} required />
            <Campo label="Email" type="email" value={email} onChange={setEmail} required />
            <Campo label="Contraseña" type="password" value={password} onChange={setPassword} required note="Mínimo 6 caracteres" />
            <Campo label="Descripción" type="textarea" value={descripcion} onChange={setDescripcion} required />
            <Campo label="Teléfono" type="tel" value={telefono} onChange={setTelefono} required />

            {/* Logo */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Logo <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              <span className="text-sm text-gray-500 block mb-2">
                O ingresa un nombre/identificador (si ya tienes un archivo subido)
              </span>
              <input
                type="text"
                placeholder="logo_empresa.png o identificador"
                value={logoStr}
                onChange={(e) => setLogoStr(e.target.value)}
                className="shadow border rounded-lg w-full py-3 px-3 bg-gray-50 border-gray-300 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />

              {logoPreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
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

          <div className="text-center text-sm text-gray-600">
            ¿Ya tienes una empresa registrada?{" "}
            <a href="/login" className="text-red-500 hover:text-red-600 font-medium">
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente auxiliar para reducir código repetido
function Campo({ label, type = "text", value, onChange, required, note }) {
  const inputProps = {
    value,
    onChange: (e) => onChange(e.target.value),
    required,
    className:
      "shadow appearance-none border rounded-lg w-full py-3 px-3 bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
  };

  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea {...inputProps} rows={3} className={inputProps.className + " resize-none"} />
      ) : (
        <input {...inputProps} type={type} />
      )}
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

export default RegistroEmpresa;
