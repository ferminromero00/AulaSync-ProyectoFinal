import { BookOpen, Calendar, FileText, CheckCircle } from "lucide-react"

export default function DashboardAlumno() {
    const stats = [
        { icon: BookOpen, label: "Clases Inscritas", value: "4", color: "bg-green-100 text-green-600" },
        { icon: FileText, label: "Tareas Pendientes", value: "3", color: "bg-amber-100 text-amber-600" },
        { icon: CheckCircle, label: "Tareas Completadas", value: "12", color: "bg-blue-100 text-blue-600" },
    ]

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard del Alumno</h1>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {stats.map((stat, index) => (
                    <div key={index} className="rounded-lg border bg-white p-6">
                        <div className="flex items-center">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
