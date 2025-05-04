import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar, AlertCircle, Hourglass } from 'lucide-react';

const TareasResumenAlumno = ({ tareas = [] }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: false,
        esteMes: false,
        proximamente: false,
        sinFecha: false
    });

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    // Lógica de fechas
    const hoy = new Date();
    const finDeSemana = new Date();
    finDeSemana.setDate(hoy.getDate() + (7 - hoy.getDay()));
    const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const dentroDeUnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

    // Filtrado de tareas por sección
    const tareasEstaSemana = tareas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha >= hoy && fecha <= finDeSemana;
    });

    const tareasEsteMes = tareas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeSemana && fecha <= finDeMes;
    });

    const tareasProximamente = tareas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeMes;
    });

    const tareasSinFecha = tareas.filter(t => !t.fechaEntrega);

    const renderSeccion = (titulo, tareas, seccionId, icon, bgColor) => (
        <div className="space-y-2">
            <button
                onClick={() => toggleSeccion(seccionId)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
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

            <div 
                className={`transform transition-all duration-200 ease-in-out overflow-hidden ${
                    seccionesAbiertas[seccionId] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="pl-14 pt-2">
                    {tareas.length > 0 ? (
                        <div className="space-y-3">
                            {tareas.map(tarea => (
                                <div 
                                    key={tarea.id} 
                                    className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-gray-900">
                                            <span className="font-semibold">Título:</span> {tarea.titulo || tarea.contenido}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <span className="font-semibold">Clase:</span> {tarea.clase?.nombre || 'Sin clase'}
                                        </span>
                                        {tarea.fechaEntrega && (
                                            <span className="text-xs text-gray-400">
                                                Entrega: {new Date(tarea.fechaEntrega).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                            No hay tareas en este período
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {renderSeccion(
                "Esta semana",
                tareasEstaSemana,
                "estaSemana",
                <Clock className="h-5 w-5 text-orange-600" />,
                "bg-orange-50"
            )}
            {renderSeccion(
                "Este mes",
                tareasEsteMes,
                "esteMes",
                <Calendar className="h-5 w-5 text-blue-600" />,
                "bg-blue-50"
            )}
            {renderSeccion(
                "Próximamente",
                tareasProximamente,
                "proximamente",
                <Hourglass className="h-5 w-5 text-green-600" />,
                "bg-green-50"
            )}
            {renderSeccion(
                "Sin fecha de entrega",
                tareasSinFecha,
                "sinFecha",
                <AlertCircle className="h-5 w-5 text-gray-600" />,
                "bg-gray-50"
            )}
        </div>
    );
};

export default TareasResumenAlumno;
