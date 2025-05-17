import React, { useState, useEffect, useContext } from 'react';
import { getClasesProfesor, crearClase } from '../../services/clases';
import { Plus, BookOpen, Users, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../App';

const ClasesProfesor = ({ onClaseCreated }) => {
    const { userData, setUserData } = useContext(GlobalContext);
    const [clases, setClases] = useState(userData.clases || []);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({ nombre: '' });
    const [isLoading, setIsLoading] = useState(!userData.clases || userData.clases.length === 0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userData.clases || userData.clases.length === 0) {
            cargarClases();
        } else {
            setIsLoading(false);
        }
    // eslint-disable-next-line
    }, []);

    const cargarClases = async () => {
        try {
            setIsLoading(true);
            const clasesData = await getClasesProfesor();
            setClases(clasesData);
            setUserData(prev => ({ ...prev, clases: clasesData }));
            setIsLoading(false);
        } catch (error) {
            console.error('Error al cargar las clases:', error);
            setError('Error al cargar las clases');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await crearClase(nuevaClase);
            setMostrarFormulario(false);
            setNuevaClase({ nombre: '' });
            await cargarClases();
            if (onClaseCreated) {
                onClaseCreated();
            }
        } catch (error) {
            console.error('Error al crear la clase:', error);
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl overflow-hidden border border-gray-100">
            {/* Header con diseño moderno */}
            <div className="p-6 flex justify-between items-center border-b bg-gradient-to-r from-gray-50 to-white">
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Resumen de Clases
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Vista rápida de tus clases activas</p>
                </div>
                <Link 
                    to="/profesor/clases"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 font-medium
                             hover:bg-blue-50 rounded-lg transition-colors group"
                >
                    Ver todas 
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {clases.slice(0, 3).map((clase, index) => (
                            <Link
                                key={clase.id}
                                to={`/profesor/clase/${clase.id}`}
                                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white
                                         border border-gray-100 rounded-xl p-5 hover:border-blue-200
                                         transition-all duration-300 hover:shadow-lg animate-fadeIn"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {/* Fondo decorativo */}
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 
                                              rounded-full transition-transform duration-500 group-hover:scale-150" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg
                                                    group-hover:scale-110 transition-transform duration-300">
                                            <BookOpen className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                                                {clase.nombre}
                                            </h3>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Users className="h-4 w-4 mr-1.5 shrink-0" />
                                                    <span>{clase.numEstudiantes} estudiantes</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <BookOpen className="h-4 w-4 mr-1.5 shrink-0" />
                                                    <span className="font-medium text-blue-600">
                                                        Código: {clase.codigoClase}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1.5 shrink-0" />
                                                    <span>
                                                        {new Date(clase.createdAt).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">
                                                        {typeof clase.profesor === 'string' 
                                                            ? clase.profesor 
                                                            : clase.profesor?.nombre || 'Profesor'}
                                                    </span>
                                                    <p>
                                                        {typeof clase.profesor === 'string' 
                                                            ? '' 
                                                            : clase.profesor?.especialidad || 'No especificada'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                            Ver detalles
                                            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {clases.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3"/>
                            <p className="text-gray-500 mb-1">No hay clases creadas</p>
                            <Link 
                                to="/profesor/clases"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Crear tu primera clase
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClasesProfesor;
