import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

const TareasResumen = ({ tareas }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: true,
        esteMes: true,
        sinFecha: true
    });

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    const hoy = new Date();
    const finDeSemana = new Date();
    finDeSemana.setDate(hoy.getDate() + (7 - hoy.getDay()));
    
    const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const tareasOrganizadas = {
        estaSemana: tareas.filter(tarea => {
            const fechaTarea = new Date(tarea.fechaEntrega);
            return fechaTarea <= finDeSemana && fechaTarea >= hoy;
        }),
        esteMes: tareas.filter(tarea => {
            const fechaTarea = new Date(tarea.fechaEntrega);
            return fechaTarea > finDeSemana && fechaTarea <= finDeMes;
        }),
        sinFecha: tareas.filter(tarea => !tarea.fechaEntrega)
    };

    const renderSeccion = (titulo, tareas, seccion) => {
        const abierto = seccionesAbiertas[seccion];
        return (
            <div className="mb-4">
                <button
                    onClick={() => toggleSeccion(seccion)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                >
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{titulo}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tareas.length}
                        </span>
                    </div>
                    {abierto ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </button>
                {abierto && tareas.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {tareas.map(tarea => (
                            <div
                                key={tarea.id}
                                className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors"
                            >
                                <h4 className="font-medium text-gray-900">{tarea.titulo}</h4>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-500">
                                        {tarea.clase.nombre}
                                    </span>
                                    {tarea.fechaEntrega && (
                                        <span className="text-sm text-gray-500">
                                            Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {abierto && tareas.length === 0 && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                        No hay tareas en este período
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {renderSeccion('Esta semana', tareasOrganizadas.estaSemana, 'estaSemana')}
            {renderSeccion('Este mes', tareasOrganizadas.esteMes, 'esteMes')}
            {renderSeccion('Sin fecha de entrega', tareasOrganizadas.sinFecha, 'sinFecha')}
        </div>
    );
};

export default TareasResumen;
