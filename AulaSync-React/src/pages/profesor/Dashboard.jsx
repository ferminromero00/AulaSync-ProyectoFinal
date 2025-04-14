import { BookOpen, Calendar, CheckCircle, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfesorStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalClases: 0,
        totalEstudiantes: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadStats = async () => {
        try {
            const data = await getProfesorStats();
            setStats(data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const statsConfig = [
        { 
            icon: BookOpen, 
            label: "Clases Activas", 
            value: stats.totalClases.toString(), 
            color: "bg-gradient-to-br from-blue-500 to-blue-600" 
        },
        { 
            icon: Users, 
            label: "Total Estudiantes", 
            value: stats.totalEstudiantes.toString(), 
            color: "bg-gradient-to-br from-emerald-500 to-emerald-600" 
        },
        { 
            icon: FileText, 
            label: "Tareas", 
            value: "18", 
            color: "bg-gradient-to-br from-amber-500 to-amber-600" 
        },
        { 
            icon: CheckCircle, 
            label: "Por Calificar", 
            value: "7", 
            color: "bg-gradient-to-br from-purple-500 to-purple-600" 
        },
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Dashboard del Profesor
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Bienvenido de nuevo, aquí está el resumen de tu actividad
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, index) => (
                    <div key={index} 
                         className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className={`absolute top-0 left-0 h-1 w-full ${stat.color}`} />
                        <div className="flex items-center gap-4">
                            <div className={`rounded-lg ${stat.color} p-3`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-8 w-16 animate-pulse bg-gray-200 rounded"></div>
                                    ) : (
                                        stat.value
                                    )}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Classes Section */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="border-b border-gray-100">
                    <div className="px-6 py-4">
                        <ClasesProfesor onClaseCreated={loadStats} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
