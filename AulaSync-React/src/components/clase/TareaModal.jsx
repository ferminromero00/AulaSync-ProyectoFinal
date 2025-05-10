import { BookOpen, Calendar, FileText, Paperclip, X, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';

const TareaModal = ({ 
    showModal, 
    tarea, 
    role, 
    claseData, 
    onClose, 
    onEntregaTarea,
    comentarioEntrega,
    setComentarioEntrega,
    archivoEntrega,
    setArchivoEntrega,
    isEntregando,
    loadingEntregas,
    onOpenEntrega
}) => {
    if (!showModal || !tarea) return null;

    const downloadUrl = tarea.archivoUrl ? 
        `${API_BASE_URL}${tarea.archivoUrl}` : 
        null;

    const archivoEntregaUrl = tarea.archivoEntregaUrl
        ? `${API_BASE_URL}${tarea.archivoEntregaUrl}`
        : null;

    const estaEntregada = !!tarea.entregada;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-6xl mx-4 flex flex-col md:flex-row relative shadow-2xl max-h-[90vh] overflow-hidden modal-content">
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Panel izquierdo - Detalles de la tarea */}
                <div className="p-8 flex-1 overflow-y-auto modal-content-left">
                    <div className="modal-item-stagger space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{tarea.titulo}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Publicado por {tarea.autor?.nombre} · {new Date(tarea.fechaCreacion).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="bg-amber-200/50 p-2 rounded-lg">
                                <Calendar className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                                <div className="font-medium text-amber-900">Fecha de entrega</div>
                                <div className="text-sm text-amber-800">
                                    {tarea?.fechaEntrega
                                        ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
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
                            <div className="bg-gray-50 rounded-xl p-6 text-gray-700 whitespace-pre-line min-h-[200px] border border-gray-100">
                                {tarea.contenido || tarea.descripcion}
                            </div>
                        </div>

                        {tarea.archivoUrl && (
                            <div className="pt-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Paperclip className="h-5 w-5 text-gray-500" />
                                    Material de la tarea
                                </h4>
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow group"
                                >
                                    <FileText className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                    Descargar material
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel derecho - Vista de profesor o alumno */}
                <div className="bg-gradient-to-b from-gray-50 to-white p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto modal-content-right">
                    <div className="modal-item-stagger">
                        {role === 'profesor' ? (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-lg font-semibold text-gray-900">Entregas de la tarea</h4>
                                    <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded">
                                        {/* Aquí puedes agregar el estado de las entregas */}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Entregadas</p>
                                                <p className="text-2xl font-semibold text-gray-900">{tarea.entregas?.length || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Pendientes</p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {claseData?.estudiantes?.length
                                                        ? claseData.estudiantes.length - (tarea.entregas?.length || 0)
                                                        : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200">
                                        <div className="p-4 border-b border-gray-200">
                                            <h5 className="font-medium text-gray-900">Estado por estudiante</h5>
                                        </div>
                                        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                                            {claseData?.estudiantes?.map((estudiante) => {
                                                const entregas = tarea.entregas || [];
                                                const entrega = entregas.find(e =>
                                                    (e.alumno && (e.alumno.id === estudiante.id || e.alumno === estudiante.id))
                                                );
                                                if (loadingEntregas[estudiante.id]) {
                                                    return (
                                                        <div key={estudiante.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
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
                                                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer ${entrega ? "hover:bg-emerald-50" : ""}`}
                                                        onClick={() => entrega && onOpenEntrega(entrega)}
                                                        style={entrega ? { cursor: "pointer" } : { cursor: "default" }}
                                                        title={entrega ? "Ver entrega" : undefined}
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                                                        </div>
                                                        {entrega ? (
                                                            entrega.nota !== undefined && entrega.nota !== null && entrega.nota !== '' ? (
                                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full border border-emerald-300 flex items-center gap-1">
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
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-6">Tu entrega</h4>
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        {estaEntregada ? (
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
                                    {estaEntregada ? (
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
                                                    {tarea.comentarioEntrega ? tarea.comentarioEntrega : <span className="italic text-gray-400">Sin comentario</span>}
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                    <span className="font-medium text-gray-700">Fecha de entrega:</span>
                                                    <span className="text-gray-700">
                                                        {tarea.fechaEntregada
                                                            ? new Date(tarea.fechaEntregada).toLocaleString()
                                                            : 'Desconocida'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                                    <span className="font-medium text-gray-700">Título:</span>
                                                    <span className="text-gray-700">{tarea.titulo || tarea.contenido}</span>
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
                                                onClick={onEntregaTarea}
                                                disabled={isEntregando || estaEntregada}
                                            >
                                                <FileText className="h-5 w-5" />
                                                {isEntregando ? "Entregando..." : (estaEntregada ? "Ya entregada" : "Entregar tarea")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeSlideIn {
                    0% { opacity: 0; transform: translateY(40px) scale(0.98);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                }
                .animate-fadeSlideIn {
                    animation: fadeSlideIn 0.6s cubic-bezier(.4,1.4,.6,1) forwards;
                }
                .modal-content {
                    opacity: 0;
                    animation: fadeSlideIn 0.6s cubic-bezier(.4,1.4,.6,1) forwards;
                }
                .modal-content-left, .modal-content-right {
                    opacity: 0;
                    transform: translateY(40px) scale(0.98);
                    animation: fadeSlideIn 0.6s cubic-bezier(.4,1.4,.6,1) forwards;
                }
                .modal-content-left {
                    animation-delay: 0.1s;
                }
                .modal-content-right {
                    animation-delay: 0.25s;
                }
                .modal-item-stagger > * {
                    opacity: 0;
                    transform: translateY(24px);
                    animation: fadeSlideIn 0.5s cubic-bezier(.4,1.4,.6,1) forwards;
                }
                .modal-item-stagger > *:nth-child(1) { animation-delay: 0.25s; }
                .modal-item-stagger > *:nth-child(2) { animation-delay: 0.35s; }
                .modal-item-stagger > *:nth-child(3) { animation-delay: 0.45s; }
                .modal-item-stagger > *:nth-child(4) { animation-delay: 0.55s; }
                .modal-item-stagger > *:nth-child(5) { animation-delay: 0.65s; }
            `}</style>
        </div>
    );
};

export default TareaModal;