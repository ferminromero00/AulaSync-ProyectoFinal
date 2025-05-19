import { BookOpen, Calendar, FileText } from "lucide-react";
import { useEffect, useState, useRef, useContext } from "react";
import { getProfesorStats, getTareasStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";
import { useNavigate } from "react-router-dom";
import "../../styles/animations.css";
import { GlobalContext } from '../../App';
import { Loader2, Users, BarChart2 } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const clasesRef = useRef(null);
    const { userData, setUserData } = useContext(GlobalContext);
    const [stats, setStats] = useState({
        totalClases: 0,
        totalEstudiantes: 0
    });
    const [tareasCount, setTareasCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    // Animación de ticks progresivos (hooks siempre arriba)
    const steps = [
        { label: "Cargando tus clases...", icon: <BookOpen className="h-6 w-6 text-violet-400" /> },
        { label: "Cargando tu perfil...", icon: <Users className="h-6 w-6 text-violet-400" /> },
        { label: "Cargando notificaciones...", icon: <BarChart2 className="h-6 w-6 text-violet-400" /> }
    ];
    const [step, setStep] = useState(0);
    const [dotCount, setDotCount] = useState(0);
    const intervalRef = useRef();
    const dotIntervalRef = useRef();

    useEffect(() => {
        if (statsLoading) {
            setStep(0);
            intervalRef.current = setInterval(() => {
                setStep(prev => (prev < steps.length ? prev + 1 : prev));
            }, 500);
            dotIntervalRef.current = setInterval(() => {
                setDotCount(prev => (prev + 1) % 3);
            }, 400);
        }
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(dotIntervalRef.current);
        };
    }, [statsLoading]);

    useEffect(() => {
        let mounted = true;
        
        const loadInitialData = async () => {
            if (!mounted) return;
            
            try {
                setStatsLoading(true);
                const [statsData, tareasData] = await Promise.all([
                    getProfesorStats(),
                    getTareasStats()
                ]);
                
                if (!mounted) return;
                
                setStats(statsData || { totalClases: 0, totalEstudiantes: 0 });
                setTareasCount(tareasData?.totalTareas || 0);
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            } finally {
                if (mounted) {
                    setStatsLoading(false);
                    // También actualizar el estado global de loading
                    setUserData(prev => ({ ...prev, loading: false }));
                }
            }
        };

        loadInitialData();
        return () => { mounted = false; };
    }, [setUserData]);

    const statsConfig = [
        { 
            icon: BookOpen, 
            label: "Clases Activas", 
            value: stats.totalClases.toString(),
            color: "from-violet-500 to-purple-500",
            bg: "bg-gradient-to-br from-violet-50 to-purple-50",
            iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
            valueColor: "text-violet-700",
            onClick: () => {
                clasesRef.current?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },
        { 
            icon: FileText, 
            label: "Tareas", 
            value: tareasCount.toString(),
            color: "from-pink-500 to-rose-500",
            bg: "bg-gradient-to-br from-pink-50 to-rose-50",
            iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
            valueColor: "text-pink-700",
            onClick: () => navigate('/profesor/tareas')
        }
    ];

    if (statsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-violet-50 via-white to-purple-50">
                <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center border border-violet-100 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
                        <span className="text-2xl font-bold text-violet-900">AulaSync</span>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[300px]">
                        {steps.map((s, idx) => (
                            <div className="flex items-center gap-3" key={s.label}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <svg className="text-violet-500 animate-pop" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" fill="#ddd6fe"/>
                                            <path d="M7 13l3 3 7-7" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-violet-600 border-t-transparent animate-spin"></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent"></span>
                                    </span>
                                )}
                                <span className={`text-violet-800 ${step > idx ? "line-through text-violet-700" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-violet-700 text-sm flex items-center gap-2">
                        ¡Bienvenido a AulaSync! Preparando tu espacio
                        <span className="inline-block w-6 text-violet-700 font-bold" style={{ letterSpacing: 1 }}>
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

    if (userData?.loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center border border-blue-100 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <span className="text-2xl font-bold text-blue-900">AulaSync</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-blue-400 animate-pulse" />
                            <span className="text-blue-800 font-medium">Cargando tus clases...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-400 animate-pulse" />
                            <span className="text-blue-800 font-medium">Cargando estudiantes...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-6 w-6 text-blue-400 animate-pulse" />
                            <span className="text-blue-800 font-medium">Cargando estadísticas...</span>
                        </div>
                    </div>
                    <div className="mt-8 text-blue-700 text-sm opacity-70">
                        ¡Bienvenido a AulaSync! Preparando tu espacio...
                    </div>
                </div>
                <style>{`
                    @keyframes fade-in-up {
                        0% { opacity: 0; transform: translateY(20px);}
                        100% { opacity: 1; transform: translateY(0);}
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.7s cubic-bezier(.4,1.4,.6,1) both;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header Section con nueva animación */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6
                          animate-fade-in-up">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                                 bg-gradient-to-r from-indigo-500 to-blue-600
                                 animate-gradient-x">
                        Dashboard del Profesor
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Bienvenido de nuevo, aquí está el resumen de tu actividad
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl
                              shadow-lg shadow-indigo-100/50 transform hover:scale-105
                              transition-all duration-300">
                    <Calendar className="h-6 w-6 text-indigo-500" />
                    <span className="text-lg text-gray-700 font-medium">
                        {new Date().toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Stats Cards con nueva disposición y animaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        onClick={stat.onClick}
                        className={`group relative overflow-hidden rounded-3xl ${stat.bg} p-10
                                  border border-gray-100 shadow-2xl shadow-indigo-200/40
                                  hover:shadow-2xl hover:shadow-indigo-300/60
                                  transform transition-all duration-300 ease-out
                                  animate-fade-in-up cursor-pointer
                                  hover:scale-[1.035]`}
                        style={{ animationDelay: `${index * 150}ms`, minHeight: '180px' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`rounded-2xl ${stat.iconBg} p-5 
                                          group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="h-10 w-10 text-white" />
                            </div>
                            <span className="text-base font-medium px-4 py-1 rounded-full
                                         bg-white/80 text-gray-700 backdrop-blur-sm">
                                Actualizado hoy
                            </span>
                        </div>
                        <div className="mt-8 space-y-2">
                            <h3 className={`text-6xl font-bold ${stat.valueColor}`}>
                                {statsLoading ? (
                                    <div className="h-14 w-28 bg-gray-200/50 rounded-lg animate-pulse" />
                                ) : (
                                    stat.value
                                )}
                            </h3>
                            <p className="text-lg font-medium text-gray-600">{stat.label}</p>
                        </div>
                        <div className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full
                                      bg-gradient-to-br ${stat.color} opacity-10
                                      group-hover:scale-150 transition-transform duration-500`} />
                    </div>
                ))}
            </div>

            {/* Clases Section con nueva presentación */}
            <div ref={clasesRef} className="bg-white rounded-2xl p-8 shadow-xl shadow-indigo-100/10
                          animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <ClasesProfesor onClaseCreated={() => {}} />
            </div>

            <style>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 15s ease infinite;
                }
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
