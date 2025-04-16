import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { obtenerInvitacionesPendientes, responderInvitacion } from '../services/invitaciones';
import toast from 'react-hot-toast';

const NotificationButton = () => {
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const notifBtnRef = useRef(null);
    const notifMenuRef = useRef(null);

    const fetchNotificaciones = async () => {
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
        fetchNotificaciones();
        // Actualizar notificaciones cada 30 segundos
        const interval = setInterval(fetchNotificaciones, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const handleRespuesta = async (id, respuesta) => {
        try {
            await responderInvitacion(id, respuesta);
            toast.success(`Invitación ${respuesta === 'aceptar' ? 'aceptada' : 'rechazada'}`);
            fetchNotificaciones();
        } catch (e) {
            toast.error('Error al responder la invitación');
        }
    };

    return (
        <div className="fixed top-4 right-8 z-50">
            <button
                ref={notifBtnRef}
                className="relative p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                onClick={() => setShowNotifMenu((v) => !v)}
                aria-label="Ver notificaciones"
            >
                <Bell className="h-6 w-6 text-gray-700" />
                {notificaciones.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 text-xs font-bold">
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
                        {loading && <div>Cargando notificaciones...</div>}
                        {!loading && notificaciones.length === 0 && (
                            <div className="text-gray-500">No tienes invitaciones pendientes.</div>
                        )}
                        {!loading && notificaciones.map((inv) => (
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
                                        onClick={() => handleRespuesta(inv.id, 'aceptar')}
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton;
