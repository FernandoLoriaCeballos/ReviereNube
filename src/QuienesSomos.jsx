import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import logoFooter from './assets/img/logo_footer.png';
import qnsms from './assets/img/qnsms.jpg';

import './assets/fonts/font-awesome.min.css';
import './assets/fonts/simple-line-icons.min.css';

function QuienesSomos() {
  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        `}
      </style>
      
      {/* Integración de la nueva Navbar */}
      <Navbar />

      <main>
        <img src={qnsms} alt="Quienes Somos" className="w-full" />
        
        <section className="bg-[#111827] py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-white text-base mb-4">
                En Reverie, no somos solo una empresa de diseño web, somos tu socio en el viaje digital. Nuestra rica historia de innovación<br/>
                y nuestra pasión por la tecnología nos han permitido ayudar a numerosas marcas a contar sus historias de manera<br/>
                efectiva y atractiva.
              </p>
              <h2 className="text-white text-2xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-white text-base mb-4">
                Comprendemos las necesidades únicas de cada cliente. Ofrecemos soluciones a medida que reflejan su visión<br/>
                y objetivos. Creemos que el diseño no solo es estético, sino también funcional y transformador.
              </p>
              <p className="text-white text-base font-bold">
                ¡Bienvenidos a Reverie, donde las ideas cobran vida digitalmente!
              </p>
            </div>
          </div>
          
          <div className="container mx-auto px-4 border-4 border-[#2563eb] rounded-lg p-8 mt-12">
            <div className="flex flex-col lg:flex-row items-center justify-center">
              <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8 lg:pl-16">
                <p className="text-white text-base text-center lg:text-left">
                  Nuestro equipo está formado por expertos en diseño,<br/>
                  desarrollo y estrategia digital. Trabajamos juntos con<br/>
                  un objetivo común: crear experiencias web<br/>
                  excepcionales.<br/>
                  Creemos en el poder del diseño para resolver<br/>
                  problemas y mejorar la vida de las personas.
                </p>
              </div>
              <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                  {[
                    'Moises Aitor Estevez Cordova', 
                    'Fernando Javier Loria Ceballos', 
                    'Jose Luis Puga Perez',
                    'Julio Esteban Gonzalez Molina'
                  ].map((name, index) => {
                    const getOcupacion = (idx) => {
                      switch(idx) {
                        case 0:
                          return 'Diseñador grafico, Programacion';
                        case 1:
                          return 'Youtuber, Programador';
                        case 2:
                          return 'Programador';
                        case 3:
                          return 'Programador';
                        default:
                          return '';
                      }
                    };

                    return (
                      <div key={index} className="bg-[#202938] p-6 rounded-lg text-center w-72 shadow-xl transform transition-transform hover:scale-105">
                        <i className="fa fa-user-circle text-white mb-4" style={{ fontSize: '100px' }}></i>
                        <h3 className="text-white text-lg font-bold mb-3">{name}</h3>
                        <p className="text-white text-sm">
                          Estudiante de entornos virtuales<br/>
                          {getOcupacion(index)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
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

export default QuienesSomos;