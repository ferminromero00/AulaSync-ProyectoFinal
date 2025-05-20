import { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, FileText, Paperclip, X, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
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
    const [isEntregandoLocal, setIsEntregandoLocal] = useState(false);
    const [entregada, setEntregada] = useState(!!(tarea && tarea.entregada));
    const [tareaEntregadaData, setTareaEntregadaData] = useState(tarea && tarea.entregada ? tarea : null);
    const [entregaAlumnoReciente, setEntregaAlumnoReciente] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const hasInitializedRef = useRef(false);

    // NUEVO: Limpiar estados de entrega al cambiar de tarea/modal
    useEffect(() => {
        if (!showModal || !tarea) return;
        // Limpiar estados locales de entrega al abrir una nueva tarea
        setEntregada(!!tarea.entregada);
        setTareaEntregadaData(tarea.entregada ? tarea : null);
        setEntregaAlumnoReciente(null);
        hasInitializedRef.current = false;
    }, [tarea?.id, showModal]);

    const isExpired = (tarea) => {
        if (!tarea.fechaEntrega) return false;
        const fechaEntrega = new Date(tarea.fechaEntrega);
        const ahora = new Date();
        return fechaEntrega < ahora;
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} años`;
        
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} meses`;
        
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} días`;
        
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} horas`;
        
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutos`;
        
        return `${Math.floor(seconds)} segundos`;
    };

    useEffect(() => {
        if (!showModal || !tarea) {
            hasInitializedRef.current = false;
            return;
        }

        // Limpiar datos inmediatamente al cambiar de tarea
        setIsProcessing(true);
        setEntregada(false);
        setTareaEntregadaData(null);
        setEntregaAlumnoReciente(null);
        setArchivoEntrega(null);
        setComentarioEntrega('');
        hasInitializedRef.current = false;

        // Pequeño timeout para asegurar que la UI se actualiza
        const timer = setTimeout(() => {
            // Obtener el ID del usuario actual
            const userId = localStorage.getItem('userId');
            
            // Buscar la entrega del usuario actual
            let entregaActual = null;
            if (tarea?.entregas?.length) {
                entregaActual = tarea.entregas.find(e => 
                    String(e.alumno?.id || e.alumnoId) === String(userId)
                );
            }

            // Priorizar entrega más reciente
            const entregaFinal = entregaAlumnoReciente || entregaAlumno || entregaActual;
            const tareaEntregada = !!(entregaFinal || tarea?.entregada);
            
            setEntregada(tareaEntregada);

            if (tareaEntregada) {
                const data = {
                    ...tarea,
                    entregada: true,
                    archivoEntregaUrl: entregaFinal?.archivoUrl || entregaFinal?.archivoEntregaUrl || tarea?.archivoEntregaUrl,
                    comentarioEntrega: entregaFinal?.comentario || entregaFinal?.comentarioEntrega || tarea?.comentarioEntrega,
                    nota: entregaFinal?.nota ?? tarea?.nota ?? '',
                    comentarioCorreccion: entregaFinal?.comentarioCorreccion ?? tarea?.comentarioCorreccion ?? '',
                    fechaEntregada: entregaFinal?.fechaEntrega || entregaFinal?.fechaEntregada || tarea?.fechaEntregada
                };
                setTareaEntregadaData(data);
            }

            hasInitializedRef.current = true;
            setIsProcessing(false);
        }, 100);

        return () => clearTimeout(timer);

    }, [tarea?.id, showModal]);

    const handleEntregaTarea = async (e) => {
        e.preventDefault();
        if (!tarea) return;
        setIsEntregandoLocal(true);
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
            await response.json();

            // Obtener la entrega recién creada para el alumno
            const entregaRes = await fetch(`${API_BASE_URL}/api/tareas/${tarea.id}/entregas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const entregas = await entregaRes.json();
            let userId = localStorage.getItem('userId');
            const entregaAlumnoNueva = Array.isArray(entregas)
                ? entregas.find(e => String(e.alumno?.id || e.alumnoId) === String(userId))
                : null;
            setEntregaAlumnoReciente(entregaAlumnoNueva);

            // Actualizar el modal con los datos de la entrega
            setEntregada(true);
            setTareaEntregadaData({
                ...tarea,
                entregada: true,
                archivoEntregaUrl: entregaAlumnoNueva?.archivoUrl || null,
                comentarioEntrega: entregaAlumnoNueva?.comentario || '',
                fechaEntregada: entregaAlumnoNueva?.fechaEntrega || new Date().toISOString(),
                nota: entregaAlumnoNueva?.nota ?? '',
                comentarioCorreccion: entregaAlumnoNueva?.comentarioCorreccion ?? ''
            });

            // Notificar al padre para actualizar el estado global
            if (onTareaEntregada) {
                onTareaEntregada(tarea.id, {
                    archivoEntregaUrl: entregaAlumnoNueva?.archivoUrl || null,
                    comentarioEntrega: entregaAlumnoNueva?.comentario || '',
                    fechaEntregada: entregaAlumnoNueva?.fechaEntrega || new Date().toISOString(),
                    nota: entregaAlumnoNueva?.nota ?? '',
                    comentarioCorreccion: entregaAlumnoNueva?.comentarioCorreccion ?? ''
                });
            }

            toast.success('Tarea entregada correctamente');
        } catch (e) {
            console.error('[TareaModal] Error al entregar la tarea:', e);
            toast.error('Error al entregar la tarea');
        } finally {
            setIsEntregandoLocal(false);
        }
    };

    if (!showModal || !tarea) return null;

    const tareaToShow = entregada ? tareaEntregadaData : tarea;
    const downloadUrl = tareaToShow.archivoUrl ? `${API_BASE_URL}${tareaToShow.archivoUrl}` : null;
    const archivoEntregaUrl = tareaToShow.archivoEntregaUrl ? `${API_BASE_URL}${tareaToShow.archivoEntregaUrl}` : null;

    return (
        <div className={`fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50
            ${isClosing ? 'modal-closing' : ''}`} style={{ margin: 0, padding: 0, zIndex: 1050 }}>
            {isProcessing ? (
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-fadeIn">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Cargando tarea...</p>
                </div>
            ) : (
                <div className={`bg-white rounded-2xl w-full max-w-4xl mx-4 flex flex-col md:flex-row relative 
                    shadow-2xl modal-content max-h-[90vh] overflow-hidden z-50
                    ${isClosing ? 'modal-content-closing' : ''}`}>
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
                        .tarea-stagger > *:nth-child(4) { animation-delay: 420ms; }
                        .tarea-stagger > *:nth-child(5) { animation-delay: 520ms; }
                    `}</style>
                    {/* Botón de cerrar */}
                    <button
                        onClick={() => {
                            setIsClosing(true);
                            setTimeout(() => {
                                setIsClosing(false);
                                onClose();
                            }, 200);
                        }}
                        className="absolute top-5 right-5 z-50 bg-red-500 hover:bg-red-400 text-white p-2.5 rounded-full shadow-lg transition-all"
                        style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Panel izquierdo - Detalles de la tarea */}
                    <div className="flex-[1.2] flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-0 min-w-[260px] max-w-[55%] tarea-anim-fadeIn relative z-10">
                        <div className="flex flex-col gap-0 h-full flex-1 tarea-stagger">
                            {/* Cabecera */}
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 tarea-anim-fadeIn">
                                <div className="bg-blue-200 p-3 rounded-2xl shadow flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">{tareaToShow.titulo || <span className="italic text-gray-400">Sin título</span>}</h3>
                                </div>
                            </div>
                            {/* Fecha de entrega */}
                            <div className="px-6 py-3 border-b border-blue-50 bg-white flex items-center gap-4 tarea-anim-slideUp">
                                <div className="bg-amber-100 p-2 rounded-xl flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                    <div className="font-semibold text-amber-900 text-base">Fecha de entrega</div>
                                    <div className="text-sm text-amber-800">
                                        {tareaToShow.fechaEntrega
                                            ? new Date(tareaToShow.fechaEntrega).toLocaleString('es-ES', {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })
                                            : <span className="italic text-gray-400">Sin fecha límite</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Descripción */}
                            <div className="flex-1 flex flex-col px-6 py-4 border-b border-blue-50 bg-white min-h-0 tarea-anim-slideUp">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-base">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    Descripción de la tarea
                                </h4>
                                <div className="flex-1 min-h-0">
                                    <div className="bg-blue-50 rounded-xl p-3 text-gray-700 whitespace-pre-line h-full border border-blue-100 flex items-start min-h-[40px] text-sm">
                                        {tareaToShow.contenido
                                            ? tareaToShow.contenido
                                            : <span className="italic text-gray-400">Sin descripción</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Material adjunto */}
                            {downloadUrl && (
                                <div className="px-6 py-3 bg-white tarea-anim-slideUp">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-base">
                                        <Paperclip className="h-5 w-5 text-blue-400" />
                                        Material de la tarea
                                    </h4>
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 
                                             text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all
                                             shadow-sm hover:shadow group font-medium text-sm"
                                    >
                                        <FileText className="h-4 w-4 text-blue-400 group-hover:text-blue-600" />
                                        Descargar material
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel derecho - Vista de profesor */}
                    {role === 'profesor' ? (
                        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white w-full md:w-[420px] border-t 
                            md:border-t-0 md:border-l border-gray-200 flex flex-col overflow-y-auto tarea-anim-fadeIn relative z-20 px-0 py-0">
                            <div className="p-0 tarea-stagger">
                                {/* Cabecera */}
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-tr-2xl tarea-anim-fadeIn">
                                    <BookOpen className="h-6 w-6 text-blue-500" />
                                    <span className="text-lg font-bold text-blue-900">Entregas de la tarea</span>
                                </div>
                                {/* Estadísticas de entregas */}
                                <div className="flex gap-4 px-6 pt-6 tarea-anim-slideUp">
                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center">
                                        <span className="text-xs text-gray-500 mb-1">Entregadas</span>
                                        <span className="text-xl font-bold text-emerald-600">
                                            {tarea.entregas?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center">
                                        <span className="text-xs text-gray-500 mb-1">Pendientes</span>
                                        <span className="text-xl font-bold text-amber-600">
                                            {claseData?.estudiantes?.length
                                                ? claseData.estudiantes.length - (tarea.entregas?.length || 0)
                                                : 0}
                                        </span>
                                    </div>
                                </div>
                                {/* Estado por estudiante */}
                                <div className="mt-6 px-6 tarea-anim-slideUp">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        <span className="font-semibold text-blue-900 text-base">Estado por estudiante</span>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                                        {claseData?.estudiantes?.map((estudiante, idx) => {
                                            const entrega = tarea.entregas?.find(e =>
                                                (e.alumno && (e.alumno.id === estudiante.id || e.alumno === estudiante.id))
                                            );
                                            if (loadingEntregas && loadingEntregas[estudiante.id]) {
                                                return (
                                                    <div key={estudiante.id} 
                                                         className="p-4 flex items-center justify-between tarea-anim-fadeIn" 
                                                         style={{ animationDelay: `${180 + idx * 40}ms` }}>
                                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                                                                {estudiante.nombre?.[0] || "?"}
                                                            </div>
                                                            <p className="font-medium text-gray-900 truncate">{estudiante.nombre}</p>
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
                                                    className={`p-4 flex items-center justify-between tarea-anim-fadeIn transition cursor-pointer
                                                        ${entrega ? "hover:bg-emerald-50" : ""}`}
                                                    style={{ animationDelay: `${180 + idx * 40}ms`, cursor: entrega ? "pointer" : "default" }}
                                                    onClick={() => entrega && onOpenEntrega(entrega)}
                                                    title={entrega ? "Ver entrega" : undefined}
                                                >
                                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                                                            {estudiante.nombre?.[0] || "?"}
                                                        </div>
                                                        <p className="font-medium text-gray-900 truncate">{estudiante.nombre}</p>
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
                        // Panel derecho - Entrega del alumno
                        <div className="flex-[0.85] bg-gradient-to-b from-gray-50 to-white px-10 py-10 w-full md:w-[370px] border-t 
                            md:border-t-0 md:border-l border-gray-200 flex flex-col gap-6 overflow-y-auto max-h-[96vh] min-w-[260px] tarea-anim-fadeIn relative z-20">
                            
                            {entregada ? (
                                // Vista de tarea entregada
                                <div className="flex flex-col gap-6">
                                    <div className="tarea-anim-fadeIn">
                                        <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                            Tu entrega
                                        </h4>
                                        {/* Estado de la entrega */}
                                        <div className={`rounded-xl p-3 flex items-center gap-3 shadow-sm text-sm font-semibold tarea-anim-slideUp
                                            ${entregada
                                                ? (tareaToShow.nota !== undefined && tareaToShow.nota !== null && tareaToShow.nota !== ''
                                                    ? 'bg-blue-50 border border-blue-200 text-blue-800'
                                                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800')
                                                : 'bg-amber-50 border border-amber-200 text-amber-800'
                                            }`
                                        }>
                                            {entregada ? (
                                                tareaToShow.nota !== undefined && tareaToShow.nota !== null && tareaToShow.nota !== '' ? (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                                        ¡Tarea calificada!
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        ¡Tarea entregada!
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <Clock className="h-5 w-5 text-amber-600" />
                                                    Pendiente de entrega
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                                <Paperclip className="h-5 w-5 text-green-600" />
                                                Archivo entregado:
                                            </div>
                                            {archivoEntregaUrl ? (
                                                <a
                                                    href={archivoEntregaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Descargar entrega
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 italic text-xs">No se adjuntó archivo</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-white border border-gray-100 rounded-xl p-3 tarea-anim-slideUp">
                                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                                Comentario enviado:
                                            </div>
                                            <div className="text-gray-700 whitespace-pre-line text-sm">
                                                {tareaToShow.comentarioEntrega ? tareaToShow.comentarioEntrega : <span className="italic text-gray-400">Sin comentario</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                Nota:
                                                <span className="ml-2 text-blue-900 font-bold text-base">
                                                    {tareaToShow.nota !== undefined && tareaToShow.nota !== null && tareaToShow.nota !== ''
                                                        ? tareaToShow.nota
                                                        : <span className="italic text-blue-400 text-base">Sin calificar</span>
                                                    }
                                                </span>
                                            </div>
                                            <div className="text-blue-700 mt-1">
                                                <span className="font-medium text-xs">Comentario del profesor:</span>
                                                <div className="w-full mt-1 px-2 py-1 border border-blue-200 rounded bg-white min-h-[28px] text-xs">
                                                    {tareaToShow.comentarioCorreccion
                                                        ? tareaToShow.comentarioCorreccion
                                                        : <span className="italic text-blue-400">Sin comentario</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 flex flex-col gap-1 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span className="font-semibold text-gray-700 text-xs">Fecha de entrega:</span>
                                                <span className="text-gray-700 text-xs">
                                                    {tareaToShow.fechaEntregada
                                                        ? new Date(tareaToShow.fechaEntregada).toLocaleString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Desconocida'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Vista de formulario de entrega
                                <div className="flex flex-col gap-6">
                                    <div className="tarea-anim-fadeIn">
                                        <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock className="h-6 w-6 text-amber-500" />
                                            Entrega de tarea
                                        </h4>
                                        {/* Estado de la entrega */}
                                        <div className="rounded-xl p-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 shadow-sm text-sm font-semibold">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                            Pendiente de entrega
                                        </div>
                                    </div>

                                    {!entregada && (
                                        isExpired(tarea) ? (
                                            <div className="flex flex-col gap-4 items-center justify-center py-8 px-4 bg-red-50 border border-red-200 rounded-xl">
                                                <AlertCircle className="h-12 w-12 text-red-500" />
                                                <div className="text-center">
                                                    <h3 className="text-lg font-semibold text-red-700 mb-2">Tarea expirada</h3>
                                                    <p className="text-red-600">
                                                        La fecha límite expiró hace {getTimeAgo(tarea.fechaEntrega)}
                                                    </p>
                                                    <p className="text-sm text-red-500 mt-2">
                                                        No es posible realizar entregas para esta tarea
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleEntregaTarea} className="flex flex-col gap-6 tarea-anim-slideUp">
                                                {/* Selector de archivo */}
                                                <div className="relative group">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Paperclip className="h-5 w-5 text-blue-500" />
                                                        <span className="font-semibold text-gray-900">Adjuntar archivo</span>
                                                    </div>
                                                    <div className="w-full h-32 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center bg-blue-50/50 group-hover:bg-blue-50 transition-all cursor-pointer relative">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setArchivoEntrega(e.target.files[0])}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        {archivoEntrega ? (
                                                            <div className="flex items-center gap-2 text-blue-600">
                                                                <FileText className="h-6 w-6" />
                                                                <span className="font-medium">{archivoEntrega.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-gray-500">
                                                                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                                                                <p className="text-sm">Arrastra un archivo o haz clic para seleccionar</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Comentario */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="h-5 w-5 text-blue-500" />
                                                        <span className="font-semibold text-gray-900">Comentario</span>
                                                    </div>
                                                    <textarea
                                                        value={comentarioEntrega}
                                                        onChange={(e) => setComentarioEntrega(e.target.value)}
                                                        placeholder="Añade un comentario a tu entrega..."
                                                        className="w-full h-32 p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm text-gray-700 resize-none"
                                                    />
                                                </div>

                                                {/* Botón de entrega */}
                                                <button
                                                    type="submit"
                                                    disabled={isEntregandoLocal}
                                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg 
                                                             hover:bg-blue-700 active:bg-blue-800 transition-all duration-300
                                                             disabled:opacity-50 disabled:cursor-not-allowed
                                                             flex items-center justify-center gap-2"
                                                >
                                                    {isEntregandoLocal ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                            Entregando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="h-5 w-5" />
                                                            Entregar tarea
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TareaModal;  // Asegúrate de que esta línea existe