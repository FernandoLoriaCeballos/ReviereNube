import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from "./assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" o "success"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lógica para manejar el code OAuth2 en el login
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const provider = localStorage.getItem("oauth_provider");
    // Define el redirectUri exactamente igual al usado en el flujo OAuth2 y registrado en Google/Microsoft
    const redirectUri = "http://localhost:5173/";
    if (code && provider) {
      setLoading(true);
      fetch(`${API_URL}/auth/${provider}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          localStorage.removeItem("oauth_provider");
          if (data.token && data.usuario) {
            Cookies.set("token", data.token, { expires: 7 });
            Cookies.set("id_usuario", data.usuario._id, { expires: 7 });
            Cookies.set("rol", data.usuario.rol, { expires: 7 });
            if (data.usuario.empresa_id) {
              Cookies.set("id_empresa", data.usuario.empresa_id, { expires: 7 });
            }
            switch (data.usuario.rol) {
              case "superadmin":
              case "admin_empresa":
                navigate("/usuarios", { replace: true });
                break;
              case "empleado":
                navigate("/productos", { replace: true });
                break;
              default:
                navigate("/landing", { replace: true });
            }
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

        // Redirige inmediatamente después del login exitoso
        switch (data.rol) {
          case "superadmin":
          case "admin_empresa":
            navigate("/usuarios", { replace: true });
            break;
          case "empleado":
            navigate("/productos", { replace: true });
            break;
          case "usuario":
          default:
            navigate("/landing", { replace: true });
        }
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

  // NUEVO: Función para OAuth
  const handleSocialLogin = (provider) => {
    let clientId = "";
    let redirectUri = `http://localhost:5173/`;
    let authUrl = "";

    if (provider === "google") {
      clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    } else if (provider === "microsoft") {
      clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
      const scope = "openid email profile";
      // Usa /common porque tu app ya es multi-tenant
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scope)}`;
    } else {
      return;
    }
    localStorage.setItem("oauth_provider", provider);
    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-gray-100 overflow-hidden">
      {/* Fondo desenfocado */}
      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <img src={logo} alt="Logo" className="w-28 mb-2" />
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-2">Iniciar Sesión</h2>

        {loading && (
          <div className="w-full flex justify-center items-center py-4">
            <span className="text-gray-500">Procesando autenticación...</span>
          </div>
        )}

        {!loading && message && (
          <div className={`p-4 rounded-lg border-l-4 ${alertType === "error"
            ? "bg-red-50 border-red-500 text-red-700"
            : "bg-green-50 border-green-500 text-green-700"
            } flex items-center w-full`}>
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

        {!loading && (
          <>
            <form className="space-y-5 w-full" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                  placeholder="Introduce tu Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
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

            <div className="flex items-center w-full my-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-3 text-gray-400 text-xs font-semibold">o ingresa con</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition text-gray-700 font-semibold"
              >
                <span className="mr-2">
                  {/* Google SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <g>
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.23l6.88-6.88C35.64 2.13 30.18 0 24 0 14.82 0 6.73 5.8 2.69 14.09l8.06 6.26C12.6 13.98 17.85 9.5 24 9.5z" />
                      <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.92-2.18 5.39-4.65 7.06l7.18 5.59C43.93 37.01 46.1 31.33 46.1 24.55z" />
                      <path fill="#FBBC05" d="M10.75 28.35a14.5 14.5 0 010-8.7l-8.06-6.26A23.97 23.97 0 000 24c0 3.97.97 7.73 2.69 11.09l8.06-6.26z" />
                      <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.59l-7.18-5.59c-2 1.34-4.56 2.13-7.96 2.13-6.15 0-11.4-4.48-13.25-10.5l-8.06 6.26C6.73 42.2 14.82 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </g>
                  </svg>
                </span>
                Iniciar sesión con Google
              </button>
              <button
                onClick={() => handleSocialLogin("microsoft")}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
              >
                <span className="mr-2">
                  {/* Microsoft SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <rect fill="#F35325" x="1" y="1" width="10" height="10" />
                    <rect fill="#81BC06" x="13" y="1" width="10" height="10" />
                    <rect fill="#05A6F0" x="1" y="13" width="10" height="10" />
                    <rect fill="#FFBA08" x="13" y="13" width="10" height="10" />
                  </svg>
                </span>
                Iniciar sesión con Microsoft
              </button>
            </div>
          </>
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          <span className="text-red-500">*</span> Campos obligatorios
        </div>

        <div className="text-center space-y-2 mt-2">
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