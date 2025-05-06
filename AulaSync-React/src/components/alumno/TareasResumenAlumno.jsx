import { useState } from 'react';
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

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
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
        const comentarioEntrega = tareaSeleccionada.comentarioEntrega || comentarioEntrega;

        return (
            <div
                className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                style={{ margin: 0, padding: 0 }}
            >                <div className="bg-white rounded-lg w-full max-w-6xl mx-4 flex flex-col md:flex-row relative">
                    <button
                        onClick={() => setShowTareaModal(false)}
                        className="absolute -top-3 -right-3 p-2 rounded-full hover:bg-red-100 transition-colors z-10 bg-red-500 shadow-lg"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    <div className="p-8 flex-1">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                                {tareaSeleccionada.titulo}
                            </h3>
                            <div className="text-sm text-gray-500">
                                Publicado por {tareaSeleccionada.clase?.nombre || 'Clase sin nombre'}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-600" />
                            <span className="text-amber-800">
                                <span className="font-medium">Fecha de entrega:</span>{" "}
                                {tareaSeleccionada.fechaEntrega
                                    ? new Date(tareaSeleccionada.fechaEntrega).toLocaleString()
                                    : "Sin fecha límite"}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Descripción de la tarea</h4>
                            <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-line min-h-[200px]">
                                {tareaSeleccionada.contenido || "Sin descripción"}
                            </div>
                        </div>

                        {downloadUrl && (
                            <div className="border-t pt-6">
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

                    {/* Panel derecho - Vista de entrega */}
                    <div className="bg-gray-50 p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200">
                        <div className="sticky top-8">
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
                                                {comentarioEntrega ? comentarioEntrega : <span className="italic text-gray-400">Sin comentario</span>}
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

    const renderSeccion = (titulo, tareas, seccionId, icon, bgColor) => (
        <div className="space-y-2">
            <button
                onClick={() => toggleSeccion(seccionId)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{titulo}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tareas.length}
                        </span>
                    </div>
                </div>
                {seccionesAbiertas[seccionId] ?
                    <ChevronUp className="h-5 w-5 text-gray-400" /> :
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                }
            </button>

            <div
                className={`transform transition-all duration-200 ease-in-out overflow-hidden ${seccionesAbiertas[seccionId] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="pl-14 pt-2">
                    {tareas.length > 0 ? (
                        <div className="space-y-3">
                            {tareas.map(tarea => (
                                <div
                                    key={tarea.id}
                                    className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                                    onClick={() => handleClickTarea(tarea)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-gray-900">
                                            <span className="font-semibold">Título:</span> {tarea.titulo || tarea.contenido}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <span className="font-semibold">Clase:</span> {tarea.clase?.nombre || 'Sin clase'}
                                        </span>
                                        {tarea.fechaEntrega && (
                                            <span className="text-xs text-gray-400">
                                                Entrega: {new Date(tarea.fechaEntrega).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                            No hay tareas en este período
                        </div>
                    )}
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
