import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X, MoreVertical, AlertTriangle, Calendar, FileText, CheckCircle, Paperclip, Clock, AlertCircle } from 'lucide-react';
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
import { TareaModal, EntregaModal, AnuncioModal } from '../../components/clase';
import { GlobalContext } from '../../App';

/**
 * Panel de control de una clase para el profesor.
 * Permite gestionar estudiantes, publicar anuncios y tareas, calificar entregas
 * y ver el estado de las actividades de la clase.
 * 
 * @component
 * @returns {JSX.Element} Panel de gestión y control de una clase para el profesor
 */
const ClaseDashboard = () => {
    const { userData } = useContext(GlobalContext);
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
    const alumnoId = userData?.user?.id || localStorage.getItem('userId');

    console.log('[ClaseDashboard] alumnoId:', alumnoId);
    console.log('[ClaseDashboard] role:', role);

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
                            
                            // Si hay entregas, actualizar el estado de entregada
                            const entregaAlumno = entregas.find(e => 
                                String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
                            );
                            
                            return {
                                ...anuncio,
                                entregas: entregas,
                                entregasRealizadas: entregas.length,
                                entregasPendientes: claseResponse.estudiantes.length - entregas.length,
                                entregada: !!entregaAlumno,
                                alumnoId: alumnoId // Añadir el alumnoId aquí
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

        if (alumnoId) { // Solo cargar si tenemos alumnoId
            fetchData();
        }
        
        return () => {
            setClaseData(null);
            setAnuncios([]);
        };
    }, [id, setClaseData, setAnuncios, alumnoId]);

    // NUEVO: Resetear selector al abrir el modal de anuncio
    useEffect(() => {
        if (showAnuncioModal) {
            setShowTipoSelector(true);
            setAnuncioData({
                contenido: '',
                tipo: '',
                titulo: '',
                fechaEntrega: '',
                archivo: null,
                descripcion: ''
            });
        }
    }, [showAnuncioModal]);

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

            // Crear anuncio/tarea en backend
            const nuevoAnuncio = await crearAnuncio(dataToSend);

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

            // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
            setAnuncios(prev => [
                // Si el backend devuelve la tarea/anuncio completo, úsalo. Si no, puedes hacer una llamada a la API o construir el objeto aquí.
                { ...nuevoAnuncio, entregas: [], entregasRealizadas: 0, entregasPendientes: claseData?.estudiantes?.length || 0, tipo: anuncioData.tipo },
                ...prev
            ]);
            // Si quieres máxima consistencia, puedes seguir recargando desde la API:
            // await fetchAnuncios();
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
                const entregasConAlumno = entregas.map(entrega => ({
                    ...entrega,
                    alumno: entrega.alumno,
                    alumnoId: entrega.alumno?.id // Guardar el ID del alumno explícitamente
                }));
    
                // Actualizar la tarea con su estado de entrega
                setTareaSeleccionada(prev => ({
                    ...prev,
                    entregas: entregasConAlumno,
                    entregasRealizadas: entregasConAlumno.length,
                    entregasPendientes: claseData?.estudiantes?.length - entregasConAlumno.length || 0,
                    entregada: entregasConAlumno.some(e => 
                        String(e.alumno?.id) === String(alumnoId) || 
                        String(e.alumno) === String(alumnoId)
                    )
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

    // Elimina la animación de aparición del modal de búsqueda de alumnos (solo para el modal, no para toda la página)
    const renderStudentSearchModal = () => {
        if (!showSearchModal) return null;

        return (
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
                ${isClosing ? 'modal-closing' : ''}`}>
                <div className={`bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md modal-content overflow-hidden
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    {/* Header moderno */}
                    <div className="flex items-center gap-3 px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-t-2xl">
                        <Search className="h-7 w-7 text-blue-500 animate-fadeIn" />
                        <span className="text-xl font-bold text-blue-900 animate-fadeIn" style={{ animationDelay: '80ms' }}>
                            Buscar Alumnos
                        </span>
                        <button 
                            onClick={handleCloseModal}
                            className="ml-auto text-gray-400 hover:text-blue-600 rounded-full p-2 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    {/* Input de búsqueda */}
                    <div className="px-8 pt-8 pb-4 bg-white">
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Buscar por nombre o email..."
                                className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 bg-blue-50/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg text-gray-900 placeholder-gray-400 shadow-sm transition-all outline-none group-hover:border-blue-300"
                                autoFocus
                            />
                            <Search className="h-5 w-5 text-blue-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    {/* Resultados */}
                    <div className="px-8 pb-8">
                        <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                            {isSearching ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : searchTerm && searchResults.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <span>No se encontraron resultados</span>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {searchResults.map((alumno, idx) => (
                                        <li 
                                            key={alumno.id}
                                            className={`flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-xl border border-blue-100 shadow-sm hover:shadow-lg cursor-pointer transition-all group`}
                                            onClick={() => handleInvitarAlumno(alumno)}
                                        >
                                            <div className="flex-shrink-0 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center group-hover:bg-blue-200 transition-all">
                                                <Users className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-blue-900 truncate">{alumno.nombre}</div>
                                                <div className="text-sm text-gray-500 truncate">{alumno.email}</div>
                                            </div>
                                            {invitingId === alumno.id && (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
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
                <div className={`bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg relative modal-content
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-500" />
                            Lista de Alumnos
                        </h3>
                        <button
                            className="text-gray-400 hover:text-blue-600 rounded-full p-2 transition-colors"
                            onClick={handleCloseModal}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 max-h-[420px] overflow-y-auto">
                        {claseData.estudiantes && claseData.estudiantes.length > 0 ? (
                            <ul>
                                {claseData.estudiantes.map((estudiante) => (
                                    <li
                                        key={estudiante.id}
                                        className="flex items-center gap-8 py-8 group border-b border-blue-50 last:border-b-0" // Más separación y mayor gap
                                    >
                                        <img
                                            src={estudiante.fotoPerfilUrl ? `${API_BASE_URL}${estudiante.fotoPerfilUrl}` : '/default-avatar.png'}
                                            alt={`Foto de ${estudiante.nombre}`}
                                            className="h-14 w-14 rounded-full object-cover border-2 border-blue-100 shadow group-hover:scale-105 transition-transform"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-lg text-gray-900 truncate">{estudiante.nombre}</div>
                                            <div className="text-base text-gray-500 truncate">{estudiante.email}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Users className="h-12 w-12 mb-3" />
                                <p className="text-gray-500">No hay estudiantes inscritos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDeletingOverlay = () => {
        if (!isDeletingAnuncio) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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
            // NUEVO: Actualizar la entrega en el array de anuncios (tareas)
            setAnuncios(prevAnuncios =>
                prevAnuncios.map(anuncio =>
                    anuncio.id === tareaSeleccionada?.id
                        ? {
                            ...anuncio,
                            entregas: Array.isArray(anuncio.entregas)
                                ? anuncio.entregas.map(e =>
                                    e.id === entregaSeleccionada.id
                                        ? { ...e, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion, calificado: true }
                                        : e
                                )
                                : anuncio.entregas
                        }
                        : anuncio
                )
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

    // NUEVO: función para calcular tiempo transcurrido
    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} años`;
        
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} meses`;
        
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} días`;
        
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} horas`;
        
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutos`;
        
        return `${Math.floor(seconds)} segundos`;
    };

    // Modificar la función getEstadoTarea
    const getEstadoTarea = (tarea) => {
        if (tarea.tipo !== 'tarea') return null;
        if (role !== 'alumno') return null; // Solo mostrar estados para alumnos

        // Buscar la entrega del alumno actual
        const entrega = tarea.entregas?.find(e => 
            String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
        );

        // Si hay entrega, está entregada sin importar la fecha
        if (entrega) {
            return 'entregada';
        }

        // Si no hay entrega y la fecha ha pasado, está expirada
        if (tarea.fechaEntrega) {
            const fechaEntrega = new Date(tarea.fechaEntrega);
            const ahora = new Date();
            if (fechaEntrega < ahora) {
                return 'expirada';
            }
        }

        // Si no cumple ninguna de las anteriores, está pendiente
        return 'pendiente';
    };

    const getEstadoTareaClase = (anuncio) => {
        if (anuncio.tipo !== 'tarea') return null;

        const totalEstudiantes = claseData?.estudiantes?.length || 0;
        const totalEntregas = anuncio.entregas?.length || 0;
        const entregasCalificadas = anuncio.entregas?.filter(e => 
            e.nota !== undefined && e.nota !== null && e.nota !== ''
        ).length || 0;

        if (totalEntregas === totalEstudiantes && entregasCalificadas === totalEstudiantes) {
            return 'finalizada';
        }

        if (totalEntregas > 0) {
            return 'entregada';
        }

        if (anuncio.fechaEntrega && new Date(anuncio.fechaEntrega) < new Date()) {
            return 'expirada';
        }

        return 'pendiente';
    };

    // NUEVO: función para saber si está finalizada (entregada y calificada)
    const isFinalizada = (anuncio) => {
        // Log para depuración
        console.log('[ClaseDashboard][isFinalizada] anuncio:', anuncio);
        return anuncio.entregada && anuncio.nota !== undefined && anuncio.nota !== null && anuncio.nota !== '';
    };

    // NUEVO: filtrar tareas según el filtro seleccionado y el rol
    const filtrarTareas = (tareas) => {
        if (!Array.isArray(tareas)) return [];
        if (role === 'alumno') {
            switch (filtroTareas) {
                case 'pendientes':
                    return tareas.filter(t => getEstadoTareaClase(t) === 'pendiente');
                case 'entregadas':
                    // Mostrar tanto entregadas como calificadas
                    return tareas.filter(t => {
                        const estado = getEstadoTareaClase(t);
                        return estado === 'entregada' || estado === 'calificada';
                    });
                case 'expiradas':
                    return tareas.filter(t => getEstadoTareaClase(t) === 'expirada');
                case 'finalizadas':
                    return tareas.filter(t => getEstadoTareaClase(t) === 'finalizada');
                default:
                    return tareas;
            }
        } else {
            // Profesor (igual que antes)
            switch (filtroTareas) {
                case 'pendientes':
                    return tareas.filter(t =>
                        t.tipo === 'tarea' &&
                        Array.isArray(t.entregas) &&
                        (
                            t.entregas.length < (claseData?.estudiantes?.length || 0) ||
                            t.entregas.some(e => e.nota === undefined || e.nota === null || e.nota === '')
                        )
                    );
                case 'finalizadas':
                    return tareas.filter(t =>
                        t.tipo === 'tarea' &&
                        Array.isArray(t.entregas) &&
                        t.entregas.length === (claseData?.estudiantes?.length || 0) &&
                        t.entregas.every(e => e.nota !== undefined && e.nota !== null && e.nota !== '')
                    );
                default:
                    return tareas;
            }
        }
    };

    // Renderizar filtros antes del listado de anuncios
    const renderFiltros = () => (
        <div className="flex items-center gap-2 mb-4">
            <div className="relative">
                <select
                    value={filtroTareas}
                    onChange={(e) => setFiltroTareas(e.target.value)}
                    className="appearance-none bg-white border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-2 pr-10 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all font-medium hover:border-blue-400 cursor-pointer"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='16' height='16' fill='none' stroke='%233b82f6' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.25em 1.25em"
                    }}
                >
                    {role === 'alumno' ? (
                        <>
                            <option value="todas" className="bg-white text-blue-700 font-semibold">Todas</option>
                            <option value="pendientes" className="bg-blue-50 text-blue-700 font-semibold">Pendientes</option>
                            <option value="entregadas" className="bg-emerald-50 text-emerald-700 font-semibold">Entregadas</option>
                            <option value="expiradas" className="bg-red-50 text-red-700 font-semibold">Expiradas</option>
                            <option value="finalizadas" className="bg-indigo-50 text-indigo-700 font-semibold">Finalizadas</option>
                        </>
                    ) : (
                        <>
                            <option value="todas" className="bg-white text-blue-700 font-semibold">Todas las tareas</option>
                            <option value="pendientes" className="bg-amber-50 text-amber-700 font-semibold">Pendientes de calificar</option>
                            <option value="finalizadas" className="bg-emerald-50 text-emerald-700 font-semibold">Finalizadas</option>
                        </>
                    )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronRight className="h-4 w-4 text-blue-400 rotate-90" />
                </div>
            </div>
        </div>
    );

    const handleTareaEntregada = (tareaId, datosEntrega) => {
        setAnuncios(prevAnuncios =>
            prevAnuncios.map(anuncio =>
                anuncio.id === tareaId
                    ? {
                        ...anuncio,
                        entregada: true,
                        archivoEntregaUrl: datosEntrega.archivoEntregaUrl,
                        comentarioEntrega: datosEntrega.comentarioEntrega,
                        fechaEntregada: datosEntrega.fechaEntregada,
                        nota: datosEntrega.nota ?? anuncio.nota,
                        comentarioCorreccion: datosEntrega.comentarioCorreccion ?? anuncio.comentarioCorreccion,
                        // Si hay entregas, actualiza la entrega del alumno actual en el array de entregas
                        entregas: Array.isArray(anuncio.entregas)
                            ? anuncio.entregas.some(e =>
                                String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
                              )
                                ? anuncio.entregas.map(e =>
                                    String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
                                        ? {
                                            ...e,
                                            archivoUrl: datosEntrega.archivoEntregaUrl,
                                            comentario: datosEntrega.comentarioEntrega,
                                            fechaEntrega: datosEntrega.fechaEntregada,
                                            nota: datosEntrega.nota ?? e.nota,
                                            comentarioCorreccion: datosEntrega.comentarioCorreccion ?? e.comentarioCorreccion
                                        }
                                        : e
                                  )
                                : [
                                    ...(anuncio.entregas || []),
                                    {
                                        alumno: { id: alumnoId },
                                        archivoUrl: datosEntrega.archivoEntregaUrl,
                                        comentario: datosEntrega.comentarioEntrega,
                                        fechaEntrega: datosEntrega.fechaEntregada,
                                        nota: datosEntrega.nota ?? '',
                                        comentarioCorreccion: datosEntrega.comentarioCorreccion ?? ''
                                    }
                                  ]
                            : [{
                                alumno: { id: alumnoId },
                                archivoUrl: datosEntrega.archivoEntregaUrl,
                                comentario: datosEntrega.comentarioEntrega,
                                fechaEntrega: datosEntrega.fechaEntregada,
                                nota: datosEntrega.nota ?? '',
                                comentarioCorreccion: datosEntrega.comentarioCorreccion ?? ''
                            }]
                    }
                    : anuncio
            )
        );
        // También actualizar la tarea seleccionada si es la misma
        if (tareaSeleccionada?.id === tareaId) {
            setTareaSeleccionada(prev => ({
                ...prev,
                entregada: true,
                archivoEntregaUrl: datosEntrega.archivoEntregaUrl,
                comentarioEntrega: datosEntrega.comentarioEntrega,
                fechaEntregada: datosEntrega.fechaEntregada,
                nota: datosEntrega.nota ?? prev.nota,
                comentarioCorreccion: datosEntrega.comentarioCorreccion ?? prev.comentarioCorreccion,
                entregas: Array.isArray(prev.entregas)
                    ? prev.entregas.some(e =>
                        String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
                      )
                        ? prev.entregas.map(e =>
                            String(e.alumno?.id ?? e.alumnoId ?? e.alumno) === String(alumnoId)
                                ? {
                                    ...e,
                                    archivoUrl: datosEntrega.archivoEntregaUrl,
                                    comentario: datosEntrega.comentarioEntrega,
                                    fechaEntrega: datosEntrega.fechaEntregada,
                                    nota: datosEntrega.nota ?? e.nota,
                                    comentarioCorreccion: datosEntrega.comentarioCorreccion ?? e.comentarioCorreccion
                                }
                                : e
                          )
                        : [
                            ...(prev.entregas || []),
                            {
                                alumno: { id: alumnoId },
                                archivoUrl: datosEntrega.archivoEntregaUrl,
                                comentario: datosEntrega.comentarioEntrega,
                                fechaEntrega: datosEntrega.fechaEntregada,
                                nota: datosEntrega.nota ?? '',
                                comentarioCorreccion: datosEntrega.comentarioCorreccion ?? ''
                            }
                          ]
                    : [{
                        alumno: { id: alumnoId },
                        archivoUrl: datosEntrega.archivoEntregaUrl,
                        comentario: datosEntrega.comentarioEntrega,
                        fechaEntrega: datosEntrega.fechaEntregada,
                        nota: datosEntrega.nota ?? '',
                        comentarioCorreccion: datosEntrega.comentarioCorreccion ?? ''
                    }]
            }));
        }
    };

    // Mueve estos hooks fuera del if (isLoading)
    const [step, setStep] = useState(0);
    const steps = [
        { label: "Cargando datos de la clase...", key: "clase" },
        { label: "Obteniendo lista de estudiantes...", key: "alumnos" },
        { label: "Cargando tareas y anuncios...", key: "tareas" }
    ];
    const intervalRef = useRef();

    useEffect(() => {
        if (!isLoading) return;
        intervalRef.current = setInterval(() => {
            setStep(prev => (prev < steps.length ? prev + 1 : prev));
        }, 1000);
        return () => clearInterval(intervalRef.current);
    // Solo depende de isLoading para evitar doble efecto
    }, [isLoading]);

    const [dotCount, setDotCount] = useState(0);
    useEffect(() => {
        if (!isLoading) return;
        const dotInterval = setInterval(() => {
            setDotCount(prev => (prev + 1) % 4);
        }, 400);
        return () => clearInterval(dotInterval);
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div
                    className={`
                        bg-white rounded-2xl shadow-2xl flex flex-col items-center border border-blue-100 animate-fade-in-up
                        sm:px-12 sm:py-10
                        px-5 py-6
                    `}
                    style={{
                        maxWidth: window.innerWidth < 640 ? 320 : 420,
                        minWidth: window.innerWidth < 640 ? 0 : 300,
                        width: window.innerWidth < 640 ? '95vw' : 'auto'
                    }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <BookOpen className={`h-12 w-12 text-blue-500 ${window.innerWidth < 640 ? "h-8 w-8" : ""}`} />
                        <span className={`text-2xl font-bold text-blue-900 ${window.innerWidth < 640 ? "text-lg" : ""}`}>AulaSync</span>
                    </div>
                    <div className={`flex flex-col gap-4 min-w-[300px] ${window.innerWidth < 640 ? "min-w-0" : ""} ${window.innerWidth < 640 ? "items-center text-center w-full" : ""}`}>
                        {steps.map((s, idx) => (
                            <div className={`flex items-center gap-3 ${window.innerWidth < 640 ? "justify-center w-full" : ""}`} key={s.key}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <CheckCircle className={`h-4 w-4 text-green-500 animate-pop ${window.innerWidth < 640 ? "h-3 w-3" : ""}`} />
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                )}
                                <span className={`text-gray-600 ${step > idx ? "line-through text-green-700" : ""} ${window.innerWidth < 640 ? "text-sm" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className={`mt-8 text-blue-700 text-sm flex items-center gap-2 ${window.innerWidth < 640 ? "mt-4 text-xs justify-center w-full text-center" : ""}`}>
                        Preparando clase
                        <span className={`inline-block w-6 text-blue-700 font-bold ${window.innerWidth < 640 ? "w-4" : ""}`} style={{ letterSpacing: 1 }}>
                            {".".repeat(dotCount + 1)}
                        </span>
                    </div>
                    <style>{`
                        @keyframes pop {
                            0% { transform: scale(0.7); opacity: 0.5;}
                            60% { transform: scale(1.2);}
                            100% { transform: scale(1); opacity: 1;}
                        }
                        .animate-pop { animation: pop 0.4s; }
                    `}</style>
                </div>
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
        <div className={`min-h-screen bg-gray-50 ${window.innerWidth < 640 ? 'px-1' : ''}`}>
            {renderDeletingOverlay()}
            {renderCreatingOverlay()}
            {/* Header de la clase */}
            <div className={`bg-white border-b shadow-sm opacity-0 animate-fadeIn ${window.innerWidth < 640 ? 'py-1' : ''}`}>
                <div className={`mx-auto ${window.innerWidth < 640 ? 'px-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8'} py-2`}>
                    <div className={`flex flex-col md:flex-row md:items-center md:justify-between ${window.innerWidth < 640 ? 'gap-1' : 'gap-4'}`}>
                        <div className={`flex items-center ${window.innerWidth < 640 ? 'gap-1' : 'gap-4'}`}>
                            <div className={`bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl ${window.innerWidth < 640 ? 'p-1' : 'p-3'}`}>
                                <BookOpen className={`text-blue-600 ${window.innerWidth < 640 ? 'h-4 w-4' : 'h-8 w-8'}`} />
                            </div>
                            <div>
                                <h1 className={`font-bold text-gray-900 ${window.innerWidth < 640 ? 'text-sm' : 'text-2xl'}`}>
                                    {claseData.nombre}
                                </h1>
                                <div className={`mt-0.5 flex items-center gap-2 ${window.innerWidth < 640 ? 'text-[11px]' : 'text-sm'}`}>
                                    <span className="inline-block px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                                        Código: {claseData.codigoClase}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {role === 'profesor' && (
                            <div className={`${window.innerWidth < 640 ? 'flex justify-center w-full mt-1' : ''}`}>
                                <button
                                    onClick={() => setShowAnuncioModal(true)}
                                    className={`
                                        flex items-center gap-2 bg-blue-600 text-white rounded-lg
                                        hover:bg-blue-700 transition-all duration-300 shadow-sm
                                        ${window.innerWidth < 640 ? 'px-2 py-1 text-xs w-full h-7 min-h-0 min-w-0' : 'px-6 py-3'}
                                    `}
                                    style={window.innerWidth < 640 ? { fontSize: '12px', minWidth: 0, height: 28, lineHeight: '18px', width: '100%' } : {}}
                                >
                                    <Bell className={`${window.innerWidth < 640 ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                    <span className="font-medium">Publicar anuncio</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className={`mx-auto ${window.innerWidth < 640 ? 'px-0 py-1' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
                <div className={`flex flex-col lg:flex-row ${window.innerWidth < 640 ? 'gap-1' : 'gap-8'} stagger-animation`}>
                    
                    {/* Lista de estudiantes - Más pequeña en móvil */}
                    <div className={`
                        lg:w-[300px] shrink-0 bg-white rounded-xl border border-gray-100 shadow
                        ${window.innerWidth < 640 ? 'p-1 w-full mb-1' : 'p-6'}
                        h-fit sticky top-8 opacity-0 animate-slideRight
                    `}>
                        <div className={`flex items-center justify-between ${window.innerWidth < 640 ? 'mb-1' : 'mb-6'}`}>
                            <h2 className={`font-semibold text-gray-900 ${window.innerWidth < 640 ? 'text-xs' : 'text-lg'}`}>
                                Estudiantes
                            </h2>
                            <div className="flex items-center gap-1">
                                {role === 'profesor' && (
                                    <button
                                        className={`p-1 rounded-full hover:bg-blue-50 transition-colors`}
                                        onClick={() => setShowSearchModal(true)}
                                    >
                                        <UserPlus className={`text-blue-600 ${window.innerWidth < 640 ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                    </button>
                                )}
                                <button
                                    className={`p-1 rounded-full hover:bg-blue-50 transition-colores`}
                                    onClick={() => setShowAlumnosModal(true)}
                                >
                                    <MoreVertical className={`text-blue-600 ${window.innerWidth < 640 ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                </button>
                            </div>
                        </div>
                        <div className={`min-h-[40px] ${window.innerWidth < 640 ? 'max-h-[60px]' : 'max-h-[280px]'} overflow-y-auto`}>
                            {claseData.estudiantes && claseData.estudiantes.length > 0 ? (
                                <ul className={`space-y-1 ${window.innerWidth < 640 ? '' : 'space-y-3'}`}>
                                    {claseData.estudiantes.slice(0, window.innerWidth < 640 ? 2 : 4).map((estudiante) => (
                                        <li key={estudiante.id}
                                            className={`flex items-center gap-1 p-1 hover:bg-gray-50 rounded-lg transition-colores`}>
                                            <img
                                                src={estudiante.fotoPerfilUrl ? `${API_BASE_URL}${estudiante.fotoPerfilUrl}` : '/default-avatar.png'}
                                                alt={`Foto de ${estudiante.nombre}`}
                                                className={`rounded-full object-cover border-2 border-gray-200
                                                    ${window.innerWidth < 640 ? 'h-5 w-5' : 'h-9 w-9'}`}
                                                onError={e => { e.target.src = '/default-avatar.png'; }}
                                            />
                                            <span className={`font-medium text-gray-900 truncate ${window.innerWidth < 640 ? 'text-[11px]' : ''}`}>
                                                {estudiante.nombre}
                                            </span>
                                        </li>
                                    ))}
                                    {claseData.estudiantes.length > (window.innerWidth < 640 ? 2 : 4) && (
                                        <li className="text-center text-blue-600 text-xs py-1 border-t">
                                            Ver todos ({claseData.estudiantes.length})
                                        </li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">No hay estudiantes inscritos.</p>
                            )}
                        </div>
                    </div>

                    {/* Tablón de anuncios - más compacto y centrado en móvil */}
                    <div className={`flex-1 flex flex-col ${window.innerWidth < 640 ? 'gap-1' : 'gap-8'} opacity-0 animate-fadeIn`}
                         style={{ animationDelay: '400ms' }}>
                        <div className={`bg-white rounded-xl border border-gray-100 shadow
                            ${window.innerWidth < 640 ? 'p-1 w-full max-w-[340px] mx-auto' : 'p-6'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className={`font-semibold text-gray-900 ${window.innerWidth < 640 ? 'text-sm' : 'text-lg'}`}>Tablón de anuncios</h2>
                                {renderFiltros()}
                            </div>
                            <div className="min-h-[40px]">
                                {filtrarTareas(anuncios).length > 0 ? (
                                    <div className={window.innerWidth < 640 ? "space-y-1" : "space-y-4"}>
                                        {filtrarTareas(anuncios).map((anuncio, index) =>
                                            anuncio.tipo === "tarea" ? (
                                                <div
                                                    key={anuncio.id}
                                                    onClick={() => handleOpenTarea(anuncio)}
                                                    className="group p-7 border border-gray-100 rounded-2xl cursor-pointer
                                                        bg-gradient-to-r from-blue-50 to-white relative opacity-0 animate-slideRight
                                                        transition-all duration-300
                                                        overflow-hidden
                                                        hover:shadow-2xl hover:border-blue-400 hover:bg-white
                                                        hover:scale-[1.025] hover:z-10
                                                        shadow-lg"
                                                    style={{
                                                        animationDelay: `${600 + (index * 100)}ms`,
                                                        minHeight: '170px',
                                                        boxShadow: '0 6px 32px 0 rgba(59,130,246,0.08)'
                                                    }}
                                                >
                                                    {/* Fondo decorativo animado */}
                                                    <div className="pointer-events-none absolute inset-0 z-0">
                                                        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-100 opacity-0 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 blur-2xl"></div>
                                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-indigo-100 opacity-0 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 blur-2xl"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-100/20 to-indigo-100/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
                                                    </div>
                                                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 pointer-events-none transition-all duration-300 z-10"></div>
                                                    <div className="relative z-20">
                                                        {/* Título arriba, siempre visible y truncado si es muy largo */}
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-200 transition-colors">
                                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <h3
                                                                className="font-semibold text-blue-700 group-hover:text-blue-900 transition-colores text-xl truncate"
                                                                title={anuncio.titulo || "Tarea sin título"}
                                                                style={{
                                                                    maxWidth: '90%',
                                                                    display: 'block',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {anuncio.titulo || "Tarea sin título"}
                                                            </h3>
                                                        </div>
                                                        {/* Estado de la tarea debajo del título */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {role === 'alumno' && anuncio.tipo === 'tarea' && (
                                                                (() => {
                                                                    const estado = getEstadoTarea(anuncio);
                                                                    switch (estado) {
                                                                        case 'entregada':
                                                                            return (
                                                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                                    Entregada
                                                                                </span>
                                                                            );
                                                                        case 'expirada':
                                                                            return (
                                                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                                                    Expiró hace {getTimeAgo(anuncio.fechaEntrega)}
                                                                                </span>
                                                                            );
                                                                        default:
                                                                            return (
                                                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                                                    Pendiente
                                                                                </span>
                                                                            );
                                                                    }
                                                                })()
                                                            )}
                                                            {role === 'profesor' && (
                                                                <div className="flex items-center gap-2 mr-2 text-xs">
                                                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                                                        {anuncio.entregasRealizadas ?? (anuncio.entregas?.length ?? 0)} entregas
                                                                    </span>
                                                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                                                                        {anuncio.entregasPendientes ?? ((claseData?.estudiantes?.length || 0) - (anuncio.entregas?.length ?? 0))} pendientes
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {/* Botón eliminar más compacto */}
                                                            {role === 'profesor' && (
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        handleDeleteAnuncio(anuncio.id);
                                                                    }}
                                                                    className="p-1.5 rounded-lg bg-white/90 shadow-sm hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colores flex items-center justify-center"
                                                                    title="Eliminar tarea"
                                                                    style={{ backdropFilter: 'blur(8px)' }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colores" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1v3m-7 0h10" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* ...resto del contenido (fecha, detalles, etc)... */}
                                                    <div className="flex items-center gap-4 text-base text-gray-600 mt-4">
                                                        <Calendar className="h-5 w-5 text-gray-500" />
                                                        <span className="flex-1">
                                                            {anuncio.fechaEntrega
                                                                ? new Date(anuncio.fechaEntrega).toLocaleString('es-ES', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : "Sin fecha límite"}
                                                        </span>
                                                        <span className="text-base text-blue-600 font-medium flex items-center gap-1 group-hover:underline">
                                                            Ver detalles <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    key={anuncio.id}
                                                    className="group p-6 border border-gray-100 rounded-2xl cursor-pointer
                                                        bg-gradient-to-r from-blue-50 to-white relative opacity-0 animate-slideRight
                                                        transition-all duration-300
                                                        overflow-hidden
                                                        hover:shadow-2xl hover:border-blue-400 hover:bg-white
                                                        hover:scale-[1.015] hover:z-10
                                                        shadow"
                                                    style={{
                                                        animationDelay: `${600 + (index * 100)}ms`,
                                                        minHeight: '120px'
                                                    }}
                                                >
                                                    {/* Fondo decorativo animado */}
                                                    <div className="pointer-events-none absolute inset-0 z-0">
                                                        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-100 opacity-0 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 blur-2xl"></div>
                                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-indigo-100 opacity-0 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 blur-2xl"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-100/20 to-indigo-100/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
                                                    </div>
                                                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 pointer-events-none transition-all duration-300 z-10"></div>
                                                    {/* Botón eliminar solo para profesor */}
                                                    {role === 'profesor' && (
                                                        <button
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleDeleteAnuncio(anuncio.id);
                                                            }}
                                                            className="absolute top-3 right-3 z-50 p-2 rounded-full bg-white shadow hover:bg-red-100 border border-red-200 transition-colores"
                                                            title="Eliminar anuncio"
                                                            style={{ boxShadow: '0 2px 8px 0 rgba(255,0,0,0.04)' }}
                                                        >
                                                            {/* Icono de papelera */}
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1v3m-7 0h10" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {/* Contenido principal */}
                                                    <div className="relative z-20">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colores">
                                                                <Bell className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-blue-700 group-hover:text-blue-900 transition-colores">
                                                                {anuncio.titulo || "Anuncio"}
                                                            </h3>
                                                        </div>
                                                        <div className="mb-2 text-gray-700 text-base whitespace-pre-line">
                                                            {anuncio.contenido}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                            <span className="flex items-center gap-2">
                                                                <span>{new Date(anuncio.fechaCreacion).toLocaleString('es-ES', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}</span>
                                                            </span>
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-center py-4">
                                        <Bell className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                                        <p className="text-xs">No hay anuncios publicados</p>
                                    </div>
                                )}
                            </div>
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
            
            {/* MODAL DE CREAR ANUNCIO/TAREA CON NUEVO DISEÑO */}
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
                // --- NUEVO: props de diseño responsive móvil ---
                modalClassName={`
                    rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50
                    ${window.innerWidth < 640 ? 'p-0 w-full max-w-full min-h-screen' : 'p-0'}
                `}
                header={(
                    <div className={`
                        flex items-center gap-3
                        ${window.innerWidth < 640
                            ? 'px-4 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-t-2xl'
                            : 'px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-t-2xl'
                        }
                    `}>
                        <Bell className={window.innerWidth < 640 ? "h-6 w-6 text-blue-500" : "h-7 w-7 text-blue-500"} />
                        <span className={window.innerWidth < 640 ? "text-lg font-bold text-blue-900" : "text-xl font-bold text-blue-900"}>
                            Crear nueva publicación
                        </span>
                    </div>
                )}
                tipoSelectorClassName={window.innerWidth < 640 ? "flex gap-2 px-4 pt-4" : "flex gap-4 px-8 pt-6"}
                tipoBtnClassName={tipo => `
                    flex-1 flex flex-col items-center justify-center gap-1
                    ${window.innerWidth < 640
                        ? 'py-4 px-1 rounded-xl border-2 text-xs'
                        : 'py-6 px-2 rounded-xl border-2'
                    }
                    transition-all cursor-pointer
                    ${anuncioData.tipo === tipo
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}
                `}
                tipoBtnContent={{
                    anuncio: (
                        <>
                            <Bell className={window.innerWidth < 640 ? "h-6 w-6 text-blue-500" : "h-7 w-7 text-blue-500"} />
                            <span className={window.innerWidth < 640 ? "font-semibold text-blue-900 text-sm" : "font-semibold text-blue-900"}>
                                Publicar anuncio
                            </span>
                            <span className={window.innerWidth < 640 ? "text-[11px] text-gray-500 text-center" : "text-xs text-gray-500"}>
                                Comparte información o avisos con tus estudiantes
                            </span>
                        </>
                    ),
                    tarea: (
                        <>
                            <FileText className={window.innerWidth < 640 ? "h-6 w-6 text-indigo-500" : "h-7 w-7 text-indigo-500"} />
                            <span className={window.innerWidth < 640 ? "font-semibold text-indigo-900 text-sm" : "font-semibold text-indigo-900"}>
                                Crear tarea
                            </span>
                            <span className={window.innerWidth < 640 ? "text-[11px] text-gray-500 text-center" : "text-xs text-gray-500"}>
                                Asigna actividades y trabajos a tus estudiantes
                            </span>
                        </>
                    )
                }}
                bodyClassName={window.innerWidth < 640 ? "px-4 py-4" : "px-8 py-6"}
                footerClassName={window.innerWidth < 640 ? "px-4 pb-4" : "px-8 pb-6"}
                btnCrearClassName={`
                    w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/10 transition-all
                    ${window.innerWidth < 640 ? 'text-base' : 'text-lg'}
                `}
                btnCancelarClassName={`
                    w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all
                    ${window.innerWidth < 640 ? 'text-base' : 'text-lg'}
                `}
                // --- FIN props de diseño responsive móvil ---
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
                onTareaEntregada={handleTareaEntregada}
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