import { useState, useEffect, useRef, useContext } from "react";
import { Bell, Check, X, FileText, ChevronRight, Trash2 } from "lucide-react";
import { obtenerInvitacionesPendientes, responderInvitacion } from '../services/invitaciones';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from "../App";
import { API_BASE_URL } from '../config/config';

/**
 * Componente de botón de notificaciones que muestra y gestiona las notificaciones del usuario.
 * Permite ver y responder a invitaciones de clase, notificaciones de tareas y calificaciones.
 * Integra un menú desplegable con diferentes tipos de notificaciones y sus acciones correspondientes.
 * 
 * @returns {JSX.Element} Botón con menú desplegable de notificaciones
 */
const NotificationButton = () => {
    const navigate = useNavigate();
    const { userData, setUserData } = useContext(GlobalContext); // Añadir setUserData
    const notificaciones = userData.invitaciones || [];
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifBtnRef = useRef(null);
    const notifMenuRef = useRef(null);

    const role = localStorage.getItem('role');

    const fetchNotificaciones = async () => {
        if (role !== 'alumno') {
            console.log('[NotificationButton] No es alumno, no se cargan notificaciones');
            setNotificaciones([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            console.log('[NotificationButton] Obteniendo notificaciones...');
            const data = await obtenerInvitacionesPendientes();
            console.log('[NotificationButton] Notificaciones recibidas:', data);
            setNotificaciones(data);
        } catch (e) {
            console.error('[NotificationButton] Error al obtener notificaciones:', e);
            setNotificaciones([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        console.log('[NotificationButton] Estado actual:', { role, notificaciones, showNotifMenu });
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

    const handleRespuesta = async (id, respuesta, claseId) => {
        if (role !== 'alumno') return;
        try {
            setNotifLoading(true); // Activar overlay de carga
            await responderInvitacion(id, respuesta);
            toast.success(`Invitación ${respuesta === 'aceptar' ? 'aceptada' : 'rechazada'}`);
            if (respuesta === 'aceptar') {
                setShowNotifMenu(false); // Cerrar el menú
                window.location.href = `/alumno/clase/${claseId}`;
            } else {
                fetchNotificaciones();
            }
        } catch (e) {
            toast.error('Error al responder la invitación');
        } finally {
            setNotifLoading(false); // Desactivar overlay de carga
        }
    };

    // NUEVO: Manejar notificaciones de tarea calificada
    const handleVerCalificacion = async (notif) => {
        try {
            setShowNotifMenu(false);
            // Marcar como leída
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/notificaciones/${notif.id}/leer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Actualizar estado global
            setUserData(prev => ({
                ...prev,
                invitaciones: prev.invitaciones.filter(n => n.id !== notif.id)
            }));

            // Navegar a la vista de tareas con el ID de la tarea seleccionada
            if (notif.datos?.tareaId) {
                navigate(`/alumno/tareas?tareaId=${notif.datos.tareaId}`);
            }
        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    };

    const handleVerTarea = async (notif) => {
        try {
            setShowNotifMenu(false);
            // Eliminar notificación
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/notificaciones/${notif.id}/leer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Actualizar el estado global eliminando la notificación
            setUserData(prev => ({
                ...prev,
                invitaciones: prev.invitaciones.filter(n => n.id !== notif.id)
            }));

            // Navegar a la clase y abrir el modal de la tarea si hay tareaId
            if (notif.datos?.claseId && notif.datos?.tareaId) {
                navigate(`/alumno/clase/${notif.datos.claseId}?tareaId=${notif.datos.tareaId}`);
            } else if (notif.datos?.claseId) {
                navigate(`/alumno/clase/${notif.datos.claseId}`);
            }
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
        }
    };

    // NUEVO: Borrar todas las notificaciones del alumno
    const handleBorrarTodas = async () => {
        if (role !== 'alumno' || notificacionesVisibles.length === 0) return;
        setNotifLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/notificaciones/borrar-todas`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserData(prev => ({
                ...prev,
                invitaciones: []
            }));
            toast.success('Todas las notificaciones han sido borradas');
            setShowNotifMenu(false);
        } catch (e) {
            toast.error('Error al borrar las notificaciones');
        } finally {
            setNotifLoading(false);
        }
    };

    // Filtrar notificaciones realmente visibles
    const notificacionesVisibles = notificaciones.filter(n =>
        (n.tipo === 'invitacion') ||
        (n.tipo === 'nueva_tarea') ||
        (n.tipo === 'tarea_calificada' && n.mensaje)
    );

    return (
        <div className="relative">
            {/* Overlay de carga */}
            {notifLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <span className="text-lg text-gray-700">
                            {role === 'alumno' && notificacionesVisibles.length === 0
                                ? "Eliminando todas las notificaciones..."
                                : "Procesando invitación..."}
                        </span>
                    </div>
                </div>
            )}
            <button
                ref={notifBtnRef}
                className="relative p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                onClick={() => setShowNotifMenu((v) => !v)}
                aria-label="Ver notificaciones"
                type="button"
            >
                <Bell className="h-6 w-6 text-gray-700" />
                {role === 'alumno' && notificacionesVisibles.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 text-xs font-bold z-10">
                        {notificacionesVisibles.length}
                    </span>
                )}
            </button>
            {showNotifMenu && (
                <div
                    ref={notifMenuRef}
                    className="absolute mt-2 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50"
                >
                    <div className="font-semibold mb-2 flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-gray-700" />
                            Notificaciones
                        </span>
                        {/* Botón borrar todas */}
                        {role === 'alumno' && notificacionesVisibles.length > 0 && (
                            <button
                                onClick={handleBorrarTodas}
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg
                                    bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700
                                    shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Borrar todas las notificaciones"
                                disabled={notifLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                                Borrar todas
                            </button>
                        )}
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {role !== 'alumno' ? (
                            <div className="text-gray-500 text-center py-6">
                                No hay notificaciones.
                            </div>
                        ) : (
                            <>
                                {loading && <div>Cargando notificaciones...</div>}
                                {!loading && notificacionesVisibles.length === 0 && (
                                    <div className="text-gray-500">No tienes invitaciones pendientes.</div>
                                )}
                                {/* Invitaciones */}
                                {!loading && notificacionesVisibles.filter(n => n.tipo === 'invitacion').map((inv) => (
                                    <div key={inv.id} className="bg-gray-50 rounded p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">
                                                Invitación a <span className="text-blue-600">
                                                    {inv.clase?.nombre || 'Clase no disponible'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Profesor: {inv.clase?.profesor || 'No disponible'}<br />
                                                Fecha: {inv.fecha || 'No disponible'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 ml-2">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 flex items-center"
                                                onClick={() => handleRespuesta(inv.id, 'aceptar', inv.clase?.id)}
                                                title="Aceptar"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 flex items-center"
                                                onClick={() => handleRespuesta(inv.id, 'rechazar')}
                                                title="Rechazar"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Notificaciones de tarea */}
                                {!loading && notificacionesVisibles.filter(n => n.tipo === 'nueva_tarea').map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-xl p-4 shadow group transition-all duration-300 hover:shadow-lg"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        {/* Fondo decorativo animado */}
                                        <div className="pointer-events-none absolute -top-8 -left-8 w-24 h-24 bg-blue-100 opacity-40 rounded-full blur-2xl group-hover:scale-110 transition-all duration-500" />
                                        <div className="pointer-events-none absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-100 opacity-30 rounded-full blur-2xl group-hover:scale-110 transition-all duration-500" />
                                        <div className="flex items-center gap-3 mb-2 z-10 relative">
                                            <div className="bg-blue-200 p-2 rounded-lg flex items-center justify-center shadow">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-blue-900 text-base flex items-center gap-2">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 mr-1">
                                                        Nueva tarea
                                                    </span>
                                                    {notif.datos?.tareaTitulo
                                                        ? <span className="font-bold">{notif.datos.tareaTitulo}</span>
                                                        : notif.mensaje
                                                    }
                                                </div>
                                                <div className="text-xs text-blue-500 font-medium">
                                                    Profesor: {notif.datos?.profesor}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2 z-10 relative">
                                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : ''}
                                        </div>
                                        <div className="z-10 relative text-sm text-blue-900 mb-2">
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                                                ¡Ya puedes consultar y entregar esta tarea!
                                            </span>
                                        </div>
                                        <div className="flex justify-end mt-2 z-10 relative">
                                            <button
                                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition text-sm"
                                                onClick={async () => {
                                                    setShowNotifMenu(false);
                                                    // Eliminar notificación antes de navegar
                                                    const token = localStorage.getItem('token');
                                                    try {
                                                        await fetch(`${API_BASE_URL}/api/notificaciones/${notif.id}/leer`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        setUserData(prev => ({
                                                            ...prev,
                                                            invitaciones: prev.invitaciones.filter(n => n.id !== notif.id)
                                                        }));
                                                    } catch (e) {
                                                        // Si falla, navega igual
                                                    }
                                                    // Navegar a la clase y abrir el modal de la tarea si hay tareaId
                                                    if (notif.datos?.claseId && notif.datos?.tareaId) {
                                                        navigate(`/alumno/clase/${notif.datos.claseId}?tareaId=${notif.datos.tareaId}`);
                                                    } else if (notif.datos?.claseId) {
                                                        navigate(`/alumno/clase/${notif.datos.claseId}`);
                                                    }
                                                }}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                                Ir a clase
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Notificaciones de tarea calificada */}
                                {!loading && notificacionesVisibles
                                    .filter(n => n.tipo === 'tarea_calificada' && n.mensaje)
                                    .map((notif) => (
                                    <div key={notif.id} className="bg-blue-50 rounded p-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="font-bold text-lg text-blue-600 border-b border-blue-100 pb-2 mb-3">
                                                Tu tarea: {notif.datos?.tareaTitulo} ha sido corregida!
                                            </div>
                                            <div className="whitespace-pre-line text-blue-800">
                                                {notif.mensaje}
                                            </div>
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={async () => {
                                                        setShowNotifMenu(false);
                                                        // Marcar como leída y eliminar la notificación
                                                        const token = localStorage.getItem('token');
                                                        await fetch(`${API_BASE_URL}/api/notificaciones/${notif.id}/leer`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        setUserData(prev => ({
                                                            ...prev,
                                                            invitaciones: prev.invitaciones.filter(n => n.id !== notif.id)
                                                        }));
                                                        // Navegar a la clase donde se calificó la tarea
                                                        if (notif.datos?.claseId) {
                                                            navigate(`/alumno/clase/${notif.datos.claseId}`);
                                                        }
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-xs"
                                                >
                                                    {notif.datos?.mensaje_accion || 'Ve a ver tu nota!'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton;
