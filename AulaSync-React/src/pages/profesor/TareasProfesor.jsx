import { useEffect, useState, useContext, useRef } from "react";
import { getTareasByProfesor } from "../../services/stats";
import { BookOpen, CheckCircle, FileText, ChevronDown, Calendar, ChevronRight, Users } from "lucide-react";
import { GlobalContext } from "../../App";
import { TareaModal, EntregaModal } from "../../components/clase";
import { API_BASE_URL } from "../../config/config";
import { toast } from "react-hot-toast";
import { getClaseById } from "../../services/clases";

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <div className="mt-8 px-8 pb-8"> {/* Añadido pb-8 */}
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-blue-900 text-lg">Estado por estudiante</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 max-h-64 overflow-y-auto">
                </div>
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
