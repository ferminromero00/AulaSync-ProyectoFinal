import { useState, useEffect, useRef, useContext } from "react"
import { BookOpen, Plus, X, Users, ChevronRight, AlertTriangle, Loader2, GraduationCap } from "lucide-react"
import { buscarClasePorCodigo, unirseAClase, salirDeClase, getClasesAlumno } from "../../services/clases"
import { responderInvitacion } from '../../services/invitaciones';
import { Link, useNavigate } from "react-router-dom"
import toast, { Toaster } from 'react-hot-toast'; // Modificar esta línea
import NotificationButton from '../../components/NotificationButton';
import { GlobalContext } from "../../App"

/**
 * Panel de control principal del alumno.
 * Muestra un resumen de todas sus clases, permite unirse a nuevas clases
 * y gestiona las notificaciones y estados de las clases.
 * 
 * @component
 * @returns {JSX.Element} Dashboard principal del alumno con listado de clases y acciones principales
 */
const DashboardAlumno = () => {
    const { userData, setUserData } = useContext(GlobalContext);
    const { clases, invitaciones, loading } = userData;

    const [mostrarModal, setMostrarModal] = useState(false)
    const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false)
    const [claseParaUnirse, setClaseParaUnirse] = useState(null)
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [notificaciones, setNotificaciones] = useState([]); // Añadir este estado
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [notifLoading, setNotifLoading] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const notifBtnRef = useRef(null);
    const notifMenuRef = useRef(null);
    const navigate = useNavigate();
    const [localLoading, setLocalLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // Nuevo estado para la animación de búsqueda
    const [isJoining, setIsJoining] = useState(false); // Añadir nuevo estado para controlar la animación de unirse

    // Animación de ticks progresivos (declarar SIEMPRE aquí, no dentro de un if)
    const steps = [
        { label: "Cargando tus clases...", icon: <BookOpen className="h-6 w-6 text-green-400" /> },
        { label: "Cargando tu perfil...", icon: <GraduationCap className="h-6 w-6 text-green-400" /> },
        { label: "Cargando notificaciones...", icon: <Users className="h-6 w-6 text-green-400" /> }
    ];
    const [step, setStep] = useState(0);
    const [dotCount, setDotCount] = useState(0);
    const intervalRef = useRef();
    const dotIntervalRef = useRef();

    useEffect(() => {
        if (loading) {
            setStep(0);
            intervalRef.current = setInterval(() => {
                setStep(prev => (prev < steps.length ? prev + 1 : prev));
            }, 600);
            dotIntervalRef.current = setInterval(() => {
                setDotCount(prev => (prev + 1) % 3);
            }, 400);
        }
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(dotIntervalRef.current);
        };
    }, [loading]);

    const handleBuscarClase = async (e) => {
        e.preventDefault()
        setError("")
        try {
            setIsSearching(true)
            const data = await buscarClasePorCodigo(codigo)
            setClaseParaUnirse(data)
            setShowJoinConfirmModal(true)
        } catch (error) {
            setError("Clase no encontrada")
            toast.error('No se encontró ninguna clase con ese código', {
                position: 'top-right'
            });
            console.error('Error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleConfirmJoin = async () => {
        if (!claseParaUnirse) {
            toast.error('No hay clase seleccionada');
            return;
        }

        try {
            setIsJoining(true);
            console.log('Intentando unirse a la clase:', claseParaUnirse.codigoClase);

            const response = await unirseAClase(claseParaUnirse.codigoClase);
            console.log('Respuesta de unirse:', response);

            setMostrarModal(false);
            setShowJoinConfirmModal(false);
            setCodigo("");
            setClaseParaUnirse(null);

            // Actualizar las clases después de unirse
            const nuevasClases = await getClasesAlumno();
            setUserData(prev => ({
                ...prev,
                clases: nuevasClases
            }));

            toast.success('Te has unido a la clase exitosamente');

            // Navegar a la clase después de actualizar los datos
            if (response && response.claseId) {
                navigate(`/alumno/clase/${response.claseId}`);
            }
        } catch (error) {
            console.error('Error al unirse:', error);
            toast.error(error.message || 'Error al unirse a la clase');
        } finally {
            setIsJoining(false);
        }
    }

    const handleMenuClick = (claseId) => {
        setMenuAbierto(claseId === menuAbierto ? null : claseId)
    }

    const handleSalirClase = async (claseId) => {
        try {
            await salirDeClase(claseId);

            // Actualizar el estado global eliminando la clase
            setUserData(prev => ({
                ...prev,
                clases: prev.clases.filter(clase => clase.id !== claseId)
            }));

            setMenuAbierto(null);
            setShowConfirmModal(false);
            setNotification({
                show: true,
                message: 'Has salido de la clase exitosamente',
                type: 'success'
            });

            // Ocultar la notificación después de 3 segundos
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error al salir de la clase:', error);
            setNotification({
                show: true,
                message: error.message || 'Error al salir de la clase',
                type: 'error'
            });
            setShowConfirmModal(false);
        }
    }

    const handleRespuesta = async (id, respuesta) => {
        try {
            setNotifLoading(true);
            await responderInvitacion(id, respuesta);
            toast.success(`Invitación ${respuesta === 'aceptar' ? 'aceptada' : 'rechazada'}`);
            fetchNotificaciones();
        } catch (e) {
            toast.error('Error al responder la invitación');
        } finally {
            setNotifLoading(false);
        }
    };

    // Añadir useEffect para cargar los datos
    useEffect(() => {
        const loadClases = async () => {
            try {
                setLocalLoading(true);
                const response = await getClasesAlumno();
                setUserData(prev => ({
                    ...prev,
                    clases: response,
                    loading: false
                }));
            } catch (error) {
                console.error('Error al cargar clases:', error);
                setUserData(prev => ({
                    ...prev,
                    clases: [],
                    loading: false
                }));
            } finally {
                setLocalLoading(false);
            }
        };

        // Solo cargar si userData.loading es true o si clases es null
        if (userData.loading || !userData.clases) {
            loadClases();
        } else {
            setLocalLoading(false);
        }
    }, [setUserData]); // Eliminar userData.clases de las dependencias

    // Añadir useEffect para manejar notificaciones de tarea calificada
    useEffect(() => {
        // Suponiendo que tienes una función para obtener notificaciones
        // y que cada notificación tiene datos: { tipo, datos: { tareaId } }
        if (notification.show && notification.type === 'tarea_calificada' && notification.tareaId) {
            // Redirigir o abrir modal de tarea
            navigate(`/alumno/tareas?tareaId=${notification.tareaId}`);
            setNotification({ show: false, message: '', type: '' });
        }
    }, [notification, navigate]);

    // Cerrar menú de notificaciones al hacer click fuera
    useEffect(() => {
        if (!showNotifMenu) return;
        const handleClickOutside = (event) => {
            if (
                notifMenuRef.current &&
                !notifMenuRef.current.contains(event.target) &&
                notifBtnRef.current &&
                !notifBtnRef.current.contains(event.target)
            ) {
                setShowNotifMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifMenu]);

    // Panel de carga inicial más bonito
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div
                    className={`
                        bg-white rounded-2xl shadow-2xl flex flex-col items-center border border-green-100 animate-fade-in-up
                        sm:px-12 sm:py-10
                        px-4 py-5
                    `}
                    style={{
                        maxWidth: window.innerWidth < 640 ? 300 : 420,
                        minWidth: window.innerWidth < 640 ? 0 : 300,
                        width: window.innerWidth < 640 ? '96vw' : 'auto'
                    }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <BookOpen className={`h-12 w-12 text-green-500 ${window.innerWidth < 640 ? "h-8 w-8" : ""}`} />
                        <span className={`text-2xl font-bold text-green-900 ${window.innerWidth < 640 ? "text-lg" : ""}`}>AulaSync</span>
                    </div>
                    <div className={`flex flex-col gap-3 min-w-[220px] ${window.innerWidth < 640 ? "min-w-0 items-center text-center w-full" : ""}`}>
                        {steps.map((s, idx) => (
                            <div className={`flex items-center gap-3 ${window.innerWidth < 640 ? "justify-center w-full" : ""}`} key={s.label}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <svg className="text-green-500 animate-pop" width={window.innerWidth < 640 ? 14 : 18} height={window.innerWidth < 640 ? 14 : 18} fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" fill="#bbf7d0"/>
                                            <path d="M7 13l3 3 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                )}
                                <span className={`text-green-800 ${step > idx ? "line-through text-green-700" : ""} ${window.innerWidth < 640 ? "text-sm" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className={`mt-8 text-green-700 text-sm flex items-center gap-2 ${window.innerWidth < 640 ? "mt-4 text-xs justify-center w-full text-center" : ""}`}>
                        ¡Bienvenido a AulaSync! Preparando tu espacio
                        <span className={`inline-block w-6 text-green-700 font-bold ${window.innerWidth < 640 ? "w-4" : ""}`} style={{ letterSpacing: 1 }}>
                            {".".repeat(dotCount + 1)}
                        </span>
                    </div>
                    <style>{`
                        @keyframes fade-in-up {
                            0% { opacity: 0; transform: translateY(20px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 0.7s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        @keyframes pop {
                            0% { transform: scale(0.7); opacity: 0.5;}
                            60% { transform: scale(1.2);}
                            100% { transform: scale(1); opacity: 1;}
                        }
                        .animate-pop { animation: pop 0.4s; }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 h-full">
            <Toaster position="top-right" /> {/* Añadir esta línea */}
            <style>{`
                @keyframes fadeSlideIn {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeSlideIn 0.6s ease-out forwards;
                }
            `}</style>

            {/* Header moderno */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                    {/* Avatar con icono de carga propio */}
                    <div className="relative">
                        {userData?.user?.fotoPerfilUrl === undefined ? (
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 border-4 border-green-100 shadow-lg">
                                <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
                            </div>
                        ) : (
                            <img
                                src={userData?.user?.fotoPerfilUrl ? userData.user.fotoPerfilUrl : "/uploads/perfiles/default.png"}
                                alt="Foto de perfil"
                                className={`border-4 border-green-100 shadow-lg object-cover
                                    ${window.innerWidth < 640
                                        ? "h-14 w-14 rounded-full"
                                        : "h-16 w-16 rounded-full"
                                    }`}
                                onError={e => { e.target.src = '/uploads/perfiles/default.png'; }}
                                style={{
                                    aspectRatio: "1/1",
                                    objectFit: "cover"
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-green-900">Dashboard del Alumno</h1>
                        <p className="text-gray-600 text-lg">
                            Bienvenido de nuevo, aquí está el resumen de tu actividad
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setMostrarModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl 
                        hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-500/20"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Unirse a clase</span>
                </button>
            </div>

            {/* Panel de clases con icono de carga individual */}
            <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 flex flex-col overflow-visible">
                    <div className="px-8 py-6 border-b border-green-50 bg-gradient-to-r from-green-100/80 to-emerald-100/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-7 w-7 text-green-500" />
                            <h2 className="text-xl font-bold text-green-900">Mis Clases</h2>
                        </div>
                        <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">
                            Vista rápida de tus clases activas
                        </span>
                    </div>
                    {/* Cambiado: quitar altura fija y overflow, dejar que crezca naturalmente */}
                    <div className="flex-1 p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
                                <span className="text-green-700 font-medium">Cargando clases...</span>
                            </div>
                        ) : clases && clases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clases.map((clase, index) => (
                                    <Link
                                        key={clase.id}
                                        to={`/alumno/clase/${clase.id}`}
                                        className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 
                                            p-6 hover:border-green-300 transition-all duration-300 hover:shadow-xl animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Fondo decorativo */}
                                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-green-500/5 
                                            to-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl
                                                    group-hover:scale-110 transition-transform duration-300">
                                                    <BookOpen className="h-6 w-6 text-green-600" />
                                                </div>
                                                <h3 className="font-semibold text-xl text-gray-900 group-hover:text-green-700 transition-colors">
                                                    {clase.nombre}
                                                </h3>
                                            </div>
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <span className="text-sm font-medium">
                                                        Código: {clase.codigoClase}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-sm">{clase.numEstudiantes} estudiantes</span>
                                                </div>
                                            </div>
                                            <div className="border-t pt-4 flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    <p className="font-medium text-gray-900">
                                                        {typeof clase.profesor === 'string'
                                                            ? clase.profesor
                                                            : clase.profesor?.nombre || "Profesor"}
                                                    </p>
                                                </div>
                                                <span className="text-green-600 flex items-center gap-1 font-medium group-hover:underline group-hover:text-green-800 transition-colors">
                                                    Ver detalles
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-lg text-gray-600 mb-2">No estás inscrito en ninguna clase</p>
                                <p className="text-sm text-gray-500 mb-4">Usa el botón "Unirse a clase" para empezar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para unirse a clase */}
            {mostrarModal && (
                <div
                    className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ margin: 0, padding: 0 }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden animate-fadeInUpModal">
                        {/* Header moderno */}
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-green-100 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-t-2xl">
                            <BookOpen className="h-7 w-7 text-green-500 animate-fadeIn" />
                            <span className="text-xl font-bold text-green-900 animate-fadeIn" style={{ animationDelay: '80ms' }}>
                                Unirse a una clase
                            </span>
                            <button
                                onClick={() => setMostrarModal(false)}
                                className="ml-auto text-gray-400 hover:text-green-600 rounded-full p-2 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleBuscarClase} className="space-y-6 px-8 py-8 bg-white rounded-b-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código de la clase
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 text-base placeholder:text-gray-400 transition-shadow"
                                        placeholder="Introduce el código"
                                        required
                                        autoFocus
                                        disabled={isSearching}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
                                    disabled={isSearching}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="min-w-[120px] px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center justify-center gap-2"
                                    disabled={isSearching}
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                                            <span>Buscando</span>
                                        </>
                                    ) : (
                                        'Buscar clase'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <style>{`
                        @keyframes fadeInUpModal {
                            0% { opacity: 0; transform: translateY(40px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fadeInUpModal {
                            animation: fadeInUpModal 0.5s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.4s both;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(16px);}
                            to { opacity: 1; transform: none;}
                        }
                    `}</style>
                </div>
            )}

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-amber-500">
                            <AlertTriangle className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Confirmar salida?
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            ¿Estás seguro de que quieres salir de la clase "{claseSeleccionada?.nombre}"?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSalirClase(claseSeleccionada?.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para unirse */}
            {showJoinConfirmModal && claseParaUnirse && (
                <div className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-confirmModal">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Animación del icono */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-full shadow-lg animate-bounce">
                                    <BookOpen className="h-10 w-10 text-green-600" />
                                </div>
                            </div>

                            {/* Título con animación de entrada */}
                            <div className="text-center space-y-2 animate-fadeInUp">
                                <h3 className="text-2xl font-bold text-gray-900">¡Clase encontrada!</h3>
                                <p className="text-lg font-medium text-green-700">{claseParaUnirse.nombre}</p>
                            </div>

                            {/* Detalles con animación de entrada retrasada */}
                            <div className="w-full space-y-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <Users className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Profesor:</span>
                                    <span>{claseParaUnirse.profesor}</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                        Código: {claseParaUnirse.codigoClase}
                                    </span>
                                </div>
                            </div>

                            {/* Botones con animación de entrada */}
                            <div className="flex gap-3 w-full mt-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                                <button
                                    onClick={() => {
                                        setShowJoinConfirmModal(false);
                                        setClaseParaUnirse(null);
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                                    disabled={isJoining}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmJoin}
                                    className="flex-1 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                    disabled={isJoining}
                                >
                                    {isJoining ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                                            <span>Uniendo</span>
                                        </>
                                    ) : (
                                        'Unirse a la clase'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default DashboardAlumno
