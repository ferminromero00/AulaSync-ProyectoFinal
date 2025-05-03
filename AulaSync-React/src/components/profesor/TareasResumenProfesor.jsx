import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Users } from 'lucide-react';

const TareasResumenProfesor = () => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        pendientes: false,
        recientes: false
    });

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    // Mock data for demonstration
    const tareasDemoProfesor = {
        pendientes: [
            {
                id: 1,
                titulo: "Práctica React Hooks",
                clase: "Desarrollo Web",
                entregas: 5,
                totalAlumnos: 15,
                fechaLimite: "2024-03-20"
            },
            {
                id: 2,
                titulo: "Proyecto API REST",
                clase: "Desarrollo Backend",
                entregas: 3,
                totalAlumnos: 12,
                fechaLimite: "2024-03-25"
            }
        ],
        recientes: [
            {
                id: 3,
                titulo: "Ejercicios JavaScript",
                clase: "Programación Frontend",
                entregas: 8,
                totalAlumnos: 10,
                fechaLimite: "2024-03-15"
            }
        ]
    };

    const renderTarea = (tarea) => (
        <div key={tarea.id} className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{tarea.titulo}</h4>
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    {tarea.entregas}/{tarea.totalAlumnos} entregas
                </span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{tarea.clase}</span>
                <span className="text-gray-500">
                    Límite: {new Date(tarea.fechaLimite).toLocaleDateString()}
                </span>
            </div>
            <div className="mt-3 pt-3 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(tarea.entregas / tarea.totalAlumnos) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Sección de tareas pendientes por calificar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => toggleSeccion('pendientes')}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-amber-500" />
                            <span className="font-medium text-gray-900">Pendientes de calificar</span>
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {tareasDemoProfesor.pendientes.length}
                            </span>
                        </div>
                        {seccionesAbiertas.pendientes ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                </div>
                {seccionesAbiertas.pendientes && (
                    <div className="space-y-2">
                        {tareasDemoProfesor.pendientes.map(renderTarea)}
                    </div>
                )}
            </div>

            {/* Sección de entregas recientes */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => toggleSeccion('recientes')}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-gray-900">Entregas recientes</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {tareasDemoProfesor.recientes.length}
                            </span>
                        </div>
                        {seccionesAbiertas.recientes ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                </div>
                {seccionesAbiertas.recientes && (
                    <div className="space-y-2">
                        {tareasDemoProfesor.recientes.map(renderTarea)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TareasResumenProfesor;
