import React, { useState, useEffect } from 'react';
import { getClasesProfesor, crearClase } from '../../services/clases';
import { Plus } from 'lucide-react';

function ClasesProfesor() {
    const [clases, setClases] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        nombre: ''
    });

    useEffect(() => {
        cargarClases();
    }, []);

    const cargarClases = async () => {
        try {
            const token = localStorage.getItem('token');
            const clasesData = await getClasesProfesor(token);
            setClases(clasesData);
        } catch (error) {
            console.error('Error al cargar las clases:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await crearClase(nuevaClase);
            setMostrarFormulario(false);
            setNuevaClase({ nombre: '' });
            await cargarClases();
        } catch (error) {
            console.error('Error al crear la clase:', error);
            // Podrías mostrar un mensaje de error al usuario aquí
            alert(error.message);
        }
    };

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

                <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
                    {clases.length > 0 ? (
                        clases.map((clase) => (
                            <div key={clase.id} className="flex flex-col p-6 rounded-lg border bg-gray-50 hover:shadow-lg transition-all">
                                <h3 className="text-lg font-semibold text-gray-900">{clase.nombre}</h3>
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
