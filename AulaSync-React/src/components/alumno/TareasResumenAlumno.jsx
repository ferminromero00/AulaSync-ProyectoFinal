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
    const [isClosing, setIsClosing] = useState(false);
    const [notaEdicion, setNotaEdicion] = useState('');
    const [comentarioCorreccionEdicion, setComentarioCorreccionEdicion] = useState('');
    const [isCalificando, setIsCalificando] = useState(false);

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
        // Inicializar campos de edición si ya hay nota
        setNotaEdicion(tarea.nota !== undefined ? tarea.nota : '');
        setComentarioCorreccionEdicion(tarea.comentarioCorreccion || '');
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

    // Nueva función para calificar la entrega
    const handleCalificarEntrega = async () => {
        if (!tareaSeleccionada || !tareaSeleccionada.entregaId) {
            alert('No se puede calificar esta entrega');
            return;
        }
        setIsCalificando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/entregas/${tareaSeleccionada.entregaId}/calificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nota: notaEdicion,
                    comentarioCorreccion: comentarioCorreccionEdicion
                })
            });
            if (!response.ok) throw new Error('Error al calificar la entrega');
            // Actualizar la tarea seleccionada y el array de tareas
            setTareaSeleccionada(prev =>
                prev
                    ? { ...prev, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                    : prev
            );
            setTareasState(prev =>
                prev.map(t =>
                    t.id === tareaSeleccionada.id
                        ? { ...t, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                        : t
                )
            );
            alert('Entrega calificada correctamente');
        } catch (e) {
            alert('Error al calificar la entrega');
        } finally {
            setIsCalificando(false);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowTareaModal(false);
            setIsClosing(false);
        }, 200); // Coincidir con la duración de la animación
    };

    const renderTareaModal = () => {
        if (!showTareaModal || !tareaSeleccionada) return null;

        const downloadUrl = tareaSeleccionada.archivoUrl ? 
            `${API_BASE_URL}${tareaSeleccionada.archivoUrl}` : null;
        const archivoEntregaUrl = tareaSeleccionada.archivoEntregaUrl ? 
            `${API_BASE_URL}${tareaSeleccionada.archivoEntregaUrl}` : null;
        const comentarioMostrado = tareaSeleccionada.comentarioEntrega || comentarioEntrega;

        return (
            <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm
                ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-2xl w-full max-w-6xl mx-4 flex flex-col md:flex-row relative 
                    shadow-2xl modal-content max-h-[90vh] overflow-hidden
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    {/* Botón de cerrar dentro del modal, arriba a la derecha */}
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all"
                        style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="p-8 flex-1 modal-content-left overflow-y-auto">
                        <div className="modal-item-stagger space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{tareaSeleccionada.titulo}</h3>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Publicado por {tareaSeleccionada.clase?.nombre || 'Clase sin nombre'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50 
                                        rounded-xl px-4 py-3 flex items-center gap-3">
                                <div className="bg-amber-200/50 p-2 rounded-lg">
                                    <Calendar className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                    <div className="font-medium text-amber-900">Fecha de entrega</div>
                                    <div className="text-sm text-amber-800">
                                        {tareaSeleccionada.fechaEntrega
                                            ? new Date(tareaSeleccionada.fechaEntrega).toLocaleString('es-ES', {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                              })
                                            : "Sin fecha límite"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    Descripción de la tarea
                                </h4>
                                <div className="bg-gray-50 rounded-xl p-6 text-gray-700 whitespace-pre-line min-h-[200px]
                                            border border-gray-100">
                                    {tareaSeleccionada.contenido || "Sin descripción"}
                                </div>
                            </div>

                            {downloadUrl && (
                                <div className="pt-4">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Paperclip className="h-5 w-5 text-gray-500" />
                                        Material de la tarea
                                    </h4>
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 
                                                 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all
                                                 shadow-sm hover:shadow group"
                                    >
                                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                        Descargar material
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-b from-gray-50 to-white p-8 w-full md:w-[400px] border-t 
                                 md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
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
                                        {/* Mostrar nota y comentario de corrección si existen */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-blue-800">Nota:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    className="ml-2 px-2 py-1 rounded border border-blue-200 w-20"
                                                    value={notaEdicion}
                                                    onChange={e => setNotaEdicion(e.target.value)}
                                                    disabled={isCalificando}
                                                />
                                            </div>
                                            <div className="text-blue-700 mt-2">
                                                <span className="font-medium">Comentario del profesor:</span>
                                                <textarea
                                                    className="w-full mt-1 px-2 py-1 border border-blue-200 rounded"
                                                    rows={2}
                                                    value={comentarioCorreccionEdicion}
                                                    onChange={e => setComentarioCorreccionEdicion(e.target.value)}
                                                    disabled={isCalificando}
                                                />
                                            </div>
                                            <button
                                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                onClick={handleCalificarEntrega}
                                                disabled={isCalificando}
                                            >
                                                {isCalificando ? "Guardando..." : "Guardar calificación"}
                                            </button>
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
            className="group bg-gradient-to-r from-blue-50 to-blue-50/50 border-l-4 border-blue-400 
                     p-4 rounded-xl relative cursor-pointer transition-all duration-300
                     hover:shadow-xl hover:z-20"
            style={{
                outline: "none"
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-700">{tarea.titulo}</h3>
                </div>
                {tarea.entregada ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 
                                text-xs font-medium rounded-full border border-emerald-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Entregada
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 
                                text-xs font-medium rounded-full border border-amber-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        Pendiente
                    </div>
                )}
            </div>
            <div className="text-sm text-gray-600">
                <Calendar className="h-4 w-4 inline mr-1" />
                {tarea.fechaEntrega
                    ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : "Sin fecha límite"}
            </div>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    {tarea.clase?.nombre || 'Sin clase'}
                </span>
                <div className="flex items-center gap-2">
                    {tarea.archivoUrl && (
                        <span className="flex items-center gap-1 text-blue-600">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">Adjunto</span>
                        </span>
                    )}
                    <span className="text-xs text-gray-500">
                        Ver detalles →
                    </span>
                </div>
            </div>
            {/* Mejorar el hover: outline y z-index, sin scale */}
            <style>{`
                .group:hover {
                    outline: 2px solid #3b82f6; /* azul-500 */
                    outline-offset: 2px;
                    background: linear-gradient(to right, #e0e7ff, #f0f9ff 50%);
                }
            `}</style>
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
