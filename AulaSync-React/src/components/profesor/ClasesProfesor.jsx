import React, { useState, useEffect } from 'react';
import { getClasesProfesor, crearClase, eliminarClase } from '../../services/clases';
import { Plus, MoreVertical, Trash, Users, BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClasesProfesor = ({ onClaseCreated }) => {
    const [clases, setClases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        nombre: ''
    });
    const [menuAbierto, setMenuAbierto] = useState(null);

    useEffect(() => {
        cargarClases();
    }, []);

    const cargarClases = async () => {
        try {
            setIsLoading(true);
            const clasesData = await getClasesProfesor();
            setClases(clasesData);
            setError(null);
        } catch (error) {
            setError(error.message || 'Error al cargar las clases');
            console.error('Error al cargar las clases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await crearClase(nuevaClase);
            setMostrarFormulario(false);
            setNuevaClase({ nombre: '' });
            await cargarClases();
            // Llamar a la función para actualizar las estadísticas
            if (onClaseCreated) {
                onClaseCreated();
            }
        } catch (error) {
            console.error('Error al crear la clase:', error);
            // Podrías mostrar un mensaje de error al usuario aquí
            alert(error.message);
        }
    };

    const handleEliminarClase = async (claseId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
            try {
                await eliminarClase(claseId);
                await cargarClases();
                if (onClaseCreated) {
                    onClaseCreated();
                }
            } catch (error) {
                console.error('Error al eliminar la clase:', error);
                alert(error.message);
            }
        }
        setMenuAbierto(null);
    };

    // Añadir este useEffect para manejar clicks fuera del menú
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuAbierto && !event.target.closest('.menu-button')) {
                setMenuAbierto(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuAbierto]);

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
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
                <div className="p-6">
                    <div className="grid gap-4">
                        {clases.slice(0, 3).map((clase) => (
                            <div 
                                key={clase.id} 
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{clase.nombre}</h3>
                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                <span>{clase.numEstudiantes} estudiantes</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                <span>{new Date(clase.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Menú de opciones */}
                                {/* ...existing code for menu... */}
                            </div>
                        ))}
                    </div>
                    {clases.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                            No hay clases creadas. Crea tu primera clase!
                        </div>
                    )}
                    {clases.length > 3 && (
                        <div className="mt-4 text-center">
                            <Link 
                                to="/profesor/clases"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Ver todas las clases ({clases.length})
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClasesProfesor;
