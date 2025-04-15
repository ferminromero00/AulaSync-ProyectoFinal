import { useState } from "react"
import { BookOpen, Calendar, FileText, CheckCircle, Plus, X } from "lucide-react"
import { buscarClasePorCodigo } from "../../services/clases"

const DashboardAlumno = () => {
    const [mostrarModal, setMostrarModal] = useState(false)
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")

    const stats = [
        { icon: BookOpen, label: "Clases Inscritas", value: "4", color: "bg-green-100 text-green-600" },
        { icon: FileText, label: "Tareas Pendientes", value: "3", color: "bg-amber-100 text-amber-600" },
        { icon: CheckCircle, label: "Tareas Completadas", value: "12", color: "bg-blue-100 text-blue-600" },
    ]

    const handleBuscarClase = async (e) => {
        e.preventDefault()
        try {
            const data = await buscarClasePorCodigo(codigo)
            console.log('Clase encontrada:', {
                nombre: data.nombre,
                profesor: data.profesor,
                codigo: data.codigoClase
            })
            // También podemos mostrar un mensaje de éxito
            alert(`Clase encontrada: ${data.nombre} - Profesor: ${data.profesor}`)
            setMostrarModal(false)
            setCodigo("")
            setError("")
        } catch (error) {
            setError("Clase no encontrada")
            console.error('Error:', error)
        }
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard del Alumno</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setMostrarModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Unirse a clase</span>
                    </button>
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
