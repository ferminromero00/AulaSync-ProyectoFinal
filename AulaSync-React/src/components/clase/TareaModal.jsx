import { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, Paperclip, X, CheckCircle, Clock, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';
import '../../styles/modalAnimations.css';
import { toast } from 'react-hot-toast'; // Añadir este import

const TareaModal = ({
    showModal,
    tarea,
    role,
    claseData,
    onClose,
    comentarioEntrega,
    setComentarioEntrega,
    archivoEntrega,
    setArchivoEntrega,
    isEntregando,
    loadingEntregas,
    onOpenEntrega,
    entregaAlumno,
    onTareaEntregada
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [localIsEntregando, setLocalIsEntregando] = useState(false);
    const [entregada, setEntregada] = useState(!!(tarea && tarea.entregada));
    const [tareaEntregadaData, setTareaEntregadaData] = useState(tarea && tarea.entregada ? tarea : null);

    useEffect(() => {
        console.log('[TareaModal] Iniciando useEffect');
        console.log('[TareaModal] tarea prop:', tarea);
        console.log('[TareaModal] entregaAlumno prop:', entregaAlumno);

        // Obtener el ID del usuario actual - asegurarse de que sea string y nunca null
        let userId = localStorage.getItem('userId');
        if (!userId && tarea?.entregas?.length === 1) {
            // fallback: si solo hay una entrega y no hay userId, asumimos que es del usuario
            userId = String(tarea.entregas[0].alumno?.id || tarea.entregas[0].alumnoId);
            console.log('[TareaModal] Fallback userId:', userId);
        }
        console.log('[TareaModal] userId:', userId);

        // Buscar la entrega del usuario actual en el array de entregas
        let entregaActual = null;
        if (tarea?.entregas && Array.isArray(tarea.entregas)) {
            entregaActual = tarea.entregas.find(e => {
                const alumnoId = String(e.alumno?.id || e.alumnoId);
                console.log('[TareaModal] Comparando alumnoId:', alumnoId, 'con userId:', userId);
                return alumnoId === userId;
            });
        }
        console.log('[TareaModal] entrega encontrada:', entregaActual);

        // Determinar si está entregada basándonos en la entrega encontrada o en el estado de la tarea
        const tareaEntregada = !!(entregaActual || entregaAlumno || tarea?.entregada);
        console.log('[TareaModal] tareaEntregada:', tareaEntregada);
        
        setEntregada(tareaEntregada);

        if (tareaEntregada) {
            const data = {
                ...tarea,
                entregada: true,
                archivoEntregaUrl: entregaAlumno?.archivoEntregaUrl || entregaActual?.archivoUrl || tarea?.archivoEntregaUrl,
                comentarioEntrega: entregaAlumno?.comentarioEntrega || entregaActual?.comentario || tarea?.comentarioEntrega,
                // Tomar nota y comentario de la entrega encontrada
                nota: entregaActual?.nota ?? entregaAlumno?.nota ?? tarea?.nota ?? '',
                comentarioCorreccion: entregaActual?.comentarioCorreccion ?? entregaAlumno?.comentarioCorreccion ?? tarea?.comentarioCorreccion ?? '',
                fechaEntregada: entregaAlumno?.fechaEntregada || entregaActual?.fechaEntrega || tarea?.fechaEntregada
            };
            console.log('[TareaModal] tareaEntregadaData construida:', data);
            setTareaEntregadaData(data);
        }
    }, [tarea, entregaAlumno]);

    const handleEntregaTarea = async () => {
        if (!tarea) return;
        setLocalIsEntregando(true);
        try {
            const formData = new FormData();
            formData.append('comentario', comentarioEntrega);
            if (archivoEntrega) formData.append('archivo', archivoEntrega);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tareas/${tarea.id}/entregar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Error al entregar la tarea');
            const data = await response.json();

            console.log('[TareaModal] Datos de entrega recibidos:', data);

            // Crear objeto con los datos de la entrega
            const datosEntrega = {
                archivoEntregaUrl: data.archivoEntregaUrl || null,
                comentarioEntrega: comentarioEntrega,
                fechaEntregada: data.fechaEntregada ?? new Date().toISOString()
            };

            // Actualizar estado local
            setEntregada(true);
            setTareaEntregadaData({
                ...tarea,
                entregada: true,
                ...datosEntrega,
                nota: data.nota ?? null,
                comentarioCorreccion: data.comentarioCorreccion ?? null
            });

            // Notificar al componente padre
            if (onTareaEntregada) {
                onTareaEntregada(tarea.id, datosEntrega);
            }

            toast.success('Tarea entregada correctamente');
        } catch (e) {
            console.error('[TareaModal] Error al entregar la tarea:', e);
            toast.error('Error al entregar la tarea');
        } finally {
            setLocalIsEntregando(false);
        }
    };

    if (!showModal || !tarea) return null;

    const tareaToShow = entregada ? tareaEntregadaData : tarea;
    const downloadUrl = tareaToShow.archivoUrl ? `${API_BASE_URL}${tareaToShow.archivoUrl}` : null;
    const archivoEntregaUrl = tareaToShow.archivoEntregaUrl ? `${API_BASE_URL}${tareaToShow.archivoEntregaUrl}` : null;

    // Añadir antes del return para ver los datos finales
    console.log('[TareaModal] Estado final - entregada:', entregada);
    console.log('[TareaModal] Estado final - tareaEntregadaData:', tareaEntregadaData);
    console.log('[TareaModal] Estado final - tareaToShow:', tareaToShow);

    return (
        <div className={`fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50
            ${isClosing ? 'modal-closing' : ''}`} style={{ margin: 0, padding: 0 }}>
            <div className={`bg-white rounded-2xl w-full max-w-6xl mx-4 flex flex-col md:flex-row relative 
                shadow-2xl modal-content max-h-[90vh] overflow-hidden
                ${isClosing ? 'modal-content-closing' : ''}`}>
                {/* Botón de cerrar */}
                <button
                    onClick={() => {
                        setIsClosing(true);
                        setTimeout(() => {
                            setIsClosing(false);
                            onClose();
                        }, 200);
                    }}
                    className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all"
                    style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Panel izquierdo - Detalles de la tarea */}
                <div className="p-0 flex-1 modal-content-left overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
                    <div className="flex flex-col gap-0 h-full flex-1">
                        {/* Cabecera moderna y compacta */}
                        <div className="flex items-center gap-4 px-10 py-8 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80">
                            <div className="bg-blue-200 p-4 rounded-2xl shadow flex items-center justify-center">
                                <BookOpen className="h-7 w-7 text-blue-700" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-blue-900">{tarea.titulo || <span className="italic text-gray-400">Sin título</span>}</h3>
                            </div>
                        </div>
                        {/* Fecha de entrega */}
                        <div className="px-10 py-6 border-b border-blue-50 bg-white">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-amber-700" />
                                <div>
                                    <div className="font-medium text-amber-900">Fecha de entrega</div>
                                    <div className="text-sm text-amber-800">
                                        {tarea.fechaEntrega
                                            ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })
                                            : <span className="italic text-gray-400">Sin fecha límite</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Descripción ocupa todo el espacio restante */}
                        <div className="flex-1 flex flex-col px-10 py-6 border-b border-blue-50 bg-white min-h-0">
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                Descripción de la tarea
                            </h4>
                            <div className="flex-1 min-h-0">
                                <div className="bg-blue-50 rounded-xl p-6 text-gray-700 whitespace-pre-line h-full border border-blue-100 flex items-start min-h-[80px]">
                                    {tarea.contenido
                                        ? tarea.contenido
                                        : <span className="italic text-gray-400">Sin descripción</span>}
                                </div>
                            </div>
                        </div>
                        {/* Material adjunto */}
                        {downloadUrl && (
                            <div className="px-10 py-6 bg-white">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Paperclip className="h-5 w-5 text-blue-400" />
                                    Material de la tarea
                                </h4>
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-100 
                                             text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all
                                             shadow-sm hover:shadow group"
                                >
                                    <FileText className="h-5 w-5 text-blue-400 group-hover:text-blue-600" />
                                    Descargar material
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel derecho - Vista de profesor o alumno */}
                {role === 'profesor' ? (
                    <div className="relative bg-gradient-to-b from-gray-50 to-white p-0 w-full md:w-[420px] border-t md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
                        {/* Animaciones locales solo para este modal */}
                        <style>{`
                            @keyframes tareaFadeIn {
                                0% { opacity: 0; transform: translateY(24px);}
                                100% { opacity: 1; transform: none;}
                            }
                            @keyframes tareaSlideUp {
                                0% { opacity: 0; transform: translateY(32px);}
                                100% { opacity: 1; transform: none;}
                            }
                            .tarea-anim-fadeIn { animation: tareaFadeIn 0.5s both; }
                            .tarea-anim-slideUp { animation: tareaSlideUp 0.5s both; }
                            .tarea-stagger > * { opacity: 0; }
                            .tarea-stagger > *:nth-child(1) { animation-delay: 120ms; }
                            .tarea-stagger > *:nth-child(2) { animation-delay: 220ms; }
                            .tarea-stagger > *:nth-child(3) { animation-delay: 320ms; }
                        `}</style>
                        <div className="p-0 tarea-stagger">
                            {/* Cabecera */}
                            <div className="flex items-center gap-3 px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-tr-2xl tarea-anim-fadeIn">
                                <BookOpen className="h-7 w-7 text-blue-500" />
                                <span className="text-xl font-bold text-blue-900">Entregas de la tarea</span>
                            </div>
                            {/* Estadísticas de entregas */}
                            <div className="flex gap-4 px-8 pt-8 tarea-anim-slideUp">
                                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center">
                                    <span className="text-xs text-gray-500 mb-1">Entregadas</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                        {tarea.entregas?.length || 0}
                                    </span>
                                </div>
                                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center">
                                    <span className="text-xs text-gray-500 mb-1">Pendientes</span>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {claseData?.estudiantes?.length
                                            ? claseData.estudiantes.length - (tarea.entregas?.length || 0)
                                            : 0}
                                    </span>
                                </div>
                            </div>
                            {/* Estado por estudiante */}
                            <div className="mt-8 px-8 tarea-anim-slideUp">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <span className="font-semibold text-blue-900 text-lg">Estado por estudiante</span>
                                </div>
                                {/* Cambia aquí: max-h-64 y overflow-y-auto */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                    {claseData?.estudiantes?.map((estudiante, idx) => {
                                        // Buscar la entrega de este estudiante
                                        const entrega = tarea.entregas?.find(e =>
                                            (e.alumno && (e.alumno.id === estudiante.id || e.alumno === estudiante.id))
                                        );
                                        // Estado de carga
                                        if (loadingEntregas && loadingEntregas[estudiante.id]) {
                                            return (
                                                <div key={estudiante.id} className="p-4 flex items-center justify-between tarea-anim-fadeIn" style={{ animationDelay: `${180 + idx * 40}ms` }}>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                                                    </div>
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                                        <span>Comprobando...</span>
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                key={estudiante.id}
                                                className={`p-4 flex items-center justify-between tarea-anim-fadeIn transition cursor-pointer ${entrega ? "hover:bg-emerald-50" : ""}`}
                                                style={{ animationDelay: `${180 + idx * 40}ms`, cursor: entrega ? "pointer" : "default" }}
                                                onClick={() => entrega && onOpenEntrega(entrega)}
                                                title={entrega ? "Ver entrega" : undefined}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                        {estudiante.nombre?.[0] || "?"}
                                                    </div>
                                                    <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                                                </div>
                                                {entrega ? (
                                                    entrega.nota !== undefined && entrega.nota !== null && entrega.nota !== '' ? (
                                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 flex items-center gap-1">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Calificado: <span className="ml-1 font-bold">{entrega.nota}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 hover:text-emerald-900 transition">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Entregado
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-b from-gray-50 to-white p-8 w-full md:w-[400px] border-t 
                                 md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
                        <div className="modal-item-stagger">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6">Tu entrega</h4>
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    {entregada ? (
                                        // NUEVO: Mostrar "Calificada" si hay nota
                                        (tareaToShow.nota !== undefined && tareaToShow.nota !== null && tareaToShow.nota !== '') ? (
                                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">¡Tarea calificada!</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">¡Tarea entregada!</span>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <Calendar className="h-5 w-5" />
                                            <span className="font-medium">Pendiente de entrega</span>
                                        </div>
                                    )}
                                </div>
                                {entregada ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Paperclip className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-800">Archivo entregado:</span>
                                            </div>
                                            {archivoEntregaUrl ? (
                                                <a
                                                    href={archivoEntregaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    <FileText className="h-5 w-5" />
                                                    Descargar entrega
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">No se adjuntó archivo</span>
                                            )}
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="font-medium text-gray-900 mb-1">Comentario enviado:</div>
                                            <div className="text-gray-700 whitespace-pre-line">
                                                {tareaToShow.comentarioEntrega
                                                    ? tareaToShow.comentarioEntrega
                                                    : <span className="italic text-gray-400">Sin comentario</span>}
                                            </div>
                                        </div>
                                        {/* Nota y comentario del profesor */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-blue-800">Nota:</span>
                                                <span className="ml-2 text-blue-900 font-bold">
                                                    {tareaToShow.nota !== undefined && tareaToShow.nota !== null && tareaToShow.nota !== ''
                                                        ? tareaToShow.nota
                                                        : <span className="italic text-blue-400">Sin calificar</span>
                                                    }
                                                </span>
                                            </div>
                                            <div className="text-blue-700 mt-2">
                                                <span className="font-medium">Comentario del profesor:</span>
                                                <div className="w-full mt-1 px-2 py-1 border border-blue-200 rounded bg-white min-h-[40px]">
                                                    {tareaToShow.comentarioCorreccion
                                                        ? tareaToShow.comentarioCorreccion
                                                        : <span className="italic text-blue-400">Sin comentario</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-700">Fecha de entrega:</span>
                                                <span className="text-gray-700">
                                                    {tareaToShow.fechaEntregada
                                                        ? new Date(tareaToShow.fechaEntregada).toLocaleString()
                                                        : 'Desconocida'}
                                                </span>
                                            </div>
                                            {/* Eliminar el bloque de Título */}
                                            {/* <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-700">Título:</span>
                                                <span className="text-gray-700">{tareaToShow.titulo || tareaToShow.contenido}</span>
                                            </div> */}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Comentarios (opcional)
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows="4"
                                                placeholder="Añade comentarios sobre tu entrega..."
                                                value={comentarioEntrega}
                                                onChange={e => setComentarioEntrega(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Archivo de entrega
                                            </label>
                                            <div className="flex items-center justify-center w-full">
                                                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                                                    <FileText className="h-8 w-8 mb-2" />
                                                    <span className="text-sm text-center">
                                                        {archivoEntrega ? archivoEntrega.name : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={e => setArchivoEntrega(e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                            onClick={handleEntregaTarea}
                                            disabled={isEntregando || localIsEntregando}
                                        >
                                            <FileText className="h-5 w-5" />
                                            {(isEntregando || localIsEntregando) ? "Entregando..." : "Entregar tarea"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TareaModal;  // Asegúrate de que esta línea existe