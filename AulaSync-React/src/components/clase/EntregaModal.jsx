import { X, FileText, Paperclip, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';
import { toast, Toaster } from 'react-hot-toast';

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

    // Nueva lógica: no permitir nota > 10 y notificar
    const handleNotaChange = (e) => {
        const valor = e.target.value;
        if (parseFloat(valor) > 10) {
            toast.error('La nota no puede ser mayor que 10', {
                position: "top-right",
                style: {
                    background: '#fff',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px 0 rgba(220,38,38,0.08)'
                },
                iconTheme: {
                    primary: '#dc2626',
                    secondary: '#fff'
                }
            });
            setNotaEdicion('10');
        } else {
            setNotaEdicion(valor);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Toaster para notificaciones arriba a la derecha y con z-index alto */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        zIndex: 999999,
                        background: '#fff',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px 0 rgba(220,38,38,0.08)'
                    },
                    iconTheme: {
                        primary: '#dc2626',
                        secondary: '#fff'
                    }
                }}
                containerStyle={{ zIndex: 999999 }}
            />
            <div
                className={`relative w-full max-w-lg mx-4 animate-entregaModalIn`}
                style={{
                    height: !estaCalificado ? 540 : 'auto',
                    minHeight: !estaCalificado ? 540 : undefined,
                    maxHeight: 600,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-white to-emerald-100 rounded-2xl shadow-2xl scale-105 blur-[1.5px] z-0" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden p-0 flex flex-col h-full">
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
                    <div className={`px-8 py-5 space-y-4 flex-1 overflow-y-auto`}>
                        {/* Comentario */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-800">Comentario del alumno</span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-700 min-h-[38px] shadow-inner text-sm">
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
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-200 hover:border-emerald-300 transition-all shadow group text-sm"
                                >
                                    <FileText className="h-5 w-5 text-emerald-600 group-hover:text-emerald-900" />
                                    Descargar archivo
                                </a>
                            ) : (
                                <span className="text-gray-400 italic text-sm">No se adjuntó archivo</span>
                            )}
                        </div>
                        {/* Estado de calificación y nota */}
                        <div className={`rounded-2xl p-0 mt-2 overflow-hidden shadow-lg ${estaCalificado ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200" : "bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200"}`}>
                            <div className="flex items-center gap-3 px-6 py-3 border-b">
                                <CheckCircle className={`h-6 w-6 ${estaCalificado ? "text-emerald-600" : "text-blue-600"}`} />
                                <span className={`font-semibold text-base ${estaCalificado ? "text-emerald-800" : "text-blue-800"}`}>
                                    {estaCalificado ? "Calificado" : "Pendiente de calificar"}
                                </span>
                            </div>
                            <div className="px-6 py-3 space-y-2">
                                {estaCalificado ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-emerald-800">Nota:</span>
                                            <span className="text-xl font-bold text-emerald-700">{entrega.nota}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-emerald-800">Comentario de corrección:</span>
                                            <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-2 mt-1 text-emerald-900 min-h-[32px] text-sm">
                                                {entrega.comentarioCorreccion
                                                    ? entrega.comentarioCorreccion
                                                    : <span className="italic text-emerald-400">Sin comentario</span>}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <form
                                        className="flex flex-col gap-2"
                                        onSubmit={e => { e.preventDefault(); onCalificar(); }}
                                    >
                                        <div className="flex gap-2 items-center">
                                            <label className="block text-sm font-medium text-blue-900 mb-0">
                                                Nota
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                className="w-20 px-2 py-1 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base font-bold text-blue-900 bg-white shadow-sm transition-all"
                                                value={notaEdicion}
                                                onChange={handleNotaChange}
                                                disabled={isCalificando}
                                                required
                                            />
                                            <span className="text-xs text-blue-400">(0-10)</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-900 mb-1">
                                                Comentario de corrección <span className="text-blue-400">(opcional)</span>
                                            </label>
                                            <textarea
                                                className="w-full px-2 py-1 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-blue-900 bg-white shadow-sm transition-all"
                                                rows={2}
                                                value={comentarioCorreccion}
                                                onChange={e => setComentarioCorreccion(e.target.value)}
                                                disabled={isCalificando}
                                                placeholder="Escribe un comentario para el alumno..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/10 transition-all text-base flex items-center justify-center gap-2 disabled:opacity-60"
                                            disabled={isCalificando}
                                        >
                                            {isCalificando ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-5 w-5" />
                                                    Guardar calificación
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
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