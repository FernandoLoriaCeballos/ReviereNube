import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login';
import Registro from './Registro';
import Usuarios from './Usuarios';
import Sucursales from './components/Sucursales.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Si deseas eliminar completamente el Service Worker, simplemente elimina o comenta este bloque de código.
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js') // Ruta al Service Worker
//       .then((registration) => {
//         console.log('Service Worker registrado con éxito:', registration);
//       })
//       .catch((error) => {
//         console.error('Error al registrar el Service Worker:', error);
//       });
//   });
// }