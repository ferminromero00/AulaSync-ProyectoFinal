import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X, MoreVertical } from 'lucide-react';
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

    const handleAbrirTarea = (tareaId) => {
        setTareaIdToOpen(tareaId);
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
                                    <li key={estudiante.id} className="text-gray-700">
                                        {estudiante.nombre}
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

                    {/* Contenido central */}
                    <div className="lg:col-span-3 space-y-6 opacity-0 animate-slideRight"
                         style={{ animationDelay: '400ms' }}>
                        <div className="space-y-4">
                            {tareas?.map((tarea, index) => (
                                <div key={tarea.id}
                                     className="opacity-0 animate-bounceIn"
                                     style={{ animationDelay: `${600 + (index * 100)}ms` }}>
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleAbrirTarea(tarea.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            <span className="font-semibold">{tarea.titulo}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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