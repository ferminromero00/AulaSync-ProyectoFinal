import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X, MoreVertical, AlertTriangle } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchAlumnos } from '../../services/alumnos';
import { enviarInvitacion } from '../../services/invitaciones';
import { toast } from 'react-hot-toast';
import { crearAnuncio, obtenerAnuncios, eliminarAnuncio } from '../../services/anuncios';

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
        contenido: ''
    });
    const [anuncios, setAnuncios] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [anuncioToDelete, setAnuncioToDelete] = useState(null);
    const [isDeletingAnuncio, setIsDeletingAnuncio] = useState(false);
    const [isCreatingAnuncio, setIsCreatingAnuncio] = useState(false);

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
            await crearAnuncio({
                contenido: anuncioData.contenido,
                tipo: 'mensaje',
                claseId: id
            });
            toast.success('Anuncio creado correctamente');
            setShowAnuncioModal(false);
            setAnuncioData({ contenido: '' });
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
                                setAnuncioData({ contenido: '' });
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
                                    setAnuncioData({ contenido: '' });
                                }}
                                className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                disabled={isCreatingAnuncio}
                            >
                                {isCreatingAnuncio ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                                        <span>Creando anuncio...</span>
                                    </>
                                ) : (
                                    <>
                                        <Bell className="h-4 w-4" />
                                        <span>Publicar anuncio</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
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
                            <button 
                                onClick={() => setShowAnuncioModal(true)}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Bell className="h-4 w-4 mr-2" />
                                Publicar anuncio
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Lista de estudiantes - Reducido de lg:w-1/4 a lg:w-1/5 */}
                    <div className="lg:w-1/5 bg-white rounded-lg shadow p-6">
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
                                {/* Botón para abrir el modal de alumnos */}
                                <button
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Ver lista completa"
                                    onClick={() => setShowAlumnosModal(true)}
                                >
                                    <MoreVertical className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        {clase.estudiantes && clase.estudiantes.length > 0 ? (
                            <ul className="space-y-2">
                                {clase.estudiantes.slice(0, 5).map((estudiante) => (
                                    <li key={estudiante.id} className="text-gray-700">
                                        {estudiante.nombre}
                                    </li>
                                ))}
                                {clase.estudiantes.length > 5 && (
                                    <li className="text-blue-600 text-sm cursor-pointer" onClick={() => setShowAlumnosModal(true)}>
                                        Ver todos...
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No hay estudiantes inscritos.</p>
                        )}
                    </div>

                    {/* Contenido principal - Ajustado para ocupar más espacio */}
                    <div className="lg:w-4/5 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tablón de anuncios</h2>
                        {anuncios.length > 0 ? (
                            <div className="space-y-4">
                                {anuncios.map((anuncio) => (
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
                                ))}
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
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                disabled={isDeletingAnuncio}
                            >
                                {isDeletingAnuncio ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                                        <span>Eliminando...</span>
                                    </>
                                ) : (
                                    'Eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {renderStudentSearchModal()}
            {renderAlumnosModal()}
            {renderAnuncioModal()}
        </div>
    );
};

export default ClaseDashboard;
