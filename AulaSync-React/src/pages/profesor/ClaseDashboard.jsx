import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { BookOpen, Users, Bell, ChevronRight, UserPlus } from 'lucide-react';

const ClaseDashboard = () => {
    const { id } = useParams();
    const [clase, setClase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClase = async () => {
            try {
                const data = await getClaseById(id);
                setClase(data);
            } catch (error) {
                console.error('Error al cargar la clase:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClase();
    }, [id]);

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
                            <button
                                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                title="Añadir estudiante"
                            >
                                <UserPlus className="h-5 w-5 text-gray-600" />
                            </button>
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
        </div>
    );
};

export default ClaseDashboard;
