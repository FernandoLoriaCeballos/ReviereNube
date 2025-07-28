import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import logoFooter from './assets/img/logo_footer.png';

import './assets/fonts/font-awesome.min.css';
import './assets/fonts/simple-line-icons.min.css';

function Contacto() {
  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        `}
      </style>
      
      {/* Integración de la nueva Navbar */}
      <Navbar />

      <main className="page landing-page">
        <section className="px-[10%]">
          <div className="container text-center py-[52px]">
            <div className="block-heading">
              <h2 className="text-white text-2xl font-bold mb-4">¿Tienes alguna pregunta o comentario?</h2>
              <p className="text-white text-base">
                ¡Déjanos saber! Completa el siguiente formulario y nos pondremos en contacto<br />
                contigo lo antes posible.
              </p>
            </div>
          </div>
          <div className="container">
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-4">
                <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="text" placeholder="Nombre" />
              </div>
              <div className="w-full md:w-1/2 px-4 mb-4">
                <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="email" placeholder="Email" />
              </div>
            </div>
            <div className="mb-4">
              <input className="w-full bg-[#1f2937] text-white p-4 rounded-xl" type="text" placeholder="Asunto" />
            </div>
            <div className="mb-4">
              <textarea className="w-full bg-[#1f2937] text-white p-4 rounded-xl h-[281px]" placeholder="Mensaje"></textarea>
            </div>
            <div className="flex justify-center">
              <button className="w-full bg-[#2563eb] text-white py-4 rounded-xl hover:bg-blue-600 transition duration-300">
                Enviar
              </button>
            </div>
          </div>
        </section>
        
        <section className="mt-[71px]">
          <div className="w-full bg-[#2563eb]">
            <div className="relative w-full pb-[30%]">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-50 pointer-events-none"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14905.403594583984!2d-89.6164944!3d20.938419!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f5672270a784baf%3A0x764b40010695f0d9!2sUniversidad%20Tecnol%C3%B3gica%20Metropolitana!5e0!3m2!1ses-419!2smx!4v1720054054661!5m2!1ses-419!2smx"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#111827] text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Contacto;