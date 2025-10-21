import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getQueryParam(search, param) {
    const params = new URLSearchParams(search);
    return params.get(param);
}

const OAuthCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Procesando autenticación...");

    useEffect(() => {
        const code = getQueryParam(location.search, "code");
        if (!code) {
            setMessage("No se recibió código de autorización.");
            return;
        }
        // Cambia el redirectUri para que coincida con el configurado en las plataformas
        const redirectUri = "http://localhost:5173/";
        fetch(`${API_URL}/auth/${provider}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirectUri }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error en autenticación social");
                // Guardar token y usuario
                Cookies.set("token", data.token, { expires: 7 });
                Cookies.set("id_usuario", data.usuario._id, { expires: 7 });
                Cookies.set("rol", data.usuario.rol, { expires: 7 });
                if (data.usuario.empresa_id) {
                    Cookies.set("id_empresa", data.usuario.empresa_id, { expires: 7 });
                }
                // Redirigir según rol
                switch (data.usuario.rol) {
                    case "superadmin":
                    case "admin_empresa":
                        navigate("/usuarios");
                        break;
                    case "empleado":
                        navigate("/productos");
                        break;
                    case "usuario":
                    default:
                        navigate("/landing");
                }
            })
            .catch((err) => {
                setMessage("Error: " + err.message);
            });
    }, [provider, location.search, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded shadow text-center">
                <p>{message}</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
