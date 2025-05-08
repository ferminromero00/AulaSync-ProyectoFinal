import { X, FileText, Paperclip, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';

const EntregaModal = ({
    showModal,
    entrega,
    notaEdicion,
    setNotaEdicion,
    comentarioCorreccion,
    setComentarioCorreccion,
    onClose,
    onCalificar,
    isCalificando
}) => {
    if (!showModal || !entrega) return null;

    const archivoUrl = entrega.archivoUrl ? `${API_BASE_URL}${entrega.archivoUrl}` : null;
    const estaCalificado = entrega.nota !== undefined && entrega.nota !== null && entrega.nota !== '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 animate-entregaModalIn">
                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-white to-emerald-100 rounded-2xl shadow-2xl scale-105 blur-[1.5px] z-0" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden p-0">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-emerald-50">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-full p-2 shadow ${estaCalificado ? "bg-emerald-400" : "bg-blue-200"}`}>
                                <CheckCircle className={`h-7 w-7 ${estaCalificado ? "text-white" : "text-emerald-600"}`} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    <span className="text-blue-700">{entrega.alumno?.nombre}</span>
                                </h2>
                                <div className="text-xs text-gray-500">
                                    Entregado el {entrega.fechaEntrega ? new Date(entrega.fechaEntrega).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'Desconocida'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow transition-all"
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Cuerpo */}
                    <div className="px-8 py-7 space-y-7">
                        {/* Comentario */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-800">Comentario del alumno</span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-gray-700 min-h-[60px] shadow-inner">
                                {entrega.comentario
                                    ? <span>{entrega.comentario}</span>
                                    : <span className="italic text-gray-400">Sin comentario</span>}
                            </div>
                        </div>
                        {/* Archivo */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Paperclip className="h-5 w-5 text-emerald-500" />
                                <span className="font-semibold text-gray-800">Archivo entregado</span>
                            </div>
                            {archivoUrl ? (
                                <a
                                    href={archivoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-200 hover:border-emerald-300 transition-all shadow group"
                                >
                                    <FileText className="h-5 w-5 text-emerald-600 group-hover:text-emerald-900" />
                                    Descargar archivo
                                </a>
                            ) : (
                                <span className="text-gray-400 italic">No se adjuntó archivo</span>
                            )}
                        </div>
                        {/* Estado de calificación y nota */}
                        <div className={`rounded-lg p-4 mt-4 ${estaCalificado ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className={`h-5 w-5 ${estaCalificado ? "text-emerald-600" : "text-blue-600"}`} />
                                <span className={`font-medium ${estaCalificado ? "text-emerald-800" : "text-blue-800"}`}>
                                    {estaCalificado ? "Calificado" : "Pendiente de calificar"}
                                </span>
                            </div>
                            {estaCalificado ? (
                                <>
                                    <div className="text-emerald-700 text-lg font-bold mt-2">
                                        Nota: <span className="ml-2">{entrega.nota}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="font-medium text-emerald-800">Comentario de corrección:</span>
                                        <div className="bg-emerald-100 border border-emerald-200 rounded p-2 mt-1 text-emerald-900 min-h-[40px]">
                                            {entrega.comentarioCorreccion
                                                ? entrega.comentarioCorreccion
                                                : <span className="italic text-emerald-400">Sin comentario</span>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
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
                                        <span className="font-medium">Comentario de corrección:</span>
                                        <textarea
                                            className="w-full mt-1 px-2 py-1 border border-blue-200 rounded"
                                            rows={2}
                                            value={comentarioCorreccion}
                                            onChange={e => setComentarioCorreccion(e.target.value)}
                                            disabled={isCalificando}
                                        />
                                    </div>
                                    <button
                                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        onClick={onCalificar}
                                        disabled={isCalificando}
                                    >
                                        {isCalificando ? "Guardando..." : "Guardar calificación"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Animaciones CSS */}
                <style>{`
                    @keyframes entregaModalIn {
                        0% { opacity: 0; transform: translateY(60px) scale(0.97);}
                        80% { opacity: 1; transform: translateY(-8px) scale(1.03);}
                        100% { opacity: 1; transform: translateY(0) scale(1);}
                    }
                    .animate-entregaModalIn {
                        animation: entregaModalIn 0.55s cubic-bezier(.4,1.7,.7,1) both;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EntregaModal;