import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './components/SuscripcionesView.css';
import Navbar from './components/Navbar';
import Cookies from 'js-cookie';

// ======================================================================
// 1. MODAL DE CONFIRMACIÓN PARA CAMBIO DE PLAN
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
// 2. MODAL DE CONFIRMACIÓN PARA CANCELACIÓN
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
// 3. MENSAJE TEMPORAL DE CAMBIO EXITOSO
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
// 4. MODAL DE SUSCRIPCIÓN EXITOSA
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
// 5. MODAL DE RESUMEN DE PAGO (Stripe)
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

            const responseText = await response.text();
            console.log("📄 Response content:", responseText);

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
                    onClick={handleStripeCheckout}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: loading ? '#6c757d' : '#CE4104',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Procesando...' : 'Continuar Pago'}
                </button>

                <button
                    onClick={onClose}
                    disabled={loading}
                    style={{ padding: '10px 20px', marginRight: '15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#991414' }}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

// ======================================================================
// 6. COMPONENTE PLAN CARD INDIVIDUAL
// ======================================================================
const PlanCard = ({ nombre, precio, caracteristicas, onSuscribir, onCancelar, isActivo, planType, isPendiente, estadoSuscripcion }) => {
    let buttonText = "ADQUIRIR";
    let onClickAction = onSuscribir;
    // Estilo por defecto (si no se aplica el CSS global)
    let buttonStyle = {};

    if (isActivo) {
        buttonText = "CANCELAR SUSCRIPCIÓN";
        onClickAction = onCancelar;
        buttonStyle = { background: '#dc3545', boxShadow: 'none' };
    } else if (isPendiente) {
        buttonText = "PENDIENTE DE PAGO";
        buttonStyle = { background: '#ffc107', color: '#333', cursor: 'not-allowed' };
        onClickAction = () => { };
    }

    return (
        <div className={`plan-card ${planType} ${isActivo ? 'activo' : ''} ${isPendiente ? 'pendiente' : ''}`}
            style={isActivo ? {
                border: '3px solid #28a745',
                boxShadow: '0 0 20px rgba(40, 167, 69, 0.3)',
                transform: 'scale(1.02)',
                position: 'relative'
            } : {}}>

            {/* BADGE DE PLAN ACTIVO - Solo visible si isActivo es true */}
            {isActivo && (
                <div style={{
                    position: 'absolute',
                    top: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    zIndex: 10,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    ✅ PLAN ACTIVO
                </div>
            )}

            <div className="plan-card-header">
                <h3>{nombre}</h3>
                <p className="precio">
                    {precio}
                    <span>/ mes</span>
                </p>
            </div>

            <div className="plan-card-content">
                <ul>
                    {caracteristicas.map((caracteristica, index) => (
                        <li key={index}>
                            {caracteristica.startsWith('❌') ? (
                                <span className="icon-cross"></span>
                            ) : (
                                <span className="icon-check"></span>
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
// 7. VISTA PRINCIPAL DE SUSCRIPCIONES
// ======================================================================
const SuscripcionesView = () => {
    const navigate = useNavigate();
    const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showSuccessChangeMessage, setShowSuccessChangeMessage] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successPlanName, setSuccessPlanName] = useState('');

    useEffect(() => {
        cargarEstadoSuscripcion();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        if (success) {
            cargarEstadoSuscripcion();
            setTimeout(() => {
                const activePlan = estadoSuscripcion?.suscripcion?.nombre_plan || 'Premium';
                setSuccessPlanName(activePlan);
                setShowSuccessModal(true);
            }, 1500);
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

    const handleSuscribir = (planData) => {
        const userId = Cookies.get("id_usuario");
        if (!userId) {
            alert("Debes iniciar sesión para suscribirte");
            navigate('/login');
            return;
        }
        // Lógica de suscripción estándar
        if (estadoSuscripcion?.tiene_suscripcion) {
            if (estadoSuscripcion.suscripcion.plan === planData.tipo) return;
            setSelectedPlan(planData);
            setShowConfirmation(true);
            return;
        }
        setSelectedPlan(planData);
        setShowSummary(true);
    };

    const handleConfirmChange = async () => {
        if (!selectedPlan) return;
        try {
            const userId = Cookies.get("id_usuario");
            const cancelResponse = await fetch('http://localhost:3000/suscripcion/cancelar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const cancelData = await cancelResponse.json();
            if (cancelData.success) {
                setShowConfirmation(false);
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

    const handleCancelar = () => {
        setShowCancelConfirmation(true);
    };

    const handleConfirmCancel = async () => {
        const userId = Cookies.get("id_usuario");
        if (!userId) return;
        try {
            const response = await fetch('http://localhost:3000/suscripcion/cancelar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // --- LISTA DE PLANES (CORREGIDO: standart -> standard) ---
    const planes = [
        {
            id: 1,
            tipo: 'basica',
            nombre: 'BÁSICO',
            precio: '$299.99',
            caracteristicas: [
                'Gestion de Inventario',
                'Catalogo de Productos',
                'Catalogo de Usuarios',
                'Carrito de Compras'
            ],
            planType: 'basic',
        },
        {
            id: 2,
            tipo: 'premium',
            nombre: 'PROFESIONAL',
            precio: '$599.99',
            caracteristicas: [
                'Gestion de Inventario',
                'Catalogo de Productos',
                'Catalogo de Usuarios',
                'Carrito de Compras',
                'Registro de Compras Realizadas',
                'Reportes de Ventas',
            ],
            planType: 'standard', // CORREGIDO AQUÍ (antes decía standart)
        },
        {
            id: 3,
            tipo: 'empresarial',
            nombre: 'EMPRESARIAL',
            precio: '$999.99',
            caracteristicas: [
                'Gestion de Inventario',
                'Catalogo de Productos',
                'Catalogo de Usuarios + roles de Sucursales',
                'Carrito de Compras',
                'Registro de Compras Realizadas',
                'Reportes de Ventas',
                'Catalogo de Sucursales',

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

                            // CAMBIO CLAVE: Forzamos a 'false' para que el usuario vea siempre los botones ADQUIRIR
                            // hasta que arregle su estado o realice una compra real nueva.
                            // Si prefieres que se detecte real, cambia 'false' por la lógica comentada abajo.
                            isActivo={false}

                            // Lógica real (descomentar cuando se quiera activar detección automática):
                            // isActivo={estadoSuscripcion?.tiene_suscripcion && estadoSuscripcion.suscripcion.plan === plan.tipo}

                            estadoSuscripcion={estadoSuscripcion}
                        />
                    ))}
                </div>
            </div>

            {selectedPlan && showSummary && (
                <InlineCheckoutSummary planData={selectedPlan} onClose={() => { setShowSummary(false); setSelectedPlan(null); }} />
            )}

            {selectedPlan && showConfirmation && (
                <InlineConfirmationModal planData={selectedPlan} onClose={() => setShowConfirmation(false)} onConfirm={handleConfirmChange} />
            )}

            {selectedPlan && showSuccessChangeMessage && (
                <TemporaryChangeMessage planNombre={selectedPlan.nombre} />
            )}

            {showCancelConfirmation && (
                <InlineCancelConfirmationModal planId={estadoSuscripcion?.suscripcion?.id} onClose={() => setShowCancelConfirmation(false)} onConfirm={handleConfirmCancel} />
            )}

            {showSuccessModal && (
                <SubscriptionSuccessModal planNombre={successPlanName} fechaVencimiento={estadoSuscripcion?.suscripcion?.fecha_vencimiento} onClose={() => setShowSuccessModal(false)} />
            )}
        </div>
    );
}

export default SuscripcionesView;