import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X, MoreVertical, AlertTriangle, Calendar, FileText } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchAlumnos } from '../../services/alumnos';
import { enviarInvitacion } from '../../services/invitaciones';
import { toast } from 'react-hot-toast';
import { crearAnuncio, obtenerAnuncios, eliminarAnuncio } from '../../services/anuncios';
import { API_BASE_URL } from '../../config/config';

const ClaseDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clase, setClase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [invitingId, setInvitingId] = useState(null);
    const [showAlumnosModal, setShowAlumnosModal] = useState(false);
    const [showAnuncioModal, setShowAnuncioModal] = useState(false);
    const [anuncioData, setAnuncioData] = useState({
        contenido: '',
        tipo: '',
        titulo: '',
        fechaEntrega: '',
        archivo: null,
        descripcion: ''
    });
    const [showTipoSelector, setShowTipoSelector] = useState(true);
    const [anuncios, setAnuncios] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [anuncioToDelete, setAnuncioToDelete] = useState(null);
    const [isDeletingAnuncio, setIsDeletingAnuncio] = useState(false);
    const [isCreatingAnuncio, setIsCreatingAnuncio] = useState(false);
    const [showTareaModal, setShowTareaModal] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

    // Detectar el rol del usuario (ajusta si lo guardas en otro sitio)
    const role = localStorage.getItem('role'); // 'profesor' o 'alumno'

    useEffect(() => {
        const fetchClase = async () => {
            try {
                const data = await getClaseById(id);
                setClase(data);
            } catch (error) {
                console.error('Error al cargar la clase:', error);
                if (error.message.includes('No autorizado')) {
                    navigate('/'); // Redirigir al login si el token no es válido
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchClase();
    }, [id, navigate]);

    const fetchAnuncios = async () => {
        try {
            const anunciosData = await obtenerAnuncios(id);
            setAnuncios(anunciosData);
        } catch (error) {
            console.error('Error al cargar los anuncios:', error);
            toast.error('Error al cargar los anuncios');
            setAnuncios([]);
        }
    };

    useEffect(() => {
        fetchAnuncios();
    }, [id]);

    const handleSearchAlumnos = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            const data = await searchAlumnos(query);
            setSearchResults(data);
        } catch (error) {
            console.error('Error buscando alumnos:', error);
            setSearchResults([]);
            // Opcionalmente puedes mostrar un mensaje de error al usuario
        } finally {
            setIsSearching(false);
        }
    };

    const debouncedSearch = debounce(handleSearchAlumnos, 1000);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleInvitarAlumno = async (alumno) => {
        try {
            setInvitingId(alumno.id);
            const result = await enviarInvitacion(alumno.id, id);
            if (result && result.alreadyInClass) {
                toast.error('El alumno ya pertenece a esta clase');
                setInvitingId(null);
                return;
            }
            toast.success(`Invitación enviada a ${alumno.nombre}`);
            setShowSearchModal(false);
        } catch (error) {
            // No mostrar en consola si es error controlado
            if (
                error.message === 'Ya existe una invitación pendiente' ||
                error.message === 'El alumno ya pertenece a esta clase'
            ) {
                toast.error(error.message);
            } else {
                console.error('Error al enviar invitación:', error);
                toast.error(error.message || 'Error al enviar la invitación');
            }
        } finally {
            setInvitingId(null);
        }
    };

    const handleCreateAnuncio = async (e) => {
        e.preventDefault();
        try {
            setIsCreatingAnuncio(true);
            let dataToSend = {
                ...anuncioData,
                claseId: id
            };

            if (anuncioData.tipo === 'tarea') {
                dataToSend = {
                    ...dataToSend,
                    contenido: anuncioData.descripcion,
                    // Solo incluir fechaEntrega si tiene un valor
                    ...(anuncioData.fechaEntrega ? { fechaEntrega: anuncioData.fechaEntrega } : {})
                };
            }

            await crearAnuncio(dataToSend);
            toast.success(anuncioData.tipo === 'tarea' ? 'Tarea creada correctamente' : 'Anuncio creado correctamente');
            setShowAnuncioModal(false);
            setAnuncioData({
                contenido: '',
                tipo: '',
                titulo: '',
                fechaEntrega: '',
                archivo: null,
                descripcion: ''
            });
            setShowTipoSelector(true);
            fetchAnuncios();
        } catch (error) {
            toast.error(error.message || 'Error al crear el anuncio');
        } finally {
            setIsCreatingAnuncio(false);
        }
    };

    const handleDeleteAnuncio = async (anuncioId) => {
        setAnuncioToDelete(anuncioId);
        setShowDeleteModal(true);
    };

    const confirmDeleteAnuncio = async () => {
        try {
            setIsDeletingAnuncio(true);
            await eliminarAnuncio(anuncioToDelete);
            setAnuncios(prevAnuncios => prevAnuncios.filter(a => a.id !== anuncioToDelete));
            toast.success('Anuncio eliminado correctamente');
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error al eliminar anuncio:', error);
            toast.error('Error al eliminar el anuncio');
        } finally {
            setIsDeletingAnuncio(false);
            setAnuncioToDelete(null);
        }
    };

    const handleOpenTarea = (tarea) => {
        setTareaSeleccionada(tarea);
        setShowTareaModal(true);
    };

    // NUEVO: función para recortar texto con puntos suspensivos
    const recortarTexto = (texto, max = 80) => {
        if (!texto) return '';
        return texto.length > max ? texto.slice(0, max) + '...' : texto;
    };

    const renderStudentSearchModal = () => {
        if (!showSearchModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Buscar Alumnos</h3>
                        <button 
                            onClick={() => setShowSearchModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Buscar por email..."
                            className="w-full p-2 border border-gray-300 rounded-md pr-10"
                        />
                        <Search className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
                    </div>

                    <div className="mt-4 max-h-60 overflow-y-auto">
                        {isSearching ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            </div>
                        ) : searchTerm && searchResults.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No se encontraron resultados</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {searchResults.map((alumno) => (
                                    <li 
                                        key={alumno.id} 
                                        className="py-3 hover:bg-gray-50 cursor-pointer px-2 rounded transition-colors"
                                        onClick={() => handleInvitarAlumno(alumno)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{alumno.nombre}</div>
                                                <div className="text-sm text-gray-500">{alumno.email}</div>
                                            </div>
                                            {invitingId === alumno.id && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAlumnosModal = () => {
        if (!showAlumnosModal) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                    <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowAlumnosModal(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <h3 className="text-xl font-semibold mb-4">Lista de Alumnos</h3>
                    {clase.estudiantes && clase.estudiantes.length > 0 ? (
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {clase.estudiantes.map((alumno) => (
                                <li key={alumno.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{alumno.nombre}</div>
                                        <div className="text-sm text-gray-500">{alumno.email}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No hay estudiantes inscritos.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderAnuncioModal = () => {
        if (!showAnuncioModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
                    {showTipoSelector ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Crear nueva publicación</h3>
                                <button 
                                    onClick={() => {
                                        setShowAnuncioModal(false);
                                        setAnuncioData({ contenido: '', tipo: '' });
                                        setShowTipoSelector(true);
                                    }}
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
                        // Aquí va el formulario existente de crear anuncio o tarea
                        anuncioData.tipo === 'anuncio' ? (
                            // Tu código existente del formulario de anuncio
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Bell className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">Nuevo Anuncio</h3>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setShowAnuncioModal(false);
                                            setAnuncioData({ contenido: '', tipo: '' });
                                            setShowTipoSelector(true);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateAnuncio} className="space-y-6">
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
                                            onClick={() => {
                                                setShowAnuncioModal(false);
                                                setAnuncioData({ contenido: '', tipo: '' });
                                                setShowTipoSelector(true);
                                            }}
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
                            // Formulario de tarea
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
                                            onClick={() => {
                                                setShowAnuncioModal(false);
                                                setAnuncioData({ contenido: '', tipo: '', titulo: '', fechaEntrega: '', archivo: null, descripcion: '' });
                                                setShowTipoSelector(true);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateAnuncio} className="space-y-6">
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
                                        <div className="h-[104px]"> {/* Altura fija para ambos contenedores */}
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

                                        <div className="h-[104px]"> {/* Misma altura que el contenedor de fecha */}
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Archivo adjunto (opcional)
                                            </label>
                                            <div className="flex items-center justify-center w-full h-[72px]"> {/* Altura restante considerando el label */}
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
                                            onClick={() => {
                                                setShowAnuncioModal(false);
                                                setAnuncioData({ contenido: '', tipo: '', titulo: '', fechaEntrega: '', archivo: null, descripcion: '' });
                                                setShowTipoSelector(true);
                                            }}
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

    const renderDeletingOverlay = () => {
        if (!isDeletingAnuncio) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600"></div>
                    <span>Eliminando anuncio...</span>
                </div>
            </div>
        );
    };

    const renderCreatingOverlay = () => {
        if (!isCreatingAnuncio) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600"></div>
                    <span>Creando anuncio...</span>
                </div>
            </div>
        );
    };

    const renderTareaModal = () => {
        if (!showTareaModal || !tareaSeleccionada) return null;
        
        // Construir la URL completa usando API_BASE_URL
        const downloadUrl = tareaSeleccionada.archivoUrl ? 
            `${API_BASE_URL}${tareaSeleccionada.archivoUrl}` : 
            null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-6xl mx-4 flex flex-col md:flex-row relative">
                    {/* Botón de cerrar reposicionado más arriba */}
                    <button
                        onClick={() => setShowTareaModal(false)}
                        className="absolute -top-3 -right-3 p-2 rounded-full hover:bg-red-100 transition-colors z-10 bg-red-500 shadow-lg"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    {/* Panel izquierdo - Detalles de la tarea */}
                    <div className="p-8 flex-1">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                                {tareaSeleccionada.titulo}
                            </h3>
                            <div className="text-sm text-gray-500">
                                Publicado por {tareaSeleccionada.autor?.nombre} · {new Date(tareaSeleccionada.fechaCreacion).toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-600" />
                            <span className="text-amber-800">
                                <span className="font-medium">Fecha de entrega:</span>{" "}
                                {tareaSeleccionada?.fechaEntrega
                                    ? new Date(tareaSeleccionada.fechaEntrega).toLocaleString()
                                    : "Sin fecha límite"}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Descripción de la tarea</h4>
                            <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-line min-h-[200px]">
                                {tareaSeleccionada.contenido || tareaSeleccionada.descripcion}
                            </div>
                        </div>

                        {tareaSeleccionada.archivoUrl && (
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

                    {/* Panel derecho - Vista de profesor (entregas) o alumno (subir tarea) */}
                    {role === 'profesor' ? (
                        <div className="bg-gray-50 p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200">
                            <div className="sticky top-8">
                                {/* Añadido mb-8 para dar más espacio */}
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-lg font-semibold text-gray-900">Entregas de la tarea</h4>
                                    <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded">
                                        0 entregas
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Estado general de entregas */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Entregadas</p>
                                                <p className="text-2xl font-semibold text-gray-900">0</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Pendientes</p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {clase?.estudiantes?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista de estudiantes y sus estados */}
                                    <div className="bg-white rounded-lg border border-gray-200">
                                        <div className="p-4 border-b border-gray-200">
                                            <h5 className="font-medium text-gray-900">Estado por estudiante</h5>
                                        </div>
                                        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                                            {clase?.estudiantes?.map((estudiante) => (
                                                <div key={estudiante.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                                                        <p className="text-sm text-gray-500">Sin entregar</p>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                                                        Pendiente
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Vista de alumno (el código existente para la entrega de tareas)
                        <div className="bg-gray-50 p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 relative">
                            <div className="sticky top-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6">Tu entrega</h4>
                                
                                <div className="space-y-6">
                                    {/* Estado de la entrega */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <Calendar className="h-5 w-5" />
                                            <span className="font-medium">Pendiente de entrega</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Fecha límite: {tareaSeleccionada.fechaEntrega 
                                                ? new Date(tareaSeleccionada.fechaEntrega).toLocaleDateString()
                                                : "Sin fecha límite"}
                                        </p>
                                    </div>

                                    {/* Formulario de entrega */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Comentarios (opcional)
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows="4"
                                                placeholder="Añade comentarios sobre tu entrega..."
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
                                                        Arrastra tu archivo aquí o haz clic para seleccionar
                                                    </span>
                                                    <input type="file" className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <FileText className="h-5 w-5" />
                                            Entregar tarea
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!clase) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600">Clase no encontrada</h2>
                <p className="text-gray-500 mt-2">La clase que buscas no existe o no tienes acceso a ella</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {renderDeletingOverlay()}
            {renderCreatingOverlay()}
            {/* Header de la clase */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {clase.nombre}
                            </h1>
                            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <BookOpen className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    Código: {clase.codigoClase}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            {role === 'profesor' && (
                                <button 
                                    onClick={() => setShowAnuncioModal(true)}
                                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Publicar anuncio
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Lista de estudiantes */}
                    <div className="lg:w-[280px] shrink-0 bg-white rounded-lg shadow p-6 h-fit sticky top-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Estudiantes</h2>
                            <div className="flex items-center gap-2">
                                {role === 'profesor' && (
                                    <button
                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Añadir estudiante"
                                        onClick={() => setShowSearchModal(true)}
                                    >
                                        <UserPlus className="h-5 w-5 text-gray-600" />
                                    </button>
                                )}
                                <button
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Ver lista completa"
                                    onClick={() => setShowAlumnosModal(true)}
                                >
                                    <MoreVertical className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        <div className="min-h-[200px] max-h-[280px] overflow-y-auto">
                            {clase.estudiantes && clase.estudiantes.length > 0 ? (
                                <ul className="space-y-3">
                                    {clase.estudiantes.slice(0, 4).map((estudiante) => (
                                        <li key={estudiante.id} className="text-gray-700 py-1.5 px-2 rounded-md hover:bg-gray-50">
                                            {estudiante.nombre}
                                        </li>
                                    ))}
                                    {clase.estudiantes.length > 4 && (
                                        <li className="text-center text-gray-500 py-2 border-t">
                                            <span className="block text-lg mb-1">•••</span>
                                            <button 
                                                onClick={() => setShowAlumnosModal(true)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Ver todos ({clase.estudiantes.length})
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay estudiantes inscritos.</p>
                            )}
                        </div>
                    </div>

                    {/* Contenido principal - Anuncios */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tablón de anuncios</h2>
                        <div className="min-h-[calc(100vh-300px)]">
                            {anuncios.length > 0 ? (
                                <div className="space-y-4">
                                    {anuncios.map((anuncio) =>
                                        anuncio.tipo === "tarea" ? (
                                            <div
                                                key={anuncio.id}
                                                className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg relative cursor-pointer hover:bg-blue-100 transition"
                                                onClick={() => handleOpenTarea(anuncio)}
                                            >
                                                {role === 'profesor' && (
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDeleteAnuncio(anuncio.id);
                                                        }}
                                                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                                        title="Eliminar tarea"
                                                    >
                                                        <X className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                )}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                                        <h3 className="font-semibold text-blue-700">{anuncio.titulo || "Tarea sin título"}</h3>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 inline mr-1" />
                                                    {anuncio.fechaEntrega 
                                                        ? new Date(anuncio.fechaEntrega).toLocaleString()
                                                        : "Sin fecha límite"}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Ver detalles →
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={anuncio.id} className="bg-gray-50 p-4 rounded-lg relative">
                                                {role === 'profesor' && (
                                                    <button
                                                        onClick={() => handleDeleteAnuncio(anuncio.id)}
                                                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                                        title="Eliminar anuncio"
                                                    >
                                                        <X className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                )}
                                                <p className="text-gray-600 mb-2">{anuncio.contenido}</p>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span className="font-medium text-gray-700">{anuncio.autor?.nombre || 'Usuario'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(anuncio.fechaCreacion).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                    <p>No hay anuncios publicados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para eliminar anuncio */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-red-500">
                            <AlertTriangle className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Eliminar anuncio?
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteAnuncio}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                disabled={isDeletingAnuncio}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {renderStudentSearchModal()}
            {renderAlumnosModal()}
            {renderAnuncioModal()}
            {renderTareaModal()}
        </div>
    );
};

export default ClaseDashboard;