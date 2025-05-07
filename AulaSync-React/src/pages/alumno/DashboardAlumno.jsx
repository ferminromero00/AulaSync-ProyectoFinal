import { useState, useEffect, useRef, useContext } from "react"
import { BookOpen, Plus, X, Users, ChevronRight, AlertTriangle } from "lucide-react"
import { buscarClasePorCodigo, unirseAClase, salirDeClase, getClasesAlumno } from "../../services/clases"
import { responderInvitacion } from '../../services/invitaciones';
import { Link, useNavigate } from "react-router-dom"
import toast from 'react-hot-toast';
import NotificationButton from '../../components/NotificationButton';
import { GlobalContext } from "../../App"

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

    const handleBuscarClase = async (e) => {
        e.preventDefault()
        try {
            const data = await buscarClasePorCodigo(codigo)
            setClaseParaUnirse(data)
            setShowJoinConfirmModal(true)
            setError("")
        } catch (error) {
            setError("Clase no encontrada")
            console.error('Error:', error)
        }
    }

    const handleConfirmJoin = async () => {
        try {
            const response = await unirseAClase(claseParaUnirse.codigoClase)
            navigate(`/alumno/clase/${response.claseId}`);
            setMostrarModal(false)
            setShowJoinConfirmModal(false)
            setCodigo("")
            setClaseParaUnirse(null)
            setNotification({
                show: true,
                message: 'Te has unido a la clase exitosamente',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                show: true,
                message: error.message || 'Error al unirse a la clase',
                type: 'error'
            });
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

    if (loading || localLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <style>{`
                @keyframes fadeSlideIn {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeSlideIn 0.6s ease-out forwards;
                }
            `}</style>

            {/* Header Section con animación */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fadeIn" 
                 style={{ animationDelay: '200ms' }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Dashboard del Alumno
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Bienvenido de nuevo, aquí está el resumen de tu actividad
                    </p>
                </div>
                <button
                    onClick={() => setMostrarModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Unirse a clase
                </button>
            </div>

            {/* Contenedor principal con animación */}
            <div className="w-full h-[calc(100vh-8rem)] opacity-0 animate-fadeIn"
                 style={{ animationDelay: '400ms' }}>
                <div className="bg-white h-full rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold">Mis Clases</h2>
                        <p className="text-sm text-gray-500">Vista rápida de tus clases activas</p>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {clases && clases.length > 0 ? clases.map((clase, index) => (
                                    <Link
                                        key={clase.id}
                                        to={`/alumno/clase/${clase.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group border border-gray-100 hover:border-gray-200 opacity-0 animate-fadeIn"
                                        style={{ animationDelay: `${600 + (index * 100)}ms` }}
                                    >
                                        <div className="bg-blue-100 p-3 rounded-xl">
                                            <BookOpen className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-6">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">{clase.nombre}</h3>
                                                <div className="flex items-center gap-6 mt-1">
                                                    <span className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                        {clase.numEstudiantes} estudiantes
                                                    </span>
                                                    <span className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                                                            Código: {clase.codigoClase}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="text-center py-12 opacity-0 animate-fadeIn"
                                         style={{ animationDelay: '600ms' }}>
                                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg text-gray-600 mb-2">No estás inscrito en ninguna clase</p>
                                        <p className="text-sm text-gray-500">Usa el botón "Unirse a clase" para empezar</p>
                                    </div>
                                )}
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
                    <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Unirse a una clase</h3>
                            <button
                                onClick={() => setMostrarModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleBuscarClase} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código de la clase
                                </label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Introduce el código"
                                    required
                                />
                                {error && (
                                    <p className="mt-1 text-sm text-red-600">{error}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Buscar clase
                                </button>
                            </div>
                        </form>
                    </div>
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
                <div
                    className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ margin: 0, padding: 0 }}
                >
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-green-500">
                            <BookOpen className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Unirse a la clase?
                        </h3>
                        <p className="text-gray-600 text-center mb-2">
                            ¿Quieres unirte a la clase "{claseParaUnirse.nombre}"?
                        </p>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Profesor: {claseParaUnirse.profesor}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowJoinConfirmModal(false)
                                    setClaseParaUnirse(null)
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmJoin}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación tipo toast */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white px-6 py-3 rounded-lg shadow-lg transition-all transform translate-y-0`}>
                    <div className="flex items-center space-x-2">
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification({ show: false, message: '', type: '' })}
                            className="ml-2 hover:text-gray-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardAlumno;
