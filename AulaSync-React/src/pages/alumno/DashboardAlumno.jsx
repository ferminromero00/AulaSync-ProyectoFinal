import { useState, useEffect, useRef } from "react"
import { BookOpen, Calendar, FileText, CheckCircle, Plus, X, MoreVertical, LogOut, AlertTriangle, Bell, Check, Users, ChevronRight } from "lucide-react"
import { buscarClasePorCodigo, unirseAClase, getClasesAlumno, salirDeClase } from "../../services/clases"
import { obtenerInvitacionesPendientes, responderInvitacion } from '../../services/invitaciones';
import { getTareasStats, getTareasByAlumno } from "../../services/stats"; // Añadir getTareasByAlumno
import { Link, useNavigate } from "react-router-dom"
import toast from 'react-hot-toast';
import NotificationButton from '../../components/NotificationButton';
import TareasResumen from '../../components/TareasResumen';
import TareasResumenAlumno from '../../components/alumno/TareasResumenAlumno';

const DashboardAlumno = () => {
    const [mostrarModal, setMostrarModal] = useState(false)
    const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false)
    const [claseParaUnirse, setClaseParaUnirse] = useState(null)
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [clases, setClases] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]); // Añadir este estado
    const [isLoading, setIsLoading] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [tareasCount, setTareasCount] = useState(0);
    const notifBtnRef = useRef(null);
    const notifMenuRef = useRef(null);
    const [notifLoading, setNotifLoading] = useState(false);
    const [tareas, setTareas] = useState([]);
    const navigate = useNavigate();

    const stats = [
        {
            icon: BookOpen,
            label: "Clases Inscritas",
            value: clases.length,
            color: "bg-gradient-to-br from-blue-500 to-blue-600"
        },
        {
            icon: FileText,
            label: "Tareas Pendientes",
            value: tareasCount,
            color: "bg-gradient-to-br from-amber-500 to-amber-600"
        }
    ]

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

            // Actualizar el estado local eliminando la clase
            setClases(prevClases => prevClases.filter(clase => clase.id !== claseId));

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

    const fetchNotificaciones = async () => {
        setLoading(true);
        try {
            const data = await obtenerInvitacionesPendientes();
            console.log("Invitaciones pendientes:", data); // <-- Añade esto para depurar
            setNotificaciones(data);
        } catch (e) {
            setNotificaciones([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const cargarClases = async () => {
            try {
                const data = await getClasesAlumno();
                setClases(data);
                // Obtener el número de tareas del alumno
                const tareas = await getTareasStats();
                setTareasCount(tareas.totalTareas || 0);
            } catch (error) {
                console.error('Error al cargar clases del alumno:', error);
            } finally {
                setIsLoading(false);
            }
        };
        cargarClases();
        fetchNotificaciones();
    }, []);

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

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                // Aquí deberías llamar a tu servicio para obtener las tareas
                const tareasData = await getTareasByAlumno();
                setTareas(tareasData);
            } catch (error) {
                console.error('Error al cargar tareas:', error);
            }
        };

        cargarTareas();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Overlay de carga para notificaciones */}
            {notifLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <span className="text-lg text-gray-700">Procesando invitación...</span>
                    </div>
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> {/* Mejorado el espaciado */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800"> {/* Ajustado el tamaño y color */}
                        Dashboard del Alumno
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Bienvenido de nuevo, aquí está el resumen de tu actividad
                    </p>
                </div>
                <button
                    onClick={() => setMostrarModal(true)}
                    className={
                        "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    }
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Unirse a clase
                </button>
            </div>

            {/* Stats - Dos tarjetas horizontales, sin grid */}
            <div className="flex w-full gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="relative flex-1 overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`rounded-lg ${stat.color} p-2.5`}>
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full">
                {/* Listado de clases - Ahora ocupa todo el ancho */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold">Mis Clases</h2>
                        <p className="text-sm text-gray-500">Vista rápida de tus clases activas</p>
                    </div>
                    <div className="p-4">
                        <div className="grid gap-3">
                            {clases.length > 0 ? clases.map(clase => (
                                <Link
                                    key={clase.id}
                                    to={`/alumno/clase/${clase.id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{clase.nombre}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {clase.numEstudiantes} estudiantes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                Código: {clase.codigoClase}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )) : (
                                <div className="text-center py-6">
                                    <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                                    <p className="text-gray-500">No estás inscrito en ninguna clase</p>
                                    <p className="text-sm text-gray-400">Usa el botón "Unirse a clase" para empezar</p>
                                </div>
                            )}
                        </div>
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
