import { useEffect, useState, useRef } from "react";
import { getTareasByAlumno } from "../../services/stats";
import TareasResumenAlumno from "../../components/alumno/TareasResumenAlumno";
import { BookOpen, Loader2, FileText } from "lucide-react"; // <--- Añade FileText aquí
import { useLocation } from "react-router-dom";

const TareasAlumno = () => {
    const [tareas, setTareas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const [tareaIdToOpen, setTareaIdToOpen] = useState(null);

    // Animación de ticks progresivos para la carga
    const steps = [
        { label: "Cargando tus tareas...", icon: <BookOpen className="h-6 w-6 text-green-400" /> },
        { label: "Cargando panel...", icon: <FileText className="h-6 w-6 text-green-400" /> }
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
        // Leer tareaId de la query string
        const params = new URLSearchParams(location.search);
        const tareaId = params.get('tareaId');
        if (tareaId) setTareaIdToOpen(tareaId);
    }, [location.search]);

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                const tareasData = await getTareasByAlumno();
                // Transform data to match the expected format
                const formattedTareas = tareasData.map(tarea => ({
                    ...tarea,
                    contenido: tarea.contenido || '',
                    createdAt: tarea.createdAt || new Date().toISOString()
                }));
                setTareas(formattedTareas);
            } catch (error) {
                console.error("Error al cargar tareas:", error);
                setTareas([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargarTareas();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div
                    className="bg-white rounded-3xl shadow-2xl flex flex-col items-center border border-green-100 animate-fade-in-up"
                    style={{
                        padding: "4rem 4.5rem",
                        minWidth: 420,
                        maxWidth: 520,
                        width: "100%",
                        boxShadow: "0 10px 48px 0 rgba(16,185,129,0.10)",
                        margin: "0 auto"
                    }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                        <span className="text-2xl font-bold text-green-900">AulaSync</span>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[300px]">
                        {steps.map((s, idx) => (
                            <div className="flex items-center gap-3" key={s.label}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <svg className="text-green-500 animate-pop" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" fill="#bbf7d0"/>
                                            <path d="M7 13l3 3 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin"></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent"></span>
                                    </span>
                                )}
                                <span className={`text-green-800 ${step > idx ? "line-through text-green-700" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-green-700 text-sm flex items-center gap-2">
                        Un momento, cargando tus tareas
                        <span className="inline-block w-6 text-green-700 font-bold" style={{ letterSpacing: 1 }}>
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
                <h1 className="text-2xl font-bold text-gray-900">Tus Tareas</h1>
            </div>
            <TareasResumenAlumno tareas={tareas} tareaIdToOpen={tareaIdToOpen} />
        </div>
    );
};

export default TareasAlumno;
