import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 Detecta callback OAuth (Google/Microsoft)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const provider = localStorage.getItem("oauth_provider");
    const redirectUri = "http://localhost:5173/";

    if (code && provider) {
      setLoading(true);
      fetch(`${API_URL}/auth/${provider}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          localStorage.removeItem("oauth_provider");
          if (data.token && data.usuario) {
            Cookies.set("token", data.token, { expires: 7 });
            Cookies.set("id_usuario", data.usuario._id, { expires: 7 });
            Cookies.set("rol", data.usuario.rol, { expires: 7 });
            if (data.usuario.empresa_id) {
              Cookies.set("id_empresa", data.usuario.empresa_id, { expires: 7 });
            }
            setMessage("Registro exitoso con " + provider);
            setAlertType("success");
            setTimeout(() => navigate("/landing", { replace: true }), 1500);
          } else {
            setMessage("No se pudo autenticar con el proveedor.");
            setAlertType("error");
          }
        })
        .catch(() => {
          setLoading(false);
          localStorage.removeItem("oauth_provider");
          setMessage("Error en la autenticación social.");
          setAlertType("error");
        });
    }
  }, [location.search, navigate]);

  // ✏️ Manejo de inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Validaciones básicas
  const validarCampos = () => {
    setMessage("");
    setAlertType("");

    const camposVacios = ["nombre", "email", "password"].filter(
      (campo) => !formData[campo].trim()
    );

    if (camposVacios.length > 0) {
      setMessage("Por favor completa todos los campos obligatorios.");
      setAlertType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Por favor, ingresa un email válido.");
      setAlertType("error");
      return false;
    }

    if (formData.password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      setAlertType("error");
      return false;
    }

    return true;
  };

  // 📩 Registro normal
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setAlertType("success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al registrar el usuario. Intenta nuevamente.");
      setAlertType("error");
    }
  };

  // 🔗 Autenticación social (Google / Microsoft)
  const handleSocialRegister = (provider) => {
    let clientId = "";
    let redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    let authUrl = "";

    switch (provider) {
      case "google":
        clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
        break;

      case "microsoft":
        clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid%20email%20profile%20offline_access`;
        break;

      default:
        return;
    }

    localStorage.setItem("oauth_provider", provider);
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-['Montserrat']">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Registrar Usuario
        </h2>

        {message && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              alertType === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-green-50 border-green-500 text-green-700"
            } flex items-center`}
          >
            <p className="text-sm font-medium flex-1">{message}</p>
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

        {/* 📝 Registro normal */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              type="text"
              required
              className="border rounded-lg w-full py-3 px-3 bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Introduce tu Nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              className="border rounded-lg w-full py-3 px-3 bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Introduce tu Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              required
              className="border rounded-lg w-full py-3 px-3 bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Introduce tu Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md w-full"
          >
            Registrar
          </button>
        </form>

        {/* 🌐 Registro con redes */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50"
          >
            <FcGoogle className="w-5 h-5 mr-2" /> Iniciar sesión con Google
          </button>

          <button
            onClick={() => handleSocialLogin("microsoft")}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            <FaMicrosoft className="w-5 h-5 mr-2" /> Iniciar sesión con Microsoft
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-red-500 hover:text-red-600 font-medium">
            ¡Inicia Sesión!
          </a>
        </div>
      </div>
    </div>
  );
}

export default Registro;
