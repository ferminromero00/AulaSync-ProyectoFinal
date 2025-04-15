import { useState, useEffect } from "react"
import { BookOpen, Calendar, FileText, CheckCircle, Plus, X } from "lucide-react"
import { buscarClasePorCodigo, unirseAClase, getClasesAlumno } from "../../services/clases"
import { Link, useNavigate } from "react-router-dom"

const DashboardAlumno = () => {
    const [mostrarModal, setMostrarModal] = useState(false)
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [clases, setClases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const stats = [
        { 
            icon: BookOpen, 
            label: "Clases Inscritas", 
            value: clases.length,
            color: "bg-green-100 text-green-600" 
        },
        { 
            icon: FileText, 
            label: "Tareas Pendientes", 
            value: "3", 
            color: "bg-amber-100 text-amber-600" 
        },
        { 
            icon: CheckCircle, 
            label: "Tareas Completadas", 
            value: "12", 
            color: "bg-blue-100 text-blue-600" 
        },
    ]

    const handleBuscarClase = async (e) => {
        e.preventDefault()
        try {
            const data = await buscarClasePorCodigo(codigo)
            if (window.confirm(`¿Quieres unirte a la clase "${data.nombre}" de ${data.profesor}?`)) {
                const response = await unirseAClase(data.codigoClase)
                // Redirigir a la clase después de unirse
                navigate(`/alumno/clase/${response.claseId}`);
                setMostrarModal(false)
                setCodigo("")
                setError("")
            }
        } catch (error) {
            setError("Clase no encontrada")
            console.error('Error:', error)
        }
    }

    useEffect(() => {
        const cargarClases = async () => {
            try {
                const data = await getClasesAlumno();
                setClases(data);
            } catch (error) {
                console.error('Error al cargar clases del alumno:', error);
            } finally {
                setIsLoading(false);
            }
        };
        cargarClases();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header con bienvenida y botón de unirse */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu Dashboard</h1>
                    <p className="text-gray-600">Gestiona tus clases y actividades</p>
                </div>
                <button
                    onClick={() => setMostrarModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Unirse a clase
                </button>
            </div>

            {/* Stats en cards más atractivas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} 
                         className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Listado de clases con nuevo diseño */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Mis Clases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clases.length > 0 ? clases.map(clase => (
                        <Link
                            key={clase.id}
                            to={`/alumno/clase/${clase.id}`}
                            className="block bg-gray-50 rounded-lg p-5 transition-all hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-medium text-gray-900">{clase.nombre}</h3>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>Profesor: {clase.profesor}</p>
                                <p>Estudiantes: {clase.numEstudiantes}</p>
                                <p>Código: {clase.codigoClase}</p>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No estás inscrito en ninguna clase</p>
                            <p className="text-sm">Usa el botón "Unirse a clase" para empezar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para unirse a clase */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Unirse a una clase</h3>
                            <button 
                                onClick={() => setMostrarModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleBuscarClase} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código de la clase
                                </label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Introduce el código"
                                    required
                                />
                                {error && (
                                    <p className="mt-1 text-sm text-red-600">{error}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Buscar clase
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardAlumno;
