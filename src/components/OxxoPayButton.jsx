// OxxoPayButton.jsx (Versión JSX/JavaScript)

import React from 'react';

// En JSX puro, no necesitas la definición de 'interface' ni 'React.FC<...>'

/**
 * Componente funcional para el botón de pago de OXXO.
 * @param {object} props
 * @param {() => void} props.onClick - Función al hacer clic.
 * @param {string} [props.label="Pagar en OXXO"] - Texto del botón.
 * @param {string} props.logoSrc - URL o path del logo de OXXO.
 */
const OxxoPayButton = ({ onClick, label = "Pagar en OXXO", logoSrc }) => {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D10000', // Rojo de OXXO
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        width: '100%' // Agregado para que ocupe todo el espacio disponible
      }}
      aria-label={label}
    >
      <img 
        src={logoSrc} 
        alt="Logo de OXXO Pay" 
        style={{ 
          height: '25px', 
          marginRight: '10px',
          backgroundColor: 'white',
          padding: '2px', 
          borderRadius: '3px'
        }}
      />
      
      <span>{label}</span>
    </button>
  );
};

export default OxxoPayButton;