import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
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