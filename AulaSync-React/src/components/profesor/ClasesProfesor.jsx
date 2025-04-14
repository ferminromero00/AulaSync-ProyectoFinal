import React, { useState, useEffect } from 'react';
import { getClasesProfesor, crearClase, eliminarClase } from '../../services/clases';
import { Plus, MoreVertical, Trash } from 'lucide-react';

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
            const token = localStorage.getItem('token');
            const clasesData = await getClasesProfesor(token);
            setClases(clasesData);
            setError(null);
        } catch (error) {
            setError('Error al cargar las clases');
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
        <>
            <div className="w-full bg-white rounded-lg shadow-sm">
                <div className="border-b p-6 flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold">Tus Clases</h2>
                        <p className="text-sm text-gray-500">Gestiona tus clases activas</p>
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
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
                        {clases.length > 0 ? (
                            clases.map((clase) => (
                                <div key={clase.id} className="flex flex-col p-6 rounded-lg border bg-gray-50 hover:shadow-lg transition-all relative w-full max-w-sm">
                                    <div className="absolute top-4 right-4">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuAbierto(menuAbierto === clase.id ? null : clase.id);
                                            }}
                                            className="menu-button p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <MoreVertical className="h-5 w-5 text-gray-500" />
                                        </button>
                                        {menuAbierto === clase.id && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 border border-gray-100">
                                                <div className="py-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEliminarClase(clase.id);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full transition-colors"
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Eliminar clase
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 pr-8">{clase.nombre}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{clase.numEstudiantes || 0} estudiantes</p>
                                    <p className="text-sm text-gray-500 mt-2">{clase.horario}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full text-center py-8">
                                No hay clases creadas. Crea tu primera clase haciendo clic en "Nueva Clase".
                            </p>
                        )}
                    </div>
                )}
            </div>

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
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </>
    );
}

export default ClasesProfesor;
