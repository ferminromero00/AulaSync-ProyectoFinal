import { useState } from 'react';
import { BookOpen, Calendar, FileText, Paperclip, X, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';
import '../../styles/modalAnimations.css';

const TareaModal = ({
    showModal,
    tarea,
    onClose
}) => {
    // ...igual que en TareasResumenAlumno...
    const [archivoEntrega, setArchivoEntrega] = useState(null);
    const [comentarioEntrega, setComentarioEntrega] = useState('');
    const [isEntregando, setIsEntregando] = useState(false);
    const [entregada, setEntregada] = useState(!!tarea?.entregada);
    const [isClosing, setIsClosing] = useState(false);

    if (!showModal || !tarea) return null;

    const downloadUrl = tarea.archivoUrl ? `${API_BASE_URL}${tarea.archivoUrl}` : null;
    const archivoEntregaUrl = tarea.archivoEntregaUrl ? `${API_BASE_URL}${tarea.archivoEntregaUrl}` : null;
    const comentarioMostrado = tarea.comentarioEntrega || comentarioEntrega;

    const handleEntregaTarea = async () => {
        setIsEntregando(true);
        try {
            const formData = new FormData();
            formData.append('comentario', comentarioEntrega);
            if (archivoEntrega) formData.append('archivo', archivoEntrega);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tareas/${tarea.id}/entregar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) throw new Error('Error al entregar la tarea');
            setEntregada(true);
        } catch (e) {
            alert('Error al entregar la tarea');
        } finally {
            setIsEntregando(false);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200);
    };

    return (
        <div className={`fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50
            ${isClosing ? 'modal-closing' : ''}`} style={{ margin: 0, padding: 0 }}>
            <div className={`bg-white rounded-2xl w-full max-w-6xl mx-4 flex flex-col md:flex-row relative 
                shadow-2xl modal-content max-h-[90vh] overflow-hidden
                ${isClosing ? 'modal-content-closing' : ''}`}>
                {/* Botón de cerrar */}
                <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all"
                    style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Panel izquierdo */}
                <div className="p-8 flex-1 modal-content-left overflow-y-auto">
                    <div className="modal-item-stagger space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{tarea.titulo}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Publicado por {tarea.clase?.nombre || 'Clase sin nombre'}
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
                                    {tarea.fechaEntrega
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
                            <div className="bg-gray-50 rounded-xl p-6 text-gray-700 whitespace-pre-line min-h-[200px]
                                        border border-gray-100">
                                {tarea.contenido || "Sin descripción"}
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

                {/* Panel derecho */}
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
                                    {/* Nota y comentario del profesor */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium text-blue-800">Nota:</span>
                                            <span className="ml-2 text-blue-900 font-bold">
                                                {tarea.nota !== undefined && tarea.nota !== null && tarea.nota !== ''
                                                    ? tarea.nota
                                                    : <span className="italic text-blue-400">Sin calificar</span>
                                                }
                                            </span>
                                        </div>
                                        <div className="text-blue-700 mt-2">
                                            <span className="font-medium">Comentario del profesor:</span>
                                            <div className="w-full mt-1 px-2 py-1 border border-blue-200 rounded bg-white min-h-[40px]">
                                                {tarea.comentarioCorreccion
                                                    ? tarea.comentarioCorreccion
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

export default TareaModal;