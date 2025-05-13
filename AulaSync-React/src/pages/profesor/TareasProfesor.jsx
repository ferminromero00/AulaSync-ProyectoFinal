import { useEffect, useState, useContext, useRef } from "react";
import { getTareasByProfesor } from "../../services/stats";
import { BookOpen, CheckCircle, FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
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

    const tareasPendientes = tareas.filter(t =>
        t.tipo === "tarea" &&
        Array.isArray(t.entregas) &&
        (
            t.entregas.length < (t.numEstudiantes || 0) ||
            t.entregas.some(e => e.nota === undefined || e.nota === null || e.nota === "")
        )
    );
    const tareasFinalizadas = tareas.filter(t =>
        t.tipo === "tarea" &&
        Array.isArray(t.entregas) &&
        t.entregas.length === (t.numEstudiantes || 0) &&
        t.entregas.every(e => e.nota !== undefined && e.nota !== null && e.nota !== "")
    );

    const renderTarea = (tarea) => (
        <div
            key={tarea.id}
            className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors mb-2 cursor-pointer"
            onClick={() => handleAbrirTarea(tarea)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{tarea.titulo || tarea.contenido}</h4>
                </div>
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    {tarea.entregas?.length || 0}/{tarea.numEstudiantes || 0} entregas
                </span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{tarea.clase?.nombre || "Clase"}</span>
                <span className="text-gray-500">
                    Límite: {tarea.fechaEntrega ? new Date(tarea.fechaEntrega).toLocaleDateString() : "Sin fecha"}
                </span>
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
                    : 'grid-rows-[0fr] opacity-0 -translate-y-4'}
            `}>
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
                {renderSeccion("Pendientes de calificar", tareasPendientes, "pendientes", <AlertCircle className="h-5 w-5 text-amber-600" />, "bg-amber-50")}
                {renderSeccion("Finalizadas", tareasFinalizadas, "finalizadas", <CheckCircle className="h-5 w-5 text-green-600" />, "bg-green-50")}
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
