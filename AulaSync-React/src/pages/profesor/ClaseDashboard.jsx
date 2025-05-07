import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X, MoreVertical, AlertTriangle, Calendar, FileText, CheckCircle, Paperclip, Clock } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchAlumnos } from '../../services/alumnos';
import { enviarInvitacion } from '../../services/invitaciones';
import { toast } from 'react-hot-toast';
import { crearAnuncio, obtenerAnuncios, eliminarAnuncio } from '../../services/anuncios';
import { API_BASE_URL } from '../../config/config';
import { useClase } from '../../contexts/ClaseContext';
import '../../styles/animations.css';
import '../../styles/modalAnimations.css';
import { getEntregasTarea } from '../../services/entregas';

const ClaseDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { claseData, setClaseData, anuncios, setAnuncios } = useClase();
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [anuncioToDelete, setAnuncioToDelete] = useState(null);
    const [isDeletingAnuncio, setIsDeletingAnuncio] = useState(false);
    const [isCreatingAnuncio, setIsCreatingAnuncio] = useState(false);
    const [showTareaModal, setShowTareaModal] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [archivoEntrega, setArchivoEntrega] = useState(null);
    const [comentarioEntrega, setComentarioEntrega] = useState('');
    const [isEntregando, setIsEntregando] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [filtroTareas, setFiltroTareas] = useState('todas'); // 'todas', 'pendientes', 'entregadas'
    const [loadingEntregas, setLoadingEntregas] = useState({});

    // Detectar el rol del usuario (ajusta si lo guardas en otro sitio)
    const role = localStorage.getItem('role'); // 'profesor' o 'alumno'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Realizar ambas llamadas en paralelo
                const [claseResponse, anunciosData] = await Promise.all([
                    getClaseById(id),
                    obtenerAnuncios(id)
                ]);
                
                setClaseData(claseResponse);
                setAnuncios(anunciosData || []);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error al cargar los datos de la clase');
                setAnuncios([]); // Asegurarnos de que siempre sea un array
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        
        return () => {
            setClaseData(null);
            setAnuncios([]);
        };
    }, [id, setClaseData, setAnuncios]);

    const fetchAnuncios = async () => {
        try {
            const anunciosData = await obtenerAnuncios(id);
            setAnuncios(anunciosData || []);
        } catch (error) {
            console.error('Error al obtener anuncios:', error);
            toast.error('Error al cargar los anuncios');
        }
    };

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
            await fetchAnuncios(); // Usar await aquí para asegurar que los anuncios se actualicen
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

    const handleOpenTarea = async (tarea) => {
        setTareaSeleccionada(tarea);
        setShowTareaModal(true);
        setArchivoEntrega(null);
        setComentarioEntrega('');
        setIsEntregando(false);
    
        // Añadir estado de carga para cada estudiante
        const estudianteIds = claseData?.estudiantes?.map(e => e.id) || [];
        setLoadingEntregas(
            estudianteIds.reduce((acc, id) => ({...acc, [id]: true}), {})
        );
    
        try {
            const entregas = await getEntregasTarea(tarea.id);
            if (Array.isArray(entregas)) {
                setTareaSeleccionada(prev => ({
                    ...prev,
                    entregas: entregas
                }));
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (error) {
            console.error('Error al cargar las entregas:', error);
            toast.error('Error al cargar las entregas');
            setTareaSeleccionada(prev => ({
                ...prev,
                entregas: []
            }));
        } finally {
            setLoadingEntregas({}); // Limpiar estados de carga
        }
    };

    // NUEVO: función para entregar tarea (solo alumno)
    const handleEntregaTarea = async () => {
        if (!tareaSeleccionada) return;
        if (tareaSeleccionada.entregada) {
            toast.error('Ya has entregado esta tarea');
            return;
        }
        setIsEntregando(true);
        try {
            const formData = new FormData();
            formData.append('comentario', comentarioEntrega);
            if (archivoEntrega) formData.append('archivo', archivoEntrega);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tareas/${tareaSeleccionada.id}/entregar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al entregar la tarea');
            }
            // Obtener datos de la entrega para actualizar el estado local
            const now = new Date();
            setTareaSeleccionada(prev => prev ? {
                ...prev,
                entregada: true,
                comentarioEntrega,
                archivoEntregaUrl: archivoEntrega ? null : prev.archivoEntregaUrl, // Si hay archivo, se actualizará al recargar
                fechaEntregada: now.toISOString()
            } : prev);
            toast.success('Tarea entregada correctamente');
        } catch (e) {
            toast.error(e.message || 'Error al entregar la tarea');
        } finally {
            setIsEntregando(false);
        }
    };

    // NUEVO: función para recortar texto con puntos suspensivos
    const recortarTexto = (texto, max = 80) => {
        if (!texto) return '';
        return texto.length > max ? texto.slice(0, max) + '...' : texto;
    };

    // Filtrar las tareas según el estado seleccionado
    const filtrarTareas = (tareas) => {
        switch (filtroTareas) {
            case 'pendientes':
                return tareas.filter(t => t.tipo === 'tarea' && !t.entregada);
            case 'entregadas':
                return tareas.filter(t => t.tipo === 'tarea' && t.entregada);
            default:
                return tareas;
        }
    };

    // Renderizar filtros antes del listado de anuncios
    const renderFiltros = () => (
        <div className="flex items-center gap-2 mb-4">
            <select
                value={filtroTareas}
                onChange={(e) => setFiltroTareas(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="todas">Todas las tareas</option>
                <option value="pendientes">Pendientes</option>
                <option value="entregadas">Entregadas</option>
            </select>
        </div>
    );

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowSearchModal(false);
            setShowAlumnosModal(false);
            setShowAnuncioModal(false);
            setIsClosing(false);
        }, 200);
    };

    const renderStudentSearchModal = () => {
        if (!showSearchModal) return null;

        return (
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
                ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-md modal-content
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Buscar Alumnos</h3>
                        <button 
                            onClick={handleCloseModal}
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
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
                ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-lg p-6 w-full max-w-lg relative modal-content
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        onClick={handleCloseModal}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <h3 className="text-xl font-semibold mb-4">Lista de Alumnos</h3>
                    {claseData.estudiantes && claseData.estudiantes.length > 0 ? (
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {claseData.estudiantes.map((estudiante) => (
                                <li key={estudiante.id} className="py-3 flex items-center gap-4">
                                    <img
                                        src={estudiante.fotoPerfilUrl ? `${API_BASE_URL}${estudiante.fotoPerfilUrl}` : '/default-avatar.png'}
                                        alt={`Foto de ${estudiante.nombre}`}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                    <div>
                                        <div className="font-medium">{estudiante.nombre}</div>
                                        <div className="text-sm text-gray-500">{estudiante.email}</div>
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
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
                ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-xl p-6 w-full max-w-2xl mx-4 modal-content
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    {showTipoSelector ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Crear nueva publicación</h3>
                                <button 
                                    onClick={handleCloseModal}
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
                                        onClick={handleCloseModal}
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
                                            onClick={handleCloseModal}
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
                                            onClick={handleCloseModal}
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
                                            onClick={handleCloseModal}
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

        // NUEVO: datos de la entrega del alumno (si existe)
        const archivoEntregaUrl = tareaSeleccionada.archivoEntregaUrl
            ? `${API_BASE_URL}${tareaSeleccionada.archivoEntregaUrl}`
            : null;
        const comentarioEntregaAlumno = tareaSeleccionada.comentarioEntrega;
        const fechaEntregada = tareaSeleccionada.fechaEntregada;

        // NUEVO: detectar si la tarea está entregada
        const estaEntregada = !!tareaSeleccionada.entregada;

        return (
            <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-2xl w-full max-w-6xl mx-4 flex flex-col md:flex-row relative shadow-2xl modal-content max-h-[90vh] overflow-hidden ${isClosing ? 'modal-content-closing' : ''}`}>
                    {/* Botón de cerrar dentro del modal, arriba a la derecha */}
                    <button
                        onClick={() => setShowTareaModal(false)}
                        className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all"
                        style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Panel izquierdo - Detalles de la tarea */}
                    <div className="p-8 flex-1 modal-content-left overflow-y-auto">
                        <div className="modal-item-stagger space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{tareaSeleccionada.titulo}</h3>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Publicado por {tareaSeleccionada.autor?.nombre} · {new Date(tareaSeleccionada.fechaCreacion).toLocaleString()}
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
                                        {tareaSeleccionada?.fechaEntrega
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
                                <div className="bg-gray-50 rounded-xl p-6 text-gray-700 whitespace-pre-line min-h-[200px] border border-gray-100">
                                    {tareaSeleccionada.contenido || tareaSeleccionada.descripcion}
                                </div>
                            </div>

                            {tareaSeleccionada.archivoUrl && (
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

                    {/* Panel derecho - Vista de profesor (entregas) o alumno (subir tarea) */}
                    {role === 'profesor' ? (
                        <div className="bg-gradient-to-b from-gray-50 to-white p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
                            <div className="modal-item-stagger">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-lg font-semibold text-gray-900">Entregas de la tarea</h4>
                                    <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded">
                                        {tareaSeleccionada.entregas?.length || 0} entregas
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Entregadas</p>
                                                <p className="text-2xl font-semibold text-gray-900">{tareaSeleccionada.entregas?.length || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Pendientes</p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {claseData?.estudiantes?.length
                                                        ? claseData.estudiantes.length - (tareaSeleccionada.entregas?.length || 0)
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
                                                const entregas = tareaSeleccionada.entregas || [];
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
                                                    <div key={estudiante.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                                                        </div>
                                                        {entrega ? (
                                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1">
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Entregado
                                                            </span>
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
                        </div>
                    ) : (
                        // ALUMNO: formulario y resumen de entrega
                        <div className="bg-gradient-to-b from-gray-50 to-white p-8 w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 modal-content-right overflow-y-auto">
                            <div className="modal-item-stagger">
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
                                                    {comentarioEntregaAlumno ? comentarioEntregaAlumno : <span className="italic text-gray-400">Sin comentario</span>}
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                    <span className="font-medium text-gray-700">Fecha de entrega:</span>
                                                    <span className="text-gray-700">
                                                        {fechaEntregada
                                                            ? new Date(fechaEntregada).toLocaleString()
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
                                                disabled={isEntregando || estaEntregada}
                                            >
                                                <FileText className="h-5 w-5" />
                                                {isEntregando ? "Entregando..." : (estaEntregada ? "Ya entregada" : "Entregar tarea")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderEstadoEntrega = (estudiante) => {
        if (loadingEntregas[estudiante.id]) {
            return (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    <span>Comprobando...</span>
                </span>
            );
        }
        
        const entrega = tareaSeleccionada.entregas?.find(e => e.alumno.id === estudiante.id);
        
        return entrega ? (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Entregado
            </span>
        ) : (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Pendiente
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (!claseData) {
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
            <div className="bg-white border-b opacity-0 animate-scaleIn">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {claseData.nombre}
                            </h1>
                            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <BookOpen className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    Código: {claseData.codigoClase}
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
                <div className="flex flex-col lg:flex-row gap-6 stagger-animation">
                    {/* Lista de estudiantes */}
                    <div className="lg:w-[280px] shrink-0 bg-white rounded-lg shadow p-6 h-fit sticky top-8 opacity-0 animate-slideRight"
                         style={{ animationDelay: '200ms' }}>
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
                            {claseData.estudiantes && claseData.estudiantes.length > 0 ? (
                                <ul className="space-y-3">
                                    {claseData.estudiantes.slice(0, 4).map((estudiante) => (
                                        <li key={estudiante.id} className="text-gray-700 py-1.5 px-2 rounded-md hover:bg-gray-50 flex items-center gap-2">
                                            <img
                                                src={estudiante.fotoPerfilUrl ? `${API_BASE_URL}${estudiante.fotoPerfilUrl}` : '/default-avatar.png'}
                                                alt={`Foto de ${estudiante.nombre}`}
                                                className="h-7 w-7 rounded-full object-cover border border-gray-200"
                                                onError={e => { e.target.src = '/default-avatar.png'; }}
                                            />
                                            <span>{estudiante.nombre}</span>
                                        </li>
                                    ))}
                                    {claseData.estudiantes.length > 4 && (
                                        <li className="text-center text-gray-500 py-2 border-t">
                                            <span className="block text-lg mb-1">•••</span>
                                            <div 
                                                className="text-blue-600 text-sm"
                                            >
                                                Alumnos totales ({claseData.estudiantes.length})
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No hay estudiantes inscritos.</p>
                            )}
                        </div>
                    </div>

                    {/* Contenido principal - Anuncios */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6 opacity-0 animate-fadeIn"
                         style={{ animationDelay: '400ms' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Tablón de anuncios</h2>
                            {renderFiltros()}
                        </div>
                        <div className="min-h-[calc(100vh-300px)]">
                            {anuncios.length > 0 ? (
                                <div className="space-y-4">
                                    {filtrarTareas(anuncios).map((anuncio, index) =>
                                        anuncio.tipo === "tarea" ? (
                                            <div
                                                key={anuncio.id}
                                                className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg relative cursor-pointer hover:bg-blue-100 transition opacity-0 animate-slideRight"
                                                style={{ animationDelay: `${600 + (index * 100)}ms` }}
                                                onClick={() => handleOpenTarea(anuncio)}
                                            >
                                                {/* Botón eliminar SIEMPRE arriba a la derecha */}
                                                {role === 'profesor' && (
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDeleteAnuncio(anuncio.id);
                                                        }}
                                                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 transition-colors z-10"
                                                        title="Eliminar tarea"
                                                    >
                                                        <X className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                )}
                                                {/* Entregas pendientes al lado izquierdo de la X */}
                                                {role === 'profesor' && (
                                                    <div className="absolute top-4 right-16 flex items-center z-10">
                                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1 w-max">
                                                            Entregas pendientes:&nbsp;
                                                            {claseData?.estudiantes
                                                                ? claseData.estudiantes.length - (anuncio.entregas?.length || 0)
                                                                : 0}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Título y resto del contenido */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-semibold text-blue-700">{anuncio.titulo || "Tarea sin título"}</h3>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 inline mr-1" />
                                                    {anuncio.fechaEntrega 
                                                        ? new Date(anuncio.fechaEntrega).toLocaleString('es-ES', {
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
                                                        {anuncio.clase?.nombre || claseData?.nombre || 'Sin clase'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {anuncio.archivoUrl && (
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
                                            </div>
                                        ) : (
                                            <div key={anuncio.id} className="bg-gray-50 p-4 rounded-lg relative opacity-0 animate-slideRight"
                                                 style={{ animationDelay: `${600 + (index * 100)}ms` }}>
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