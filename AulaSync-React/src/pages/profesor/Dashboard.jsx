import { BookOpen, Calendar, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfesorStats, getTareasStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";
import "../../styles/animations.css";

const Dashboard = () => {
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
            color: "from-blue-500 to-blue-400",
            bg: "bg-gradient-to-br from-blue-100 to-blue-50",
            iconBg: "bg-gradient-to-br from-blue-500 to-blue-400"
        },
        { 
            icon: FileText, 
            label: "Tareas", 
            value: tareasCount.toString(), 
            color: "from-amber-500 to-amber-400",
            bg: "bg-gradient-to-br from-amber-100 to-amber-50",
            iconBg: "bg-gradient-to-br from-amber-500 to-amber-400"
        }
    ];

    return (
        <div className="space-y-10">
            <style>{`
                .modern-shadow {
                    box-shadow: 0 4px 24px 0 rgba(30, 64, 175, 0.07), 0 1.5px 6px 0 rgba(30, 64, 175, 0.03);
                }
                .modern-card {
                    border-radius: 1.25rem;
                    background: white;
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .modern-card:hover {
                    box-shadow: 0 8px 32px 0 rgba(30, 64, 175, 0.13), 0 3px 12px 0 rgba(30, 64, 175, 0.06);
                    transform: translateY(-2px) scale(1.01);
                }
            `}</style>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn animate-fadeIn-1">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard del Profesor
                    </h1>
                    <p className="mt-1 text-gray-500 text-lg">
                        Bienvenido de nuevo, aquí está el resumen de tu actividad
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow modern-shadow">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-base text-gray-700 font-medium">
                        {new Date().toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Stats - Tarjetas modernas */}
            <div className="flex w-full gap-8 animate-fadeIn animate-fadeIn-2">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        className={`flex-1 modern-card modern-shadow ${stat.bg} p-7 flex items-center gap-5 relative overflow-hidden`}
                        style={{ minWidth: 0 }}
                    >
                        <div className={`rounded-xl ${stat.iconBg} p-4 shadow-lg`}>
                            <stat.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-500">{stat.label}</p>
                            {statsLoading ? (
                                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                            ) : (
                                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</h3>
                            )}
                        </div>
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                            <stat.icon className="h-20 w-20" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Resumen de Clases ocupa todo el ancho, se muestra siempre */}
            <div className="animate-fadeIn animate-fadeIn-3">
                <ClasesProfesor onClaseCreated={() => {}} />
            </div>
        </div>
    );
}

export default Dashboard;
