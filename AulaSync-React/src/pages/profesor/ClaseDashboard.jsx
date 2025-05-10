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
import TareaModal from '../../components/clase/TareaModal';
import EntregaModal from '../../components/clase/EntregaModal';
import AnuncioModal from '../../components/clase/AnuncioModal';

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
    const [filtroTareas, setFiltroTareas] = useState('todas'); // 'todas', 'pendientes', 'finalizadas'
    const [loadingEntregas, setLoadingEntregas] = useState({});
    const [showEntregaModal, setShowEntregaModal] = useState(false);
    const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
    const [notaEdicion, setNotaEdicion] = useState('');
    const [comentarioCorreccionEdicion, setComentarioCorreccionEdicion] = useState('');
    const [isCalificando, setIsCalificando] = useState(false);

    // Detectar el rol del usuario (ajusta si lo guardas en otro sitio)
    const role = localStorage.getItem('role'); // 'profesor' o 'alumno'

    // NUEVO: obtener el id del alumno autenticado (ajusta según tu auth)
    const alumnoId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Realizar ambas llamadas en paralelo
                const [claseResponse, anunciosData] = await Promise.all([
                    getClaseById(id),
                    obtenerAnuncios(id)
                ]);
                
                // NUEVO: Para cada tarea, obtener entregas
                let anunciosConEntregas = anunciosData || [];
                if (claseResponse && claseResponse.estudiantes && anunciosConEntregas.length > 0) {
                    const tareas = anunciosConEntregas.filter(a => a.tipo === 'tarea');
                    const entregasPorTarea = await Promise.all(
                        tareas.map(tarea => getEntregasTarea(tarea.id).catch(() => []))
                    );
                    anunciosConEntregas = anunciosConEntregas.map(anuncio => {
                        if (anuncio.tipo === 'tarea') {
                            const idx = tareas.findIndex(t => t.id === anuncio.id);
                            const entregas = entregasPorTarea[idx] || [];
                            return {
                                ...anuncio,
                                entregas: entregas,
                                entregasRealizadas: entregas.length,
                                entregasPendientes: claseResponse.estudiantes.length - entregas.length
                            };
                        }
                        return anuncio;
                    });
                }
                setClaseData(claseResponse);
                setAnuncios(anunciosConEntregas);
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
        // Solo abrir el modal si el id es válido
        if (!anuncioId) {
            toast.error('No se puede eliminar: ID de anuncio no válido');
            return;
        }
        setAnuncioToDelete(anuncioId);
        setShowDeleteModal(true);
    };

    const confirmDeleteAnuncio = async () => {
        if (!anuncioToDelete) {
            toast.error('No se puede eliminar: ID de anuncio no válido');
            setShowDeleteModal(false);
            return;
        }
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
                // Asegurarse de que cada entrega tenga su información de alumno completa
                const entregasConAlumno = entregas.map(entrega => ({
                    ...entrega,
                    alumnoId: entrega.alumno?.id // Guardar el ID del alumno explícitamente
                }));
    
                setTareaSeleccionada(prev => ({
                    ...prev,
                    entregas: entregasConAlumno,
                    entregasRealizadas: entregasConAlumno.length,
                    entregasPendientes: claseData?.estudiantes?.length - entregasConAlumno.length || 0
                }));
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (error) {
            console.error('Error al cargar las entregas:', error);
            toast.error('Error al cargar las entregas');
            setTareaSeleccionada(prev => ({
                ...prev,
                entregas: [],
                entregasRealizadas: 0,
                entregasPendientes: claseData?.estudiantes?.length || 0
            }));
        } finally {
            setLoadingEntregas({}); // Limpiar estados de carga
        }
    };

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
        );
    };

    const handleOpenEntregaModal = (entrega) => {
        // Asegúrate de inicializar con los datos actuales del backend
        setEntregaSeleccionada(entrega);
        setNotaEdicion(
            entrega.nota !== undefined && entrega.nota !== null && entrega.nota !== ''
                ? entrega.nota
                : ''
        );
        setComentarioCorreccionEdicion(entrega.comentarioCorreccion || '');
        setShowEntregaModal(true);
    };

    const handleCloseEntregaModal = () => {
        setShowEntregaModal(false);
        setEntregaSeleccionada(null);
    };

    const handleCalificarEntrega = async () => {
        if (!entregaSeleccionada || !entregaSeleccionada.id) {
            toast.error('No se puede calificar esta entrega');
            return;
        }
        setIsCalificando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/entregas/${entregaSeleccionada.id}/calificar`, {
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
            // Actualizar localmente la entrega seleccionada y su estado
            setEntregaSeleccionada(prev =>
                prev
                    ? { ...prev, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion, calificado: true }
                    : prev
            );
            // Actualizar la lista de entregas en tareaSeleccionada
            setTareaSeleccionada(prev =>
                prev && prev.entregas
                    ? {
                        ...prev,
                        entregas: prev.entregas.map(e =>
                            e.id === entregaSeleccionada.id
                                ? { ...e, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion, calificado: true }
                                : e
                        )
                    }
                    : prev
            );
            toast.success('Entrega calificada correctamente');
        } catch (e) {
            toast.error('Error al calificar la entrega');
        } finally {
            setIsCalificando(false);
        }
    };

    // NUEVO: Función para obtener la entrega del alumno actual para la tarea seleccionada
    const getEntregaAlumnoActual = () => {
        if (!tareaSeleccionada || !Array.isArray(tareaSeleccionada.entregas) || !alumnoId) return null;
        return tareaSeleccionada.entregas.find(e => 
            e.alumno && (String(e.alumno.id) === String(alumnoId) || String(e.alumno) === String(alumnoId))
        );
    };

    // NUEVO: función para recortar texto con puntos suspensivos
    const recortarTexto = (texto, max = 80) => {
        if (!texto) return '';
        return texto.length > max ? texto.slice(0, max) + '...' : texto;
    };

    // Filtrar las tareas según el estado seleccionado
    const filtrarTareas = (tareas) => {
        if (!Array.isArray(tareas)) return [];
        switch (filtroTareas) {
            case 'pendientes':
                // Tareas donde alguna entrega está sin calificar o faltan entregas
                return tareas.filter(t =>
                    t.tipo === 'tarea' &&
                    Array.isArray(t.entregas) &&
                    (
                        t.entregas.length < (claseData?.estudiantes?.length || 0) ||
                        t.entregas.some(e => e.nota === undefined || e.nota === null || e.nota === '')
                    )
                );
            case 'finalizadas':
                // Tareas donde todas las entregas posibles están entregadas y todas calificadas
                return tareas.filter(t =>
                    t.tipo === 'tarea' &&
                    Array.isArray(t.entregas) &&
                    t.entregas.length === (claseData?.estudiantes?.length || 0) &&
                    t.entregas.every(e => e.nota !== undefined && e.nota !== null && e.nota !== '')
                );
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
                <option value="pendientes">Pendientes de calificar</option>
                <option value="finalizadas">Finalizadas</option>
            </select>
        </div>
    );

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
                                                {/* NUEVO: Entregas realizadas y pendientes */}
                                                {role === 'profesor' && (
                                                    <div className="absolute top-4 right-16 flex items-center z-10 gap-2">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1 w-max">
                                                            Entregadas:&nbsp;
                                                            {anuncio.entregasRealizadas ?? 0}
                                                        </span>
                                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 flex items-center gap-1 w-max">
                                                            Pendientes:&nbsp;
                                                            {anuncio.entregasPendientes ?? (claseData?.estudiantes?.length || 0)}
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
            
            <AnuncioModal
                showModal={showAnuncioModal}
                showTipoSelector={showTipoSelector}
                anuncioData={anuncioData}
                onClose={handleCloseModal}
                onCreateAnuncio={handleCreateAnuncio}
                setAnuncioData={setAnuncioData}
                setShowTipoSelector={setShowTipoSelector}
                isCreatingAnuncio={isCreatingAnuncio}
                isClosing={isClosing}
            />

            <TareaModal
                showModal={showTareaModal}
                tarea={tareaSeleccionada}
                role={role}
                claseData={claseData}
                onClose={() => setShowTareaModal(false)}
                comentarioEntrega={comentarioEntrega}
                setComentarioEntrega={setComentarioEntrega}
                archivoEntrega={archivoEntrega}
                setArchivoEntrega={setArchivoEntrega}
                isEntregando={isEntregando}
                loadingEntregas={loadingEntregas}
                onOpenEntrega={handleOpenEntregaModal}
                entregaAlumno={role === 'alumno' ? getEntregaAlumnoActual() : null}
            />

            <EntregaModal
                showModal={showEntregaModal}
                entrega={entregaSeleccionada}
                notaEdicion={notaEdicion}
                setNotaEdicion={setNotaEdicion}
                comentarioCorreccion={comentarioCorreccionEdicion}
                setComentarioCorreccion={setComentarioCorreccionEdicion}
                onClose={handleCloseEntregaModal}
                onCalificar={handleCalificarEntrega}
                isCalificando={isCalificando}
            />
        </div>
    );
};

export default ClaseDashboard;