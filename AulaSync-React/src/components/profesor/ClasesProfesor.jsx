import React, { useState, useEffect, useContext } from 'react';
import { getClasesProfesor, crearClase } from '../../services/clases';
import { Plus, BookOpen, Users, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../App';

/**
 * @typedef {Object} ClaseProfesor
 * @property {number} id - ID de la clase
 * @property {string} nombre - Nombre de la clase
 * @property {string} codigoClase - Código único de la clase
 * @property {number} numEstudiantes - Número de estudiantes inscritos
 * @property {Object} profesor - Datos del profesor
 * @property {Date} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} ClasesProfesorProps
 * @property {() => void} [onClaseCreated] - Función callback que se ejecuta después de crear exitosamente una nueva clase. 
 *                                           Útil para actualizar la lista de clases o realizar acciones adicionales.
 */

/**
 * Componente que muestra y gestiona las clases del profesor.
 * Permite ver un resumen de clases activas, crear nuevas clases y navegar a los detalles.
 * Integra con el contexto global para mantener el estado de las clases.
 * 
 * @param {ClasesProfesorProps} props - Propiedades del componente
 * @param {() => void} [props.onClaseCreated] - Función callback que se ejecuta después de crear exitosamente una nueva clase.
 *                                              Útil para actualizar la lista de clases o realizar acciones adicionales.
 * @returns {JSX.Element} Panel de gestión de clases del profesor
 */
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
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
            <div className="p-6 flex justify-between items-center border-b bg-gradient-to-r from-gray-50 to-white">
                <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Resumen de Clases
                    </h2>
                    <p className="text-sm text-gray-500">Vista rápida de tus clases activas</p>
                </div>
                <Link 
                    to="/profesor/clases"
                    className="flex items-center gap-1 px-4 py-1.5 text-blue-600 font-medium
                             hover:bg-blue-50 rounded-lg transition-colors group text-base"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clases.slice(0, 6).map((clase, index) => (
                            <Link
                                key={clase.id}
                                to={`/profesor/clase/${clase.id}`}
                                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50
                                    border border-gray-100 rounded-xl p-4 hover:border-blue-300
                                    transition-all duration-300 hover:shadow-lg animate-fadeIn"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl
                                        group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900 truncate mb-0.5 group-hover:text-blue-700">
                                            {clase.nombre}
                                        </h3>
                                        <div className="flex flex-col gap-0.5 text-sm">
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Users className="h-4 w-4" />
                                                <span>{clase.numEstudiantes} estudiantes</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                                                <span>Código: {clase.codigoClase}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(clase.createdAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <span className="text-gray-500">{clase.profesor?.nombre || 'Profesor'}</span>
                                            <span className="text-blue-600 group-hover:underline group-hover:text-blue-800">
                                                Ver detalles →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {clases.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="h-14 w-14 text-gray-400 mx-auto mb-3"/>
                            <p className="text-gray-500 mb-1">No hay clases creadas</p>
                            <Link 
                                to="/profesor/clases"
                                className="text-blue-600 hover:text-blue-800 text-base font-medium"
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
