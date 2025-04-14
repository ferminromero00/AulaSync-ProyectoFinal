import { BookOpen, Calendar, CheckCircle, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfesorStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";

function Dashboard() {
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
            color: "bg-blue-100 text-blue-600" 
        },
        { 
            icon: Users, 
            label: "Total Estudiantes", 
            value: stats.totalEstudiantes.toString(), 
            color: "bg-green-100 text-green-600" 
        },
        { 
            icon: FileText, 
            label: "Tareas", 
            value: "18", 
            color: "bg-amber-100 text-amber-600" 
        },
        { 
            icon: CheckCircle, 
            label: "Por Calificar", 
            value: "7", 
            color: "bg-purple-100 text-purple-600" 
        },
    ];

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard del Profesor</h1>
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                {statsConfig.map((stat, index) => (
                    <div key={index} className="rounded-lg border bg-white p-6">
                        <div className="flex items-center">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold">
                                    {isLoading ? "..." : stat.value}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Classes Grid */}
            <div className="flex justify-center w-full">
                <div className="w-full max-w-7xl">
                    <ClasesProfesor onClaseCreated={loadStats} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard;
