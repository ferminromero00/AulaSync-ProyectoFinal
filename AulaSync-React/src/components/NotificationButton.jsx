import { useState, useEffect, useRef, useContext } from "react";
import { Bell, Check, X } from "lucide-react";
import { obtenerInvitacionesPendientes, responderInvitacion } from '../services/invitaciones';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from "../App";

const NotificationButton = () => {
    const navigate = useNavigate();
    const { userData } = useContext(GlobalContext);
    const notificaciones = userData.invitaciones || [];
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifBtnRef = useRef(null);
    const notifMenuRef = useRef(null);

    const role = localStorage.getItem('role');

    const fetchNotificaciones = async () => {
        if (role !== 'alumno') {
            setNotificaciones([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await obtenerInvitacionesPendientes();
            setNotificaciones(data);
        } catch (e) {
            setNotificaciones([]);
        }
        setLoading(false);
    };

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
    const handleVerCalificacion = (notificacion) => {
        setShowNotifMenu(false);
        if (notificacion.datos?.tareaId) {
            navigate(`/alumno/tareas?tareaId=${notificacion.datos.tareaId}`);
        }
    };

    return (
        <div className="relative">
            {/* Overlay de carga */}
            {notifLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <span className="text-lg text-gray-700">Procesando invitación...</span>
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
                {role === 'alumno' && notificaciones.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 text-xs font-bold z-10">
                        {notificaciones.length}
                    </span>
                )}
            </button>
            {showNotifMenu && (
                <div
                    ref={notifMenuRef}
                    className="absolute mt-2 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50"
                >
                    <div className="font-semibold mb-2 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-gray-700" />
                        Notificaciones
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {role !== 'alumno' ? (
                            <div className="text-gray-500 text-center py-6">
                                No hay notificaciones.
                            </div>
                        ) : (
                            <>
                                {loading && <div>Cargando notificaciones...</div>}
                                {!loading && notificaciones.length === 0 && (
                                    <div className="text-gray-500">No tienes invitaciones pendientes.</div>
                                )}
                                {/* Invitaciones */}
                                {!loading && notificaciones.filter(n => n.tipo !== 'tarea_calificada').map((inv) => (
                                    <div key={inv.id} className="bg-gray-50 rounded p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">
                                                Invitación a <span className="text-blue-600">{inv.clase.nombre}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Profesor: {inv.clase.profesor}<br />
                                                Fecha: {inv.fecha}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 ml-2">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 flex items-center"
                                                onClick={() => handleRespuesta(inv.id, 'aceptar', inv.clase.id)}
                                                title="Aceptar"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 flex items-center"
                                                onClick={() => handleRespuesta(inv.id, 'rechazar', inv.clase.id)}
                                                title="Rechazar"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Notificaciones de tarea calificada */}
                                {!loading && notificaciones.filter(n => n.tipo === 'tarea_calificada').map((notif) => (
                                    <div key={notif.id} className="bg-blue-50 rounded p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-blue-800">
                                                {notif.mensaje}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                                            </div>
                                        </div>
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 ml-2 text-xs"
                                            onClick={() => handleVerCalificacion(notif)}
                                        >
                                            Ver calificación
                                        </button>
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
