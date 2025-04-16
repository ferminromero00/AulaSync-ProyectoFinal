import React, { useState, useEffect } from 'react';
import { getClasesProfesor, crearClase } from '../../services/clases';
import { Plus, BookOpen, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClasesProfesor = ({ onClaseCreated }) => {
    const [clases, setClases] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        nombre: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarClases();
    }, []);

    const cargarClases = async () => {
        try {
            const token = localStorage.getItem('token');
            const clasesData = await getClasesProfesor(token);
            setClases(clasesData);
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
            const token = localStorage.getItem('token');
            await crearClase(nuevaClase, token);
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
        <div className="w-full bg-white rounded-lg shadow-sm">
            <div className="border-b p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Resumen de Clases</h2>
                    <p className="text-sm text-gray-500">Vista rápida de tus clases activas</p>
                </div>
                <Link 
                    to="/profesor/clases"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Ver todas →
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
                    <div className="grid gap-4">
                        {clases.slice(0, 3).map((clase) => (
                            <Link 
                                key={clase.id}
                                to={`/profesor/clase/${clase.id}`}
                                className="group block bg-gray-50 rounded-lg p-5 transition-all hover:bg-gray-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                                            <BookOpen className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{clase.nombre}</h3>
                                            <div className="flex items-center mt-1 space-x-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    <span>{clase.numEstudiantes} estudiantes</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <BookOpen className="h-4 w-4 mr-1" />
                                                    <span>Código: {clase.codigoClase}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    <span>{new Date(clase.createdAt).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-blue-600 text-sm font-medium">
                                            Ver detalles →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {clases.length === 0 && (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3"/>
                            <p className="text-gray-500 mb-1">No hay clases creadas.</p>
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
