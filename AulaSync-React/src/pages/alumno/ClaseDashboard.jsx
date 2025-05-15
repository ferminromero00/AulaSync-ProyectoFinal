import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, ChevronRight, UserPlus, Search, X, MoreVertical, Calendar, FileText, Paperclip } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchAlumnos } from '../../services/alumnos';
import { enviarInvitacion } from '../../services/invitaciones';
import { toast } from 'react-hot-toast';
import '../../styles/animations.css';
import TareasResumenAlumno from '../../components/alumno/TareasResumenAlumno';

const ClaseDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clase, setClase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [showAlumnosModal, setShowAlumnosModal] = useState(false);
    const [tareas, setTareas] = useState([]);
    const [showTareasModal, setShowTareasModal] = useState(false);
    const [tareaIdToOpen, setTareaIdToOpen] = useState(null);
    const [tareaEstadoPreview, setTareaEstadoPreview] = useState(null); // { tarea, estado }

    // Detectar el rol del usuario (ajusta si lo guardas en otro sitio)
    const role = localStorage.getItem('role'); // 'profesor' o 'alumno'

    useEffect(() => {
        // Solo cargar datos de la clase, no perfil ni clases globales aquí
        const fetchClase = async () => {
            try {
                const data = await getClaseById(id);
                setClase(data);
                // Ajusta aquí si tus tareas vienen en otro campo
                setTareas(data.tareas || data.anuncios?.filter(a => a.tipo === 'tarea') || []);
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
            setIsInviting(true);
            const result = await enviarInvitacion(alumno.id, id);
            if (result && result.alreadyInClass) {
                toast.error('El alumno ya pertenece a esta clase');
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
            setIsInviting(false);
        }
    };

    // Determina el estado de la tarea: 'pendiente', 'entregada', 'expirada', 'calificada'
    const getEstadoTarea = (tarea) => {
        // Considerar calificada si tiene nota
        if (tarea.entregada && tarea.nota !== undefined && tarea.nota !== null && tarea.nota !== '') return 'calificada';
        if (tarea.entregada) return 'entregada';
        if (tarea.fechaEntrega) {
            const fechaEntrega = new Date(tarea.fechaEntrega);
            const ahora = new Date();
            if (fechaEntrega < ahora) return 'expirada';
        }
        return 'pendiente';
    };

    // Al hacer click en una tarea, abrir el modal de TareasResumenAlumno con la tarea seleccionada
    const handleAbrirTarea = (tareaId) => {
        setTareaIdToOpen(tareaId);
    };

    // Cuando el usuario confirma el preview, abre el modal real
    const handleConfirmEstadoTarea = () => {
        setTareaIdToOpen(tareaEstadoPreview.tarea.id);
        setTareaEstadoPreview(null);
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
                                            {isInviting && (
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
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
            {/* Header con animación mejorada */}
            <header className="bg-white shadow-sm mb-6 opacity-0 animate-scaleIn">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{clase?.nombre}</h1>
                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {clase?.numEstudiantes} estudiantes
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                    Activa
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido principal con animaciones escalonadas */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 stagger-animation">
                    {/* Panel lateral */}
                    <div className="lg:col-span-1 space-y-6 opacity-0 animate-slideRight"
                         style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Estudiantes</h2>
                            <button
                                onClick={() => setShowAlumnosModal(true)}
                                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                title="Ver lista completa"
                            >
                                <MoreVertical className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                        {clase.estudiantes && clase.estudiantes.length > 0 ? (
                            <ul className="space-y-2">
                                {clase.estudiantes.slice(0, 5).map((estudiante) => (
                                    <li key={estudiante.id} className="flex items-center gap-3">
                                        <img
                                            src={estudiante.fotoPerfilUrl ? estudiante.fotoPerfilUrl : '/default-avatar.png'}
                                            alt={`Foto de ${estudiante.nombre}`}
                                            className="h-9 w-9 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                        <span className="font-medium text-gray-900 truncate">{estudiante.nombre}</span>
                                    </li>
                                ))}
                                {clase.estudiantes.length > 5 && (
                                    <li 
                                        className="text-blue-600 text-sm cursor-pointer hover:text-blue-800"
                                        onClick={() => setShowAlumnosModal(true)}
                                    >
                                        Ver todos ({clase.estudiantes.length})
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No hay estudiantes inscritos.</p>
                        )}
                    </div>

                    {/* Contenido central - tareas con nuevo diseño */}
                    <div className="lg:col-span-3 space-y-6 opacity-0 animate-slideRight"
                         style={{ animationDelay: '400ms' }}>
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-blue-900 mb-2">Tablón de tareas</h2>
                            {tareas?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {tareas.map((tarea, index) => (
                                        <div key={tarea.id}
                                             className="opacity-0 animate-bounceIn"
                                             style={{ animationDelay: `${600 + (index * 100)}ms` }}>
                                            <div
                                                className="cursor-pointer group bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                                                onClick={() => handleAbrirTarea(tarea.id)}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="bg-blue-100 p-3 rounded-xl">
                                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-blue-900 text-lg truncate">{tarea.titulo}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {tarea.fechaEntrega
                                                        ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : "Sin fecha límite"}
                                                </div>
                                                {tarea.archivoUrl && (
                                                    <div className="flex items-center gap-1 text-blue-600 mb-2">
                                                        <Paperclip className="h-4 w-4" />
                                                        <span className="text-xs">Adjunto</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-sm text-gray-500">
                                                        {tarea.clase?.nombre || 'Sin clase'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {tarea.archivoUrl && (
                                                            <span className="flex items-center gap-1 text-blue-600">
                                                                <Paperclip className="h-4 w-4" />
                                                                <span className="text-xs">Adjunto</span>
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1 group-hover:underline group-hover:text-blue-800 transition-colors">
                                                            Ver detalles <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                    <p>No hay tareas publicadas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {/* Modal de lista completa de alumnos */}
            {showAlumnosModal && (
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
                                {clase.estudiantes.map((estudiante) => (
                                    <li key={estudiante.id} className="py-3 flex items-center gap-4">
                                        <img
                                            src={estudiante.fotoPerfilUrl ? estudiante.fotoPerfilUrl : '/default-avatar.png'}
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
            )}
            {renderStudentSearchModal()}
            {/* Modal de preview de estado de tarea */}
            {tareaEstadoPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4">
                        {tareaEstadoPreview.estado === 'entregada' && (
                            <>
                                <CheckCircle className="h-12 w-12 text-emerald-500 mb-2" />
                                <h3 className="text-xl font-semibold text-emerald-700">¡Tarea ya entregada!</h3>
                                <p className="text-gray-600 text-center">Ya has entregado esta tarea. Puedes ver los detalles o tu entrega.</p>
                            </>
                        )}
                        {tareaEstadoPreview.estado === 'expirada' && (
                            <>
                                <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                                <h3 className="text-xl font-semibold text-red-700">Tarea expirada</h3>
                                <p className="text-gray-600 text-center">La fecha de entrega ha pasado. Consulta si puedes entregar o revisa los detalles.</p>
                            </>
                        )}
                        {tareaEstadoPreview.estado === 'pendiente' && (
                            <>
                                <Clock className="h-12 w-12 text-amber-500 mb-2" />
                                <h3 className="text-xl font-semibold text-amber-700">Tarea pendiente</h3>
                                <p className="text-gray-600 text-center">Esta tarea está pendiente de entrega. Puedes entregarla ahora.</p>
                            </>
                        )}
                        <div className="flex gap-3 mt-4">
                            <button
                                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                onClick={() => setTareaEstadoPreview(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                onClick={handleConfirmEstadoTarea}
                            >
                                Ver detalles
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {tareaIdToOpen !== null && (
                <div className="fixed inset-0 z-50">
                    <TareasResumenAlumno
                        tareas={tareas}
                        tareaIdToOpen={tareaIdToOpen}
                        onClose={() => setTareaIdToOpen(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default ClaseDashboard;