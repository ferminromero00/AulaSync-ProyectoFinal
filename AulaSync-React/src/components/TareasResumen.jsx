import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

const TareasResumen = ({ tareas }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: true,
        esteMes: true,
        sinFecha: true
    });

    const [mounted, setMounted] = useState(false);

    const seccionRefs = {
        estaSemana: useRef(null),
        esteMes: useRef(null),
        sinFecha: useRef(null)
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));

        // Si estamos abriendo la sección, hacemos scroll
        if (!seccionesAbiertas[seccion]) {
            setTimeout(() => {
                seccionRefs[seccion].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
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
            <div 
                ref={seccionRefs[seccion]}
                className={`mb-4 opacity-0 translate-y-8
                    ${mounted ? 'animate-fadeSlideIn' : ''}`}
                style={{
                    animationDelay: seccion === 'estaSemana' ? '200ms' : 
                                  seccion === 'esteMes' ? '400ms' : '600ms'
                }}
            >
                <button
                    onClick={() => toggleSeccion(seccion)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 
                             transition-all duration-300 hover:shadow-md"
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
                        {tareas.map((tarea, index) => (
                            <div
                                key={tarea.id}
                                className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 
                                         transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                style={{
                                    animation: `slideIn 0.5s ease-out forwards`,
                                    animationDelay: `${index * 100}ms`,
                                    opacity: 0
                                }}
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
        <div className="h-[calc(100vh-theme(space.20))] overflow-y-auto px-4">
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeSlideIn {
                    animation: fadeSlideIn 0.8s ease-out forwards;
                }
            `}</style>
            {renderSeccion('Esta semana', tareasOrganizadas.estaSemana, 'estaSemana')}
            {renderSeccion('Este mes', tareasOrganizadas.esteMes, 'esteMes')}
            {renderSeccion('Sin fecha de entrega', tareasOrganizadas.sinFecha, 'sinFecha')}
        </div>
    );
};

export default TareasResumen;
