import { useState, useEffect } from 'react';
import { getClasesProfesor, eliminarClase, crearClase } from '../../services/clases';
import { BookOpen, Calendar, Users, Clock, MoreVertical, Trash, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Clases = () => {
    const [clases, setClases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        nombre: ''
    });

    const cargarClases = async () => {
        try {
            setIsLoading(true);
            const data = await getClasesProfesor();
            setClases(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarClases();
    }, []);

    const handleEliminarClase = async (claseId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
            try {
                await eliminarClase(claseId);
                // Actualizar el estado local inmediatamente
                setClases(prevClases => prevClases.filter(clase => clase.id !== claseId));
                setMenuAbierto(null);
            } catch (error) {
                console.error('Error al eliminar la clase:', error);
                alert(error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await crearClase(nuevaClase);
            setMostrarFormulario(false);
            setNuevaClase({ nombre: '' });
            // Agregar la nueva clase directamente al estado
            setClases(prevClases => [...prevClases, response.clase]);
        } catch (error) {
            console.error('Error al crear la clase:', error);
            alert(error.message);
        }
    };

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
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gestiona todas tus clases y sus detalles
                    </p>
                </div>
                <button
                    onClick={() => setMostrarFormulario(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Clase
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {clases.map((clase) => (
                        <Link
                            key={clase.id}
                            to={`/profesor/clase/${clase.id}`}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">{clase.nombre}</h2>
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMenuAbierto(menuAbierto === clase.id ? null : clase.id);
                                            }}
                                            className="menu-button p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <MoreVertical className="h-5 w-5 text-gray-500" />
                                        </button>
                                        {menuAbierto === clase.id && (
                                            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEliminarClase(clase.id);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full"
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Eliminar clase
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600">
                                        <BookOpen className="h-5 w-5 mr-2" />
                                        <span className="text-sm">Código: {clase.codigoClase}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Users className="h-5 w-5 mr-2" />
                                        <span className="text-sm">{clase.numEstudiantes} estudiantes</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        <span className="text-sm">Creada: {new Date(clase.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="h-5 w-5 mr-2" />
                                        <span className="text-sm">Última actividad: {clase.ultimaActividad}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            <p>Profesor: {clase.profesor.nombre}</p>
                                            <p>Especialidad: {clase.profesor.especialidad || 'No especificada'}</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Ver detalles →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal para crear clase */}
            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Crear Nueva Clase</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la clase
                                </label>
                                <input
                                    type="text"
                                    value={nuevaClase.nombre}
                                    onChange={(e) => setNuevaClase({...nuevaClase, nombre: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Crear Clase
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clases;
