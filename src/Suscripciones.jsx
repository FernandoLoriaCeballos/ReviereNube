import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import './components/SuscripcionesView.css';
import Navbar from './components/Navbar'; 
import Cookies from 'js-cookie';

// ======================================================================
// 1. COMPONENTE NUEVO: MODAL DE CONFIRMACIÓN PARA CAMBIO DE PLAN
// ======================================================================
const InlineConfirmationModal = ({ planData, onClose, onConfirm }) => {
    return (
        <div className="checkout-modal-overlay"> 
            <div className="checkout-summary-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: '#dc3545' }}>Cambio de Membresía</h2>
                <div style={{ padding: '20px', margin: '15px 0', backgroundColor: '#fef3f3', border: '1px solid #dc3545', borderRadius: '8px', color: '#333' }}>
                    <p style={{ fontWeight: 'bold' }}>
                        ¿Deseas cambiar tu membresía activa por el plan "{planData.nombre}"?
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#6c757d' }}>
                        Si confirmas, tu plan actual será cancelado y este nuevo será activado.
                    </p>
                </div>

                <button 
                    onClick={onClose} 
                    style={{ padding: '10px 20px', marginRight: '15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#6c757d' }}
                >
                    No
                </button>
                <button 
                    onClick={onConfirm}
                    style={{ padding: '10px 20px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#dc3545' }}
                >
                    Sí, cambiar
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 1.5 COMPONENTE NUEVO: MODAL DE CONFIRMACIÓN PARA CANCELACIÓN SIMPLE
// ======================================================================
const InlineCancelConfirmationModal = ({ planId, onClose, onConfirm }) => {
    return (
        <div className="checkout-modal-overlay"> 
            <div className="checkout-summary-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: '#dc3545' }}>Confirmar Cancelación</h2>
                <div style={{ padding: '20px', margin: '15px 0', backgroundColor: '#fef3f3', border: '1px solid #dc3545', borderRadius: '8px', color: '#333' }}>
                    <p style={{ fontWeight: 'bold' }}>
                        ¿Estás seguro de que quieres cancelar esta suscripción?
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#6c757d' }}>
                        Tu plan se desactivará al final del periodo actual.
                    </p>
                </div>

                <button 
                    onClick={onClose} 
                    style={{ padding: '10px 20px', marginRight: '15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#6c757d' }}
                >
                    No
                </button>
                <button 
                    onClick={onConfirm}
                    style={{ padding: '10px 20px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#dc3545' }}
                >
                    Sí, cancelar
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 1.7 COMPONENTE NUEVO: MENSAJE DE CAMBIO DE MEMBRESÍA TEMPORAL
// ======================================================================
const TemporaryChangeMessage = ({ planNombre }) => {
    return (
        <div className="checkout-modal-overlay"> 
            <div className="checkout-summary-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: '#28a745' }}>Cambio de Membresía</h2>
                <div style={{ 
                    padding: '20px', 
                    margin: '15px 0', 
                    backgroundColor: '#e9f7ef', 
                    border: '2px solid #28a745', 
                    borderRadius: '8px', 
                    color: '#155724' 
                }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                        ¡Cambio exitoso al plan "{planNombre}"!
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                        Tu nueva suscripción está activa.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ======================================================================
// 1.8 COMPONENTE NUEVO: MODAL DE SUSCRIPCIÓN EXITOSA
// ======================================================================
const SubscriptionSuccessModal = ({ planNombre, fechaVencimiento, onClose }) => {
    return (
        <div className="checkout-modal-overlay"> 
            <div className="checkout-summary-box" style={{ maxWidth: '450px', textAlign: 'center' }}>
                <h2 style={{ color: '#28a745' }}>¡Suscripción Activada! 🎉</h2>
                <div style={{ 
                    padding: '20px', 
                    margin: '15px 0', 
                    backgroundColor: '#e9f7ef', 
                    border: '2px solid #28a745', 
                    borderRadius: '8px', 
                    color: '#155724' 
                }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                        Plan "{planNombre}" activado correctamente
                    </p>
                    <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                        Tu suscripción está ahora activa y podrás disfrutar de todos los beneficios.
                    </p>
                    {fechaVencimiento && (
                        <p style={{ 
                            marginTop: '15px', 
                            fontSize: '0.9em', 
                            fontWeight: 'bold',
                            padding: '8px',
                            backgroundColor: '#d4edda',
                            borderRadius: '4px'
                        }}>
                            📅 Vence: {new Date(fechaVencimiento).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <button 
                    onClick={onClose}
                    style={{ 
                        padding: '10px 25px', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        backgroundColor: '#28a745',
                        fontSize: '1em'
                    }}
                >
                    ¡Entendido!
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 2. COMPONENTE INLINE CHECKOUT SUMMARY (MODAL DE RESUMEN) - ACTUALIZADO CON STRIPE
// ======================================================================
const InlineCheckoutSummary = ({ planData, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleStripeCheckout = async () => {
    setLoading(true);
    try {
        const userId = Cookies.get("id_usuario");
        const userEmail = Cookies.get("user_email");

        if (!userId) {
            alert("Debes iniciar sesión para suscribirte");
            onClose();
            return;
        }

        console.log("📡 Enviando request a:", 'http://localhost:3000/create-subscription-checkout');
        
        const response = await fetch('http://localhost:3000/create-subscription-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_tipo: planData.tipo,
                userId: userId,
                userEmail: userEmail
            }),
        });

        console.log("📨 Response status:", response.status);
        
        // Verifica el contenido de la respuesta
        const responseText = await response.text();
        console.log("📄 Response content:", responseText);

        // Intenta parsear como JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("❌ Error parseando JSON:", parseError);
            throw new Error(`El servidor respondió con HTML en lugar de JSON. ¿Existe el endpoint?`);
        }

        if (data.success && data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Error al crear el checkout');
        }

    } catch (error) {
        console.error('Error iniciando checkout de Stripe:', error);
        alert('Error al procesar la suscripción: ' + error.message);
        setLoading(false);
    }
};

    return (
        <div className="checkout-modal-overlay"> 
            <div className="checkout-summary-box">
                <h2>Resumen de Suscripción</h2>
                <div style={{ padding: '20px', margin: '15px 0', backgroundColor: '#f4f4f4', borderRadius: '8px', color: '#333' }}>
                    <h3>Plan: {planData.nombre}</h3>
                    <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Precio: {planData.precio}/mes</p>
                    <p style={{ marginTop: '10px', color: '#666' }}>
                        Serás redirigido a Stripe para completar el pago de tu suscripción.
                    </p>
                </div>

                <button 
                    onClick={onClose} 
                    disabled={loading}
                    style={{ padding: '10px 20px', marginRight: '15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#6c757d' }}
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleStripeCheckout}
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        backgroundColor: loading ? '#6c757d' : '#007bff',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Procesando...' : 'Continuar a Pago'}
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 3. COMPONENTE PLAN CARD (Actualizado para mostrar estado real - MÁS VISIBLE)
// ======================================================================
const PlanCard = ({ nombre, precio, caracteristicas, onSuscribir, onCancelar, isActivo, planType, isPendiente, estadoSuscripcion }) => {
    let buttonText = "ADQUIRIR";
    let onClickAction = onSuscribir;
    let buttonStyle = { backgroundColor: '#fd9c00ff', background: '#f78828ff' };

    if (isActivo) {
        buttonText = "CANCELAR SUSCRIPCIÓN";
        onClickAction = onCancelar;
        buttonStyle = { backgroundColor: '#dc3545', background: '#dc3545', color: 'white' };
    } else if (isPendiente) {
        buttonText = "PENDIENTE DE PAGO";
        buttonStyle = { backgroundColor: '#ffc107', background: '#ffc107', color: '#333', cursor: 'not-allowed' };
        onClickAction = () => {};
    }

    return (
        <div className={`plan-card ${planType} ${isActivo ? 'activo' : ''} ${isPendiente ? 'pendiente' : ''}`} 
             style={isActivo ? {
                 border: '3px solid #28a745',
                 boxShadow: '0 0 20px rgba(40, 167, 69, 0.3)',
                 transform: 'scale(1.02)',
                 position: 'relative'
             } : {}}>
            
            {/* BADGE DE PLAN ACTIVO - MUY VISIBLE */}
            {isActivo && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '15px',
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    zIndex: 10,
                    boxShadow: '0 2px 10px rgba(40, 167, 69, 0.5)'
                }}>
                    ✅ PLAN ACTIVO
                </div>
            )}

            <div className="plan-card-header">
                <h3>{nombre}</h3>
                <p className="precio">
                    {precio}<span>/ mes</span>
                </p>
            </div>
            
            <div className="plan-card-content">
                <ul> 
                    {caracteristicas.map((caracteristica, index) => (
                        <li key={index}>
                            {caracteristica.startsWith('❌') ? (
                                <span className="icon-cross">❌</span>
                            ) : (
                                <span className="icon-check">✅</span>
                            )}
                            {caracteristica.replace(/^[✅❌]\s*/, '')} 
                        </li>
                    ))}
                </ul>
                
                <button 
                    className="boton-suscribir" 
                    onClick={onClickAction}
                    style={buttonStyle}
                    disabled={isPendiente}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 4. COMPONENTE PRINCIPAL (SuscripcionesView) - ACTUALIZADO CON STRIPE
// ======================================================================
const SuscripcionesView = () => {
    const navigate = useNavigate();
    
    // Estados para suscripciones reales
    const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para modales
    const [selectedPlan, setSelectedPlan] = useState(null); 
    const [showSummary, setShowSummary] = useState(false); 
    const [showConfirmation, setShowConfirmation] = useState(false); 
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showSuccessChangeMessage, setShowSuccessChangeMessage] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successPlanName, setSuccessPlanName] = useState('');

    // Cargar estado de suscripción al montar el componente
    useEffect(() => {
        cargarEstadoSuscripcion();
    }, []);

    // Detectar cuando el usuario regresa de un pago exitoso
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        
        if (success) {
            // Recargar el estado de suscripción
            cargarEstadoSuscripcion();
            
            // Esperar un momento para que se cargue el estado y luego mostrar el modal
            setTimeout(() => {
                // Determinar qué plan se activó y su fecha de vencimiento
                const activePlan = estadoSuscripcion?.suscripcion?.nombre_plan || 'Premium';
                setSuccessPlanName(activePlan);
                
                // Mostrar modal de éxito
                setShowSuccessModal(true);
            }, 1500);
            
            // Limpiar la URL
            window.history.replaceState({}, '', '/suscripciones');
        }
    }, [estadoSuscripcion]);

    const cargarEstadoSuscripcion = async () => {
        const userId = Cookies.get("id_usuario");
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/suscripcion/estado/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                setEstadoSuscripcion(data);
            }
        } catch (error) {
            console.error('Error cargando estado de suscripción:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función que inicia el proceso de suscripción
    const handleSuscribir = (planData) => {
        const userId = Cookies.get("id_usuario");
        if (!userId) {
            alert("Debes iniciar sesión para suscribirte");
            navigate('/login');
            return;
        }

        // Si hay una suscripción activa, muestra el modal de confirmación
        if (estadoSuscripcion?.tiene_suscripcion) {
            setSelectedPlan(planData);
            setShowConfirmation(true);
            return;
        }

        // Si no hay suscripción activa, muestra el resumen de pago
        setSelectedPlan(planData);
        setShowSummary(true); 
    };
    
    // Función para manejar el "Sí, cambiar" en el modal de confirmación
    const handleConfirmChange = async () => {
        if (!selectedPlan) return;

        try {
            // Primero cancelar la suscripción actual
            const userId = Cookies.get("id_usuario");
            const cancelResponse = await fetch('http://localhost:3000/suscripcion/cancelar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const cancelData = await cancelResponse.json();

            if (cancelData.success) {
                setShowConfirmation(false);
                // Ahora proceder con la nueva suscripción
                setShowSummary(true);
            } else {
                throw new Error(cancelData.error || 'Error al cancelar suscripción anterior');
            }
            
        } catch (error) {
            console.error("Error al cambiar suscripción:", error);
            alert("Error al cambiar suscripción: " + error.message);
            setShowConfirmation(false);
            setSelectedPlan(null);
        }
    };
    
    // Lógica para cancelar la suscripción
    const handleCancelar = () => {
        setShowCancelConfirmation(true);
    };
    
    // Función que se llama al confirmar la cancelación
    const handleConfirmCancel = async () => {
        const userId = Cookies.get("id_usuario");
        if (!userId) return;

        try {
            const response = await fetch('http://localhost:3000/suscripcion/cancelar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (data.success) {
                setEstadoSuscripcion({ tiene_suscripcion: false });
                alert("Suscripción cancelada exitosamente");
            } else {
                throw new Error(data.error || 'Error al cancelar suscripción');
            }
        } catch (error) {
            console.error("Error cancelando suscripción:", error);
            alert("Error al cancelar suscripción: " + error.message);
        } finally {
            setShowCancelConfirmation(false);
        }
    };
    
    // Datos de Planes actualizados para coincidir con el backend
    const planes = [
        {
          id: 1, 
          tipo: 'basica',
          nombre: 'BÁSICO', 
          precio: '$300.00', 
          caracteristicas: [
              '✅ Hasta 50 productos', 
              '✅ Dashboard básico', 
              '✅ Soporte por email', 
              '✅ Reportes mensuales'
          ], 
          planType: 'basic', 
        },
        {
          id: 2, 
          tipo: 'premium',
          nombre: 'PROFESIONAL', 
          precio: '$600.00', 
          caracteristicas: [
              '✅ Productos ilimitados',
              '✅ Dashboard avanzado', 
              '✅ Soporte prioritario',
              '✅ Reportes en tiempo real',
              '✅ API access'
          ], 
          planType: 'standart',
        },
        {
          id: 3, 
          tipo: 'empresarial',
          nombre: 'EMPRESA', 
          precio: '$900.00', 
          caracteristicas: [
              '✅ Todo lo del Premium',
              '✅ Soporte 24/7',
              '✅ Usuarios ilimitados', 
              '✅ White-label',
              '✅ Onboarding personalizado'
          ], 
          planType: 'premium',
        },
    ];

    if (loading) {
        return (
            <div className="pagina-suscripciones">
                <Navbar />
                <div className="suscripciones-container">
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Cargando información de suscripción...</p>
                    </div>
                </div>
            </div>
        );
    }
        
    return (
        <div className="pagina-suscripciones">
            <Navbar /> 
            
            <div className="suscripciones-container">
                <h1>Elige el plan que mejor se adapta a ti</h1>
                <p className="subtitulo">Disfruta de todo nuestro contenido sin límites.</p>

                <div className="planes-grid">
                  {planes.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      nombre={plan.nombre}
                      precio={plan.precio}
                      caracteristicas={plan.caracteristicas}
                      planType={plan.planType} 
                      onSuscribir={() => handleSuscribir(plan)}
                      onCancelar={handleCancelar}
                      isActivo={estadoSuscripcion?.tiene_suscripcion && estadoSuscripcion.suscripcion.plan === plan.tipo}
                      estadoSuscripcion={estadoSuscripcion}
                    />
                  ))}
                </div>
            </div>
            
            {/* MODAL DE RESUMEN DE PAGO */}
            {selectedPlan && showSummary && (
                <InlineCheckoutSummary 
                    planData={selectedPlan} 
                    onClose={() => {
                        setShowSummary(false); 
                        setSelectedPlan(null);
                    }} 
                />
            )}
            
            {/* MODAL DE CONFIRMACIÓN DE CAMBIO DE PLAN */}
            {selectedPlan && showConfirmation && (
                <InlineConfirmationModal
                    planData={selectedPlan}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleConfirmChange}
                />
            )}

            {/* MENSAJE TEMPORAL DE ÉXITO DE CAMBIO */}
            {selectedPlan && showSuccessChangeMessage && (
                <TemporaryChangeMessage planNombre={selectedPlan.nombre} />
            )}
            
            {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
            {showCancelConfirmation && (
                <InlineCancelConfirmationModal
                    planId={estadoSuscripcion?.suscripcion?.id}
                    onClose={() => setShowCancelConfirmation(false)}
                    onConfirm={handleConfirmCancel}
                />
            )}

            {/* MODAL DE SUSCRIPCIÓN EXITOSA */}
            {showSuccessModal && (
                <SubscriptionSuccessModal 
                    planNombre={successPlanName}
                    fechaVencimiento={estadoSuscripcion?.suscripcion?.fecha_vencimiento}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </div>
    );
}

export default SuscripcionesView;