import { Bell, BookOpen, FileText, X } from 'lucide-react';

const AnuncioModal = ({
    showModal,
    showTipoSelector,
    anuncioData,
    onClose,
    onCreateAnuncio,
    setAnuncioData,
    setShowTipoSelector,
    isCreatingAnuncio,
    isClosing,
    // Props de diseño opcionales
    modalClassName,
    header,
    tipoSelectorClassName,
    tipoBtnClassName,
    tipoBtnContent,
    bodyClassName,
    footerClassName,
    btnCrearClassName,
    btnCancelarClassName
}) => {
    if (!showModal) return null;

    const handleCancelar = () => {
        setShowTipoSelector(true);
        setAnuncioData(prev => ({
            ...prev,
            tipo: ''
        }));
    };

    // Nuevo diseño visual para el selector de tipo con animaciones y hover interactivo en iconos
    const renderTipoSelector = () => (
        <div className="w-full">
            <div className="flex items-center gap-3 px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-t-2xl">
                <Bell className="h-7 w-7 text-blue-500 animate-fadeIn" />
                <span className="text-xl font-bold text-blue-900 animate-fadeIn" style={{ animationDelay: '80ms' }}>
                    Crear nueva publicación
                </span>
            </div>
            <div className="flex gap-6 px-8 pt-8 pb-4">
                <button
                    type="button"
                    onClick={() => {
                        setAnuncioData(prev => ({ ...prev, tipo: 'anuncio' }));
                        setShowTipoSelector(false);
                    }}
                    className={`
                        flex-1 flex flex-col items-center justify-center gap-3 py-8 px-2 rounded-2xl border-2 transition-all cursor-pointer
                        ${anuncioData.tipo === 'anuncio'
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}
                        group
                        animate-slideUp
                    `}
                    style={{ animationDelay: '120ms' }}
                >
                    <div className="flex items-center justify-center mb-2">
                        <Bell
                            className="h-10 w-10 text-blue-500 group-hover:text-blue-700 transition-colors duration-300
                            group-hover:scale-125 group-hover:-translate-y-1 group-hover:rotate-12
                            transition-transform"
                            style={{
                                transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), color 0.3s',
                            }}
                        />
                    </div>
                    <span className="font-semibold text-blue-900 text-lg animate-fadeIn" style={{ animationDelay: '200ms' }}>Publicar anuncio</span>
                    <span className="text-sm text-gray-500 text-center animate-fadeIn" style={{ animationDelay: '250ms' }}>Comparte información o avisos con tus estudiantes</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setAnuncioData(prev => ({ ...prev, tipo: 'tarea' }));
                        setShowTipoSelector(false);
                    }}
                    className={`
                        flex-1 flex flex-col items-center justify-center gap-3 py-8 px-2 rounded-2xl border-2 transition-all cursor-pointer
                        ${anuncioData.tipo === 'tarea'
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'}
                        group
                        animate-slideUp
                    `}
                    style={{ animationDelay: '220ms' }}
                >
                    <div className="flex items-center justify-center mb-2">
                        <FileText
                            className="h-10 w-10 text-indigo-500 group-hover:text-indigo-700 transition-colors duration-300
                            group-hover:scale-125 group-hover:-translate-y-1 group-hover:-rotate-12
                            transition-transform"
                            style={{
                                transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), color 0.3s',
                            }}
                        />
                    </div>
                    <span className="font-semibold text-indigo-900 text-lg animate-fadeIn" style={{ animationDelay: '300ms' }}>Crear tarea</span>
                    <span className="text-sm text-gray-500 text-center animate-fadeIn" style={{ animationDelay: '350ms' }}>Asigna actividades y trabajos a tus estudiantes</span>
                </button>
            </div>
            <div className="flex justify-end px-8 pb-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-all text-lg animate-fadeIn"
                    style={{ animationDelay: '400ms' }}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
            ${isClosing ? 'modal-closing' : ''}`}>
            <div className={modalClassName || "bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-xl modal-content overflow-hidden " + (isClosing ? 'modal-content-closing' : '')}>
                {showTipoSelector 
                    ? renderTipoSelector()
                    : anuncioData.tipo === 'tarea' ? (
                        <>
                            {/* Nuevo diseño para tarea, más consistente con anuncios */}
                            <div className="flex gap-6 p-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-t-2xl">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg animate-pop">
                                        <FileText className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 animate-fadeIn">
                                        Nueva Tarea
                                    </h3>
                                    <p className="text-gray-600 text-sm animate-fadeIn" style={{ animationDelay: '120ms' }}>
                                        Asigna actividades, ejercicios o trabajos a tus estudiantes.
                                    </p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={onCreateAnuncio} className="px-8 py-6 space-y-6 bg-white rounded-b-2xl">
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título de la tarea
                                    </label>
                                    <input
                                        type="text"
                                        value={anuncioData.titulo}
                                        onChange={(e) => setAnuncioData({...anuncioData, titulo: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 
                                                 focus:ring-2 focus:ring-indigo-200 text-gray-900 text-base
                                                 placeholder:text-gray-400 transition-shadow"
                                        placeholder="Ej: Ejercicio 1 - Programación"
                                        required
                                    />
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={anuncioData.descripcion}
                                        onChange={(e) => setAnuncioData({...anuncioData, descripcion: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 
                                                 focus:ring-2 focus:ring-indigo-200 text-gray-900 text-base resize-vertical
                                                 placeholder:text-gray-400 transition-shadow"
                                        rows={4}
                                        placeholder="Describe los detalles y requisitos de la tarea... (opcional)"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha límite de entrega
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={anuncioData.fechaEntrega}
                                            onChange={(e) => setAnuncioData({...anuncioData, fechaEntrega: e.target.value})}
                                            className="w-full h-[42px] px-4 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 
                                                     focus:ring-2 focus:ring-indigo-200 text-gray-900 text-base transition-shadow"
                                        />
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Archivo adjunto (opcional)
                                        </label>
                                        <div className="h-[42px]">
                                            <label className="w-full h-full flex items-center justify-center gap-2 px-4 bg-white text-gray-500 
                                                          rounded-xl border border-dashed border-gray-300 cursor-pointer 
                                                          hover:bg-gray-50 hover:border-indigo-300 transition-all">
                                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                                <span className="text-sm truncate">
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

                                <div className="border-t pt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancelar}
                                        className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                                                 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl
                                                 hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isCreatingAnuncio}
                                    >
                                        {isCreatingAnuncio ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Publicando...
                                            </span>
                                        ) : (
                                            'Publicar tarea'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Nuevo diseño alternativo para anuncio */}
                            <div className="flex gap-6 p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-t-2xl">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg animate-pop">
                                        <Bell className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 animate-fadeIn" style={{ animationDelay: '80ms' }}>
                                        Nuevo Anuncio
                                    </h3>
                                    <p className="text-gray-600 text-sm animate-fadeIn" style={{ animationDelay: '120ms' }}>
                                        Comparte información importante, avisos o recordatorios con tus estudiantes.
                                    </p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={onCreateAnuncio} className="px-8 py-6 bg-white rounded-b-2xl">
                                <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mensaje
                                    </label>
                                    <textarea
                                        value={anuncioData.contenido}
                                        onChange={(e) => setAnuncioData({...anuncioData, contenido: e.target.value})}
                                        className="w-full h-[180px] px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 
                                                 focus:ring-2 focus:ring-blue-200 text-gray-900 text-base resize-none
                                                 placeholder:text-gray-400 transition-shadow"
                                        placeholder="Escribe aquí tu mensaje para la clase..."
                                        required
                                        style={{ fontFamily: 'inherit' }}
                                    />
                                </div>

                                <div className="border-t">
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCancelar}
                                            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                                                     hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl
                                                     hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isCreatingAnuncio}
                                        >
                                            {isCreatingAnuncio ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Publicando...
                                                </span>
                                            ) : (
                                                'Publicar anuncio'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default AnuncioModal;

// Añade en tu CSS (animations.css o similar):
/*
.animate-fadeIn {
    animation: fadeIn 0.5s both;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px);}
    to { opacity: 1; transform: none;}
}
.animate-slideUp {
    animation: slideUp 0.5s both;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(32px);}
    to { opacity: 1; transform: none;}
}
.animate-pop {
    animation: pop 0.4s both;
}
@keyframes pop {
    0% { transform: scale(0.8);}
    80% { transform: scale(1.08);}
    100% { transform: scale(1);}
}
*/