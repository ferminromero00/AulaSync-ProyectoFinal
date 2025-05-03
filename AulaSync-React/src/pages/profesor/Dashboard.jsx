import { BookOpen, Calendar, CheckCircle, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfesorStats, getTareasStats } from "../../services/stats";
import ClasesProfesor from "../../components/profesor/ClasesProfesor";
import TareasResumenProfesor from '../../components/profesor/TareasResumenProfesor';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalClases: 0,
        totalEstudiantes: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [tareasCount, setTareasCount] = useState(0);
    const [tareas, setTareas] = useState([]);

    const loadStats = async () => {
        try {
            const data = await getProfesorStats();
            setStats(data);
            // Obtener el número de tareas
            const tareas = await getTareasStats();
            setTareasCount(tareas.totalTareas || 0);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                // Temporalmente usar un array vacío hasta que el backend esté listo
                setTareas([]);
            } catch (error) {
                console.error('Error al cargar tareas:', error);
            }
        };

        cargarTareas();
    }, []);

    const statsConfig = [
        { 
            icon: BookOpen, 
            label: "Clases Activas", 
            value: stats.totalClases.toString(), 
            color: "bg-gradient-to-br from-blue-500 to-blue-600" 
        },
        { 
            icon: FileText, 
            label: "Tareas", 
            value: tareasCount.toString(), 
            color: "bg-gradient-to-br from-amber-500 to-amber-600" 
        }
    ];

    return (
        <div className="space-y-6">
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

            {/* Stats - Dos tarjetas horizontales, sin grid */}
            <div className="flex w-full gap-4">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        className="relative flex-1 overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`rounded-lg ${stat.color} p-2.5`}>
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Listado de clases */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b border-gray-100">
                        <div className="px-6 py-4">
                            <ClasesProfesor onClaseCreated={loadStats} />
                        </div>
                    </div>
                </div>

                {/* Tareas pendientes */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Tareas Pendientes</h2>
                    <TareasResumenProfesor />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
