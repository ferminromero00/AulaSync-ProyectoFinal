import { BookOpen, Calendar, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getProfesorStats, getTareasStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";
import { useNavigate } from "react-router-dom";
import "../../styles/animations.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const clasesRef = useRef(null);
    const [stats, setStats] = useState({
        totalClases: 0,
        totalEstudiantes: 0
    });
    const [tareasCount, setTareasCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    // Cargar estadísticas en paralelo, pero no bloquear el resto del dashboard
    useEffect(() => {
        let mounted = true;
        setStatsLoading(true);
        Promise.all([
            getProfesorStats(),
            getTareasStats()
        ]).then(([statsData, tareasData]) => {
            if (mounted) {
                setStats(statsData);
                setTareasCount(tareasData.totalTareas || 0);
            }
        }).catch((error) => {
            console.error('Error al cargar estadísticas:', error);
        }).finally(() => {
            if (mounted) setStatsLoading(false);
        });
        return () => { mounted = false; };
    }, []);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        onClick={stat.onClick}
                        className={`group relative overflow-hidden rounded-2xl ${stat.bg} p-8
                                  border border-gray-100 shadow-xl shadow-gray-200/50
                                  hover:shadow-2xl hover:shadow-indigo-200/50
                                  transform transition-all duration-300 ease-out
                                  animate-fade-in-up cursor-pointer
                                  hover:scale-[1.02]`}
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`rounded-2xl ${stat.iconBg} p-4 
                                          group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-sm font-medium px-3 py-1 rounded-full
                                         bg-white/80 text-gray-700 backdrop-blur-sm">
                                Actualizado hoy
                            </span>
                        </div>
                        <div className="mt-6 space-y-1">
                            <h3 className={`text-5xl font-bold ${stat.valueColor}`}>
                                {statsLoading ? (
                                    <div className="h-12 w-24 bg-gray-200/50 rounded-lg animate-pulse" />
                                ) : (
                                    stat.value
                                )}
                            </h3>
                            <p className="text-base font-medium text-gray-600">{stat.label}</p>
                        </div>
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full
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
