import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus, Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchAlumnos } from '../../services/alumnos';

const ClaseDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clase, setClase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
                                        className="py-3 hover:bg-gray-50 cursor-pointer px-2 rounded"
                                        onClick={() => {
                                            // TODO: Implementar la lógica para añadir al alumno
                                            console.log('Añadir alumno:', alumno);
                                        }}
                                    >
                                        <div className="font-medium">{alumno.nombre}</div>
                                        <div className="text-sm text-gray-500">{alumno.email}</div>
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
                            <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
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
                            {role === 'profesor' && (
                                <button
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Añadir estudiante"
                                    onClick={() => setShowSearchModal(true)}
                                >
                                    <UserPlus className="h-5 w-5 text-gray-600" />
                                </button>
                            )}
                        </div>
                        {clase.estudiantes && clase.estudiantes.length > 0 ? (
                            <ul className="space-y-2">
                                {clase.estudiantes.map((estudiante) => (
                                    <li key={estudiante.id} className="text-gray-700">
                                        {estudiante.nombre}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No hay estudiantes inscritos.</p>
                        )}
                    </div>

                    {/* Contenido principal - Ajustado para ocupar más espacio */}
                    <div className="lg:w-4/5 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tablón de anuncios</h2>
                        <div className="text-gray-500 text-center py-8">
                            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p>No hay anuncios publicados</p>
                        </div>
                    </div>
                </div>
            </div>
            {renderStudentSearchModal()}
        </div>
    );
};

export default ClaseDashboard;
