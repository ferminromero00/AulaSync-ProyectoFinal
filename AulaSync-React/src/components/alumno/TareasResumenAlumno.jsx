import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar, AlertCircle, Hourglass, X, FileText, BookOpen, CheckCircle, Paperclip } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';

const TareasResumenAlumno = ({ tareas = [] }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: false,
        esteMes: false,
        proximamente: false,
        sinFecha: false,
        entregadas: false // Añadir nueva sección
    });
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [showTareaModal, setShowTareaModal] = useState(false);
    const [archivoEntrega, setArchivoEntrega] = useState(null);
    const [comentarioEntrega, setComentarioEntrega] = useState('');
    const [isEntregando, setIsEntregando] = useState(false);
    const [entregada, setEntregada] = useState(false);
    const [tareasState, setTareasState] = useState(tareas);

    const seccionRefs = {
        entregadas: useRef(null),
        estaSemana: useRef(null),
        esteMes: useRef(null),
        proximamente: useRef(null),
        sinFecha: useRef(null)
    };

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));

        // Si estamos abriendo la sección, hacemos scroll
        if (!seccionesAbiertas[seccion]) {
            setTimeout(() => {
                seccionRefs[seccion].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
    };

    // Lógica de fechas
    const hoy = new Date();
    const finDeSemana = new Date();
    finDeSemana.setDate(hoy.getDate() + (7 - hoy.getDay()));
    const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const dentroDeUnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

    // Filtrado de tareas por sección (usar tareasState en vez de tareas)
    // Solo tareas NO entregadas para las secciones de fechas
    const tareasNoEntregadas = tareasState.filter(t => !t.entregada);

    const tareasEstaSemana = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha >= hoy && fecha <= finDeSemana;
    });

    const tareasEsteMes = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeSemana && fecha <= finDeMes;
    });

    const tareasProximamente = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeMes;
    });

    const tareasSinFecha = tareasNoEntregadas.filter(t => !t.fechaEntrega);

    // Añadir nuevo filtro para tareas entregadas
    const tareasEntregadas = tareasState.filter(t => t.entregada);

    const handleClickTarea = (tarea) => {
        setTareaSeleccionada(tarea);
        setShowTareaModal(true);
        setArchivoEntrega(null);
        setComentarioEntrega('');
        setEntregada(!!tarea.entregada); // Si ya está entregada, marcarlo
    };

    const handleEntregaTarea = async () => {
        if (!tareaSeleccionada) return;
        setIsEntregando(true);
        try {
            const formData = new FormData();
            formData.append('comentario', comentarioEntrega);
            if (archivoEntrega) formData.append('archivo', archivoEntrega);

            // Suponiendo endpoint: /api/tareas/{id}/entregar
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tareas/${tareaSeleccionada.id}/entregar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Error al entregar la tarea');
            // Opcional: actualizar tareaSeleccionada con datos de entrega
            setEntregada(true);
            // Actualizar el estado de la tarea en el array de tareas
            setTareasState(prev =>
                prev.map(t =>
                    t.id === tareaSeleccionada.id
                        ? { ...t, entregada: true }
                        : t
                )
            );
            // Actualizar la tarea seleccionada también
            setTareaSeleccionada(prev =>
                prev ? { ...prev, entregada: true } : prev
            );
            // Opcional: notificar al usuario
        } catch (e) {
            alert('Error al entregar la tarea');
        } finally {
            setIsEntregando(false);
        }
    };

    const renderTareaModal = () => {
        if (!showTareaModal || !tareaSeleccionada) return null;

        // Construir la URL completa del archivo
        const downloadUrl = tareaSeleccionada.archivoUrl ?
            `${API_BASE_URL}${tareaSeleccionada.archivoUrl}` : null;

        // NUEVO: datos de la entrega del alumno
        const archivoEntregaUrl = tareaSeleccionada.archivoEntregaUrl
            ? `${API_BASE_URL}${tareaSeleccionada.archivoEntregaUrl}`
            : null;

        // Usar el comentario de la tarea guardada o el estado local
        const comentarioMostrado = tareaSeleccionada.comentarioEntrega || comentarioEntrega;

        return (
            <div
                className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                style={{ margin: 0, padding: 0 }}
            >                <div className="bg-white rounded-lg w-full max-w-6xl mx-4 flex flex-col md:flex-row relative modal-content max-h-[90vh] overflow-hidden">
                    <button
                        onClick={() => setShowTareaModal(false)}
                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-100 transition-colors z-10 bg-red-500 shadow-lg hover:scale-110 transform duration-200"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    <div className="p-8 flex-1 modal-content-left overflow-y-auto">
                        <div className="modal-item-stagger">
                            <div className="mb-6 modal-item-stagger">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                    <BookOpen className="h-7 w-7 text-blue-600" />
                                    {tareaSeleccionada.titulo}
                                </h3>
                                <div className="text-sm text-gray-500">
                                    Publicado por {tareaSeleccionada.clase?.nombre || 'Clase sin nombre'}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2 modal-item-stagger">
                                <Calendar className="h-5 w-5 text-amber-600" />
                                <span className="text-amber-800">
                                    <span className="font-medium">Fecha de entrega:</span>{" "}
                                    {tareaSeleccionada.fechaEntrega
                                        ? new Date(tareaSeleccionada.fechaEntrega).toLocaleString()
                                        : "Sin fecha límite"}
                                </span>
                            </div>

                            <div className="mb-6 modal-item-stagger">
                                <h4 className="font-medium text-gray-900 mb-3">Descripción de la tarea</h4>
                                <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-line min-h-[200px]">
                                    {tareaSeleccionada.contenido || "Sin descripción"}
                                </div>
                            </div>

                            {downloadUrl && (
                                <div className="border-t pt-6 modal-item-stagger">
                                    <h4 className="font-medium text-gray-900 mb-3">Material de la tarea</h4>
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <FileText className="h-5 w-5" />
                                        Descargar material
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel derecho - Vista de entrega */}
                    <div className="bg-gray-50 p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
                        <div className="modal-item-stagger">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6">Tu entrega</h4>
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    {entregada ? (
                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">¡Tarea entregada!</span>
                                        </div>
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
                                                {comentarioMostrado ? comentarioMostrado : <span className="italic text-gray-400">Sin comentario</span>}
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-700">Fecha de entrega:</span>
                                                <span className="text-gray-700">
                                                    {tareaSeleccionada.fechaEntregada
                                                        ? new Date(tareaSeleccionada.fechaEntregada).toLocaleString()
                                                        : 'Desconocida'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-700">Título:</span>
                                                <span className="text-gray-700">{tareaSeleccionada.titulo || tareaSeleccionada.contenido}</span>
                                            </div>
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
                                            disabled={isEntregando}
                                        >
                                            <FileText className="h-5 w-5" />
                                            {isEntregando ? "Entregando..." : "Entregar tarea"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTarea = (tarea) => (
        <div
            key={tarea.id}
            onClick={() => handleClickTarea(tarea)}
            className="p-6 bg-white rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {tarea.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        {tarea.clase?.nombre || 'Sin clase'}
                    </p>
                </div>
                <div className="flex items-start gap-2">
                    {tarea.entregada ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Entregada
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Pendiente
                        </span>
                    )}
                </div>
            </div>

            {/* Línea divisoria y detalles adicionales - Ahora siempre visible */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Fecha límite:</span>
                        <span className="font-medium">
                            {tarea.fechaEntrega
                                ? new Date(tarea.fechaEntrega).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : "Sin fecha límite"}
                        </span>
                    </div>
                    {tarea.archivoUrl && (
                        <span className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">Adjunto</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSeccion = (titulo, tareas, seccionId, icon, bgColor) => (
        <div
            ref={seccionRefs[seccionId]}
            className="space-y-3"
        >
            <button
                onClick={() => toggleSeccion(seccionId)}
                className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm 
                hover:shadow-md hover:border-gray-200 transition-all duration-300 ease-in-out
                ${seccionesAbiertas[seccionId] ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${bgColor} transform transition-transform duration-200 
                        ${seccionesAbiertas[seccionId] ? 'scale-110' : 'scale-100'}`}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 text-lg">{titulo}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300
                            ${seccionesAbiertas[seccionId]
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'}`}
                        >
                            {tareas.length}
                        </span>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${seccionesAbiertas[seccionId] ? 'rotate-180' : 'rotate-0'
                    }`}>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out
                ${seccionesAbiertas[seccionId]
                    ? 'grid-rows-[1fr] opacity-100 translate-y-0'
                    : 'grid-rows-[0fr] opacity-0 -translate-y-4'}
            `}>
                <div className="overflow-hidden">
                    <div className="space-y-3 pt-2">
                        {tareas.length > 0 ? (
                            tareas.map((tarea, index) => (
                                <div
                                    key={tarea.id}
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                    className="animate-slideIn"
                                >
                                    {renderTarea(tarea)}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100
                                animate-fadeIn">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-bounce" />
                                <p className="text-gray-500">No hay tareas en este período</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {renderSeccion(
                "Entregadas",
                tareasEntregadas,
                "entregadas",
                <FileText className="h-5 w-5 text-emerald-600" />,
                "bg-emerald-50"
            )}
            {renderSeccion(
                "Esta semana",
                tareasEstaSemana,
                "estaSemana",
                <Clock className="h-5 w-5 text-orange-600" />,
                "bg-orange-50"
            )}
            {renderSeccion(
                "Este mes",
                tareasEsteMes,
                "esteMes",
                <Calendar className="h-5 w-5 text-blue-600" />,
                "bg-blue-50"
            )}
            {renderSeccion(
                "Próximamente",
                tareasProximamente,
                "proximamente",
                <Hourglass className="h-5 w-5 text-green-600" />,
                "bg-green-50"
            )}
            {renderSeccion(
                "Sin fecha de entrega",
                tareasSinFecha,
                "sinFecha",
                <AlertCircle className="h-5 w-5 text-gray-600" />,
                "bg-gray-50"
            )}
            {renderTareaModal()}
        </div>
    );
};

export default TareasResumenAlumno;
