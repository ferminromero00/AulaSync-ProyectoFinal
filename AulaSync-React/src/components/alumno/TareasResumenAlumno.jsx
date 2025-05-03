import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar, AlertCircle } from 'lucide-react';

const TareasResumenAlumno = ({ tareas = [] }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: false,
        esteMes: false,
        sinFecha: false
    });

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    const renderSeccion = (titulo, tareas, seccionId, icon, bgColor) => (
        <div className="space-y-2">
            <button
                onClick={() => toggleSeccion(seccionId)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{titulo}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tareas.length}
                        </span>
                    </div>
                </div>
                {seccionesAbiertas[seccionId] ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                }
            </button>

            {seccionesAbiertas[seccionId] && (
                <div className="pl-12">
                    {tareas.length > 0 ? (
                        <div className="space-y-2">
                            {tareas.map(tarea => (
                                <div key={tarea.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                                    {/* Contenido de la tarea */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No hay tareas en este período
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            {renderSeccion(
                "Esta semana",
                tareas.filter(t => /* lógica para esta semana */[]),
                "estaSemana",
                <Clock className="h-5 w-5 text-orange-600" />,
                "bg-orange-50"
            )}
            
            {renderSeccion(
                "Este mes",
                tareas.filter(t => /* lógica para este mes */[]),
                "esteMes",
                <Calendar className="h-5 w-5 text-blue-600" />,
                "bg-blue-50"
            )}
            
            {renderSeccion(
                "Sin fecha de entrega",
                tareas.filter(t => /* lógica para sin fecha */[]),
                "sinFecha",
                <AlertCircle className="h-5 w-5 text-gray-600" />,
                "bg-gray-50"
            )}
        </div>
    );
};

export default TareasResumenAlumno;
