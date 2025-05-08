import { Bell, BookOpen, X } from 'lucide-react';

const AnuncioModal = ({
    showModal,
    showTipoSelector,
    anuncioData,
    onClose,
    onCreateAnuncio,
    setAnuncioData,
    setShowTipoSelector,
    isCreatingAnuncio,
    isClosing
}) => {
    if (!showModal) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
            ${isClosing ? 'modal-closing' : ''}`}>
            <div className={`bg-white rounded-xl p-6 w-full max-w-2xl mx-4 modal-content
                ${isClosing ? 'modal-content-closing' : ''}`}>
                {showTipoSelector ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Crear nueva publicación</h3>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setAnuncioData(prev => ({ ...prev, tipo: 'anuncio' }));
                                    setShowTipoSelector(false);
                                }}
                                className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-center"
                            >
                                <div className="flex justify-center mb-3">
                                    <Bell className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-2">Publicar anuncio</h4>
                                <p className="text-sm text-gray-500">Comparte información o avisos con tus estudiantes</p>
                            </button>
                            <button
                                onClick={() => {
                                    setAnuncioData(prev => ({ ...prev, tipo: 'tarea' }));
                                    setShowTipoSelector(false);
                                }}
                                className="p-6 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-center"
                            >
                                <div className="flex justify-center mb-3">
                                    <BookOpen className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-2">Crear tarea</h4>
                                <p className="text-sm text-gray-500">Asigna actividades y trabajos a tus estudiantes</p>
                            </button>
                        </div>
                    </>
                ) : (
                    anuncioData.tipo === 'anuncio' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Bell className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Nuevo Anuncio</h3>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={onCreateAnuncio} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mensaje
                                    </label>
                                    <textarea
                                        value={anuncioData.contenido}
                                        onChange={(e) => setAnuncioData({...anuncioData, contenido: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        rows={6}
                                        placeholder="Escribe aquí tu mensaje..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                                        disabled={isCreatingAnuncio}
                                    >
                                        Publicar anuncio
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Nueva Tarea</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowTipoSelector(true)}
                                        className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                                    >
                                        Volver
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={onCreateAnuncio} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título de la tarea
                                    </label>
                                    <input
                                        type="text"
                                        value={anuncioData.titulo}
                                        onChange={(e) => setAnuncioData({...anuncioData, titulo: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        placeholder="Ej: Ejercicio 1 - Programación"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={anuncioData.descripcion}
                                        onChange={(e) => setAnuncioData({...anuncioData, descripcion: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        rows={4}
                                        placeholder="Describe los detalles y requisitos de la tarea... (opcional)"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="h-[104px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha límite de entrega
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={anuncioData.fechaEntrega}
                                            onChange={(e) => setAnuncioData({...anuncioData, fechaEntrega: e.target.value})}
                                            className="w-full h-[72px] px-4 flex items-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        />
                                    </div>

                                    <div className="h-[104px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Archivo adjunto (opcional)
                                        </label>
                                        <div className="flex items-center justify-center w-full h-[72px]">
                                            <label className="w-full h-full flex flex-col items-center justify-center px-4 bg-white text-gray-500 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                                                <BookOpen className="h-6 w-6 mb-2" />
                                                <span className="text-sm text-center">
                                                    {anuncioData.archivo ? anuncioData.archivo.name : 'Haz clic para subir archivo'}
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => setAnuncioData({...anuncioData, archivo: e.target.files[0]})}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                                        disabled={isCreatingAnuncio}
                                    >
                                        Publicar tarea
                                    </button>
                                </div>
                            </form>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default AnuncioModal;