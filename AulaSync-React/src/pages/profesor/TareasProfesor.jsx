import { useEffect, useState, useContext, useRef } from "react";
import { getTareasByProfesor } from "../../services/stats";
import { BookOpen, CheckCircle, FileText, ChevronDown, Calendar, ChevronRight, Users, Loader2 } from "lucide-react";
import { GlobalContext } from "../../App";
import { TareaModal, EntregaModal } from "../../components/clase";
import { API_BASE_URL } from "../../config/config";
import { toast } from "react-hot-toast";
import { getClaseById } from "../../services/clases";

/**
 * Página de resumen de tareas del profesor.
 * Muestra todas las tareas creadas por el profesor, permite ver detalles, calificar entregas
 * y acceder a estadísticas de progreso de cada tarea.
 * 
 * @component
 * @returns {JSX.Element} Vista de gestión y resumen de tareas del profesor
 */
const TareasProfesor = () => {
    const { userData } = useContext(GlobalContext);
    const [tareas, setTareas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        todas: true,
        pendientes: false,
        finalizadas: false
    });
    const seccionRefs = {
        todas: useRef(null),
        pendientes: useRef(null),
        finalizadas: useRef(null)
    };
    const [showTareaModal, setShowTareaModal] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [loadingEntregas, setLoadingEntregas] = useState({});
    const [showEntregaModal, setShowEntregaModal] = useState(false);
    const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
    const [notaEdicion, setNotaEdicion] = useState('');
    const [comentarioCorreccionEdicion, setComentarioCorreccionEdicion] = useState('');
    const [isCalificando, setIsCalificando] = useState(false);
    const [claseData, setClaseData] = useState(null);

    // Animación de ticks progresivos para la carga
    const steps = [
        { label: "Cargando tareas...", icon: <FileText className="h-6 w-6 text-blue-400" /> },
        { label: "Cargando panel...", icon: <BookOpen className="h-6 w-6 text-blue-400" /> }
    ];
    const [step, setStep] = useState(0);
    const [dotCount, setDotCount] = useState(0);
    const intervalRef = useRef();
    const dotIntervalRef = useRef();

    useEffect(() => {
        if (isLoading) {
            setStep(0);
            intervalRef.current = setInterval(() => {
                setStep(prev => (prev < steps.length ? prev + 1 : prev));
            }, 600);
            dotIntervalRef.current = setInterval(() => {
                setDotCount(prev => (prev + 1) % 3);
            }, 400);
        }
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(dotIntervalRef.current);
        };
    }, [isLoading]);

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                const tareasData = await getTareasByProfesor();
                setTareas(tareasData);

                if (tareasData.length > 0 && tareasData[0].clase?.id) {
                    const clase = await getClaseById(tareasData[0].clase.id);
                    setClaseData(clase);
                }
            } catch (error) {
                setTareas([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargarTareas();
    }, []);

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
        if (!seccionesAbiertas[seccion] && seccionRefs[seccion] && seccionRefs[seccion].current) {
            setTimeout(() => {
                seccionRefs[seccion].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
    };

    const handleAbrirTarea = async (tarea) => {
        setTareaSeleccionada(tarea);
        setShowTareaModal(true);
        setLoadingEntregas({});
        if (tarea.entregas && tarea.entregas.length > 0) return;
        try {
            setLoadingEntregas({ global: true });
            const res = await fetch(`${API_BASE_URL}/api/tareas/${tarea.id}/entregas`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const entregas = await res.json();
            setTareaSeleccionada(prev => prev ? { ...prev, entregas } : prev);
        } catch (e) {
            toast.error('Error al cargar entregas');
        } finally {
            setLoadingEntregas({});
        }
    };

    const handleOpenEntregaModal = (entrega) => {
        setEntregaSeleccionada(entrega);
        setNotaEdicion(entrega.nota !== undefined && entrega.nota !== null && entrega.nota !== '' ? entrega.nota : '');
        setComentarioCorreccionEdicion(entrega.comentarioCorreccion || '');
        setShowEntregaModal(true);
    };

    const handleCalificarEntrega = async () => {
        if (!entregaSeleccionada || !entregaSeleccionada.id) {
            toast.error('No se puede calificar esta entrega');
            return;
        }
        setIsCalificando(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/entregas/${entregaSeleccionada.id}/calificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    nota: notaEdicion,
                    comentarioCorreccion: comentarioCorreccionEdicion
                })
            });
            if (!res.ok) throw new Error('Error al calificar');
            toast.success('Entrega calificada correctamente');
            setTareaSeleccionada(prev =>
                prev && prev.entregas
                    ? {
                        ...prev,
                        entregas: prev.entregas.map(e =>
                            e.id === entregaSeleccionada.id
                                ? { ...e, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                                : e
                        )
                    }
                    : prev
            );
            setEntregaSeleccionada(prev =>
                prev
                    ? { ...prev, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                    : prev
            );
            setShowEntregaModal(false);
        } catch (e) {
            toast.error('Error al calificar la entrega');
        } finally {
            setIsCalificando(false);
        }
    };

    const renderTarea = (tarea) => (
        <div
            key={tarea.id}
            onClick={() => handleAbrirTarea(tarea)}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 cursor-pointer
                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                hover:border-blue-200 overflow-hidden"
        >
            {/* Efecto de fondo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

            {/* Contenido */}
            <div className="relative">
                {/* Header con título y estado */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-lg truncate group-hover:text-blue-700 transition-colors">
                            {tarea.titulo}
                        </h4>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5
                            ${tarea.entregas?.length === tarea.numEstudiantes 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            <CheckCircle className="h-4 w-4" />
                            {tarea.entregas?.length || 0}/{tarea.numEstudiantes || 0}
                        </span>
                    </div>
                </div>

                {/* Info y fecha */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        {tarea.fechaEntrega ? 
                            new Date(tarea.fechaEntrega).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            })
                            : "Sin fecha límite"}
                    </span>
                    <span className="flex items-center gap-2 text-blue-600">
                        {tarea.clase?.nombre || "Clase"}
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Progreso de entregas</span>
                        <span className="text-blue-600 font-semibold">
                            {Math.round(((tarea.entregas?.length || 0) / (tarea.numEstudiantes || 1)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="h-full transition-all duration-500 rounded-full
                                bg-gradient-to-r from-blue-500 to-indigo-500" 
                            style={{ 
                                width: `${((tarea.entregas?.length || 0) / (tarea.numEstudiantes || 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Footer con acción */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 
                        group-hover:text-blue-800 transition-colors">
                        Ver detalles
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </div>
    );

    const renderSeccion = (titulo, tareasFiltradas, seccion, icon, bgColor) => (
        <div ref={seccionRefs[seccion]} className="space-y-3">
            <button
                onClick={() => toggleSeccion(seccion)}
                className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm 
                hover:shadow-md hover:border-gray-200 transition-all duration-300 ease-in-out
                ${seccionesAbiertas[seccion] ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${bgColor} transform transition-transform duration-200 
                        ${seccionesAbiertas[seccion] ? 'scale-110' : 'scale-100'}`}>
                        {icon}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 text-lg">{titulo}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300
                            ${seccionesAbiertas[seccion]
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'}`}
                        >
                            {tareasFiltradas.length}
                        </span>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${seccionesAbiertas[seccion] ? 'rotate-180' : 'rotate-0'
                    }`}>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out
                ${seccionesAbiertas[seccion]
                    ? 'grid-rows-[1fr] opacity-100 translate-y-0'
                    : 'grid-rows-[0fr] opacity-0 -translate-y-4'}`}
            >
                <div className="overflow-hidden">
                    <div className="space-y-3 pt-2">
                        {tareasFiltradas.length > 0 ? (
                            tareasFiltradas.map(renderTarea)
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100
                                animate-fadeIn">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-bounce" />
                                <p className="text-gray-500">No hay tareas en esta sección</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Panel de carga moderno y animado
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div
                    className={`
                        bg-white rounded-3xl shadow-2xl flex flex-col items-center border border-blue-100 animate-fade-in-up
                        sm:px-[4.5rem] sm:py-16
                        px-5 py-6
                    `}
                    style={{
                        minWidth: window.innerWidth < 640 ? 0 : 420,
                        maxWidth: window.innerWidth < 640 ? 320 : 520,
                        width: window.innerWidth < 640 ? '95vw' : '100%',
                        boxShadow: "0 10px 48px 0 rgba(59,130,246,0.10)",
                        margin: "0 auto"
                    }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Loader2 className={`h-12 w-12 text-blue-500 animate-spin ${window.innerWidth < 640 ? "h-8 w-8" : ""}`} />
                        <span className={`text-2xl font-bold text-blue-900 ${window.innerWidth < 640 ? "text-lg" : ""}`}>AulaSync</span>
                    </div>
                    <div className={`flex flex-col gap-3 min-w-[300px] ${window.innerWidth < 640 ? "min-w-0 items-center text-center w-full" : ""}`}>
                        {steps.map((s, idx) => (
                            <div className={`flex items-center gap-3 ${window.innerWidth < 640 ? "justify-center w-full" : ""}`} key={s.label}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <svg className="text-blue-500 animate-pop" width={window.innerWidth < 640 ? 14 : 18} height={window.innerWidth < 640 ? 14 : 18} fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" fill="#dbeafe"/>
                                            <path d="M7 13l3 3 7-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className={`w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent ${window.innerWidth < 640 ? "w-3 h-3" : ""}`}></span>
                                    </span>
                                )}
                                <span className={`text-blue-800 ${step > idx ? "line-through text-blue-700" : ""} ${window.innerWidth < 640 ? "text-sm" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className={`mt-8 text-blue-700 text-sm flex items-center gap-2 ${window.innerWidth < 640 ? "mt-4 text-xs justify-center w-full text-center" : ""}`}>
                        un momento, cargando resumen de tareas
                        <span className={`inline-block w-6 text-blue-700 font-bold ${window.innerWidth < 640 ? "w-4" : ""}`} style={{ letterSpacing: 1 }}>
                            {".".repeat(dotCount + 1)}
                        </span>
                    </div>
                    <style>{`
                        @keyframes fade-in-up {
                            0% { opacity: 0; transform: translateY(20px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 0.7s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        @keyframes pop {
                            0% { transform: scale(0.7); opacity: 0.5;}
                            60% { transform: scale(1.2);}
                            100% { transform: scale(1); opacity: 1;}
                        }
                        .animate-pop { animation: pop 0.4s; }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Resumen de Tareas</h1>
            </div>
            <div className="space-y-6">
                {renderSeccion("Todas las tareas", tareas, "todas", <BookOpen className="h-5 w-5 text-blue-600" />, "bg-blue-50")}
            </div>
            <TareaModal
                showModal={showTareaModal}
                tarea={tareaSeleccionada}
                role="profesor"
                claseData={claseData}
                onClose={() => setShowTareaModal(false)}
                comentarioEntrega={""}
                setComentarioEntrega={() => {}}
                archivoEntrega={null}
                setArchivoEntrega={() => {}}
                isEntregando={false}
                loadingEntregas={loadingEntregas}
                onOpenEntrega={handleOpenEntregaModal}
                entregaAlumno={null}
                onTareaEntregada={() => {}}
            />
            <EntregaModal
                showModal={showEntregaModal}
                entrega={entregaSeleccionada}
                notaEdicion={notaEdicion}
                setNotaEdicion={setNotaEdicion}
                comentarioCorreccion={comentarioCorreccionEdicion}
                setComentarioCorreccion={setComentarioCorreccionEdicion}
                onClose={() => setShowEntregaModal(false)}
                onCalificar={handleCalificarEntrega}
                isCalificando={isCalificando}
            />
        </div>
    );
};

export default TareasProfesor;
