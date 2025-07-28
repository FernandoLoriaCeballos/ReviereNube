import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from './components/Navbar';
import logoFooter from './assets/img/logo_footer.png';
import slide1 from './assets/img/1.jpg';
import slide2 from './assets/img/2.jpg';
import slide3 from './assets/img/3.jpg';
import inicio1 from './assets/img/inicio1.png';
import inicio2 from './assets/img/inicio2.jpg';

import './assets/fonts/font-awesome.min.css';
import './assets/fonts/simple-line-icons.min.css';

function Inicio() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700&display=swap');
        `}
      </style>
      
      <Navbar />

      <div className="overflow-hidden">
        <Slider {...sliderSettings}>
          <div>
            <img src={slide1} alt="Slide 1" className="w-full h-auto" />
          </div>
          <div>
            <img src={slide2} alt="Slide 2" className="w-full h-auto" />
          </div>
          <div>
            <img src={slide3} alt="Slide 3" className="w-full h-auto" />
          </div>
        </Slider>
      </div>

      <main>
        <section className="bg-[#111827] py-8 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">¡Bienvenidos a Reverie, donde sus ideas cobran vida digitalmente!</h2>
              <p className="text-white text-sm sm:text-lg">
                Somos una empresa de diseño web comprometida en transformar su visión en una experiencia en línea única e innovadora.<br />
                Nuestra dedicación a la excelencia se refleja en cada proyecto que emprendemos, asegurando que su sitio web no solo<br />
                sea visualmente atractivo, sino también funcional y optimizado para el rendimiento.
              </p>
            </div>
            <div className="border-4 border-[#2563eb] rounded-lg p-6 sm:p-8 mt-8 sm:mt-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 flex justify-center">
                  <img src={inicio1} alt="Inicio 1" className="max-w-full h-auto" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0 text-center md:text-left">
                  <h2 className="text-white text-lg sm:text-2xl font-bold">
                    Descubra cómo nuestras soluciones<br />
                    personalizadas pueden agregar un valor<br />
                    significativo a su negocio
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section
          className="bg-cover bg-center relative mb-0"
          style={{
            backgroundImage: `url(${inicio2})`,
            height: '300px', // Ajusta el valor según lo necesario
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-8">¡Conoce todos nuestros productos!</h2>
            <Link to="/landing">
              <button className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-white hover:text-[#111827] transition duration-300">
                Ver Más
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#111827] text-white py-4">
        <div className="container mx-auto text-center">
          <img src={logoFooter} alt="Logo Footer" className="w-24 sm:w-40 mx-auto mb-4" />
          <p className="text-gray-400 mt-4 font-light text-sm sm:text-base">© 2024 Reverie Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Inicio;