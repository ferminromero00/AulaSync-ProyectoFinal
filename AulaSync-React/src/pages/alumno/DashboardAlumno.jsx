import { useState, useEffect } from "react"
import { BookOpen, Calendar, FileText, CheckCircle, Plus, X, MoreVertical, LogOut, AlertTriangle } from "lucide-react"
import { buscarClasePorCodigo, unirseAClase, getClasesAlumno, salirDeClase } from "../../services/clases"
import { Link, useNavigate } from "react-router-dom"

const DashboardAlumno = () => {
    const [mostrarModal, setMostrarModal] = useState(false)
    const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false)
    const [claseParaUnirse, setClaseParaUnirse] = useState(null)
    const [codigo, setCodigo] = useState("")
    const [error, setError] = useState("")
    const [clases, setClases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
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
            setClaseParaUnirse(data)
            setShowJoinConfirmModal(true)
            setError("")
        } catch (error) {
            setError("Clase no encontrada")
            console.error('Error:', error)
        }
    }

    const handleConfirmJoin = async () => {
        try {
            const response = await unirseAClase(claseParaUnirse.codigoClase)
            navigate(`/alumno/clase/${response.claseId}`);
            setMostrarModal(false)
            setShowJoinConfirmModal(false)
            setCodigo("")
            setClaseParaUnirse(null)
            setNotification({
                show: true,
                message: 'Te has unido a la clase exitosamente',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                show: true,
                message: error.message || 'Error al unirse a la clase',
                type: 'error'
            });
        }
    }

    const handleMenuClick = (claseId) => {
        setMenuAbierto(claseId === menuAbierto ? null : claseId)
    }

    const handleSalirClase = async (claseId) => {
        try {
            await salirDeClase(claseId);
            
            // Actualizar el estado local eliminando la clase
            setClases(prevClases => prevClases.filter(clase => clase.id !== claseId));
            
            setMenuAbierto(null);
            setShowConfirmModal(false);
            setNotification({
                show: true,
                message: 'Has salido de la clase exitosamente',
                type: 'success'
            });
            
            // Ocultar la notificación después de 3 segundos
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error al salir de la clase:', error);
            setNotification({
                show: true,
                message: error.message || 'Error al salir de la clase',
                type: 'error'
            });
            setShowConfirmModal(false);
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
                        <div key={clase.id} className="relative block bg-gray-50 rounded-lg p-5 transition-all hover:bg-gray-100">
                            <Link
                                to={`/alumno/clase/${clase.id}`}
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
                            {/* Botón de menú mejorado */}
                            <button
                                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                onClick={() => handleMenuClick(clase.id)}
                                aria-label="Opciones de clase"
                            >
                                <MoreVertical className="h-5 w-5 text-gray-500" />
                            </button>
                            
                            {/* Menú desplegable mejorado */}
                            {menuAbierto === clase.id && (
                                <div className="absolute top-12 right-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                                    <button
                                        className="w-full px-4 py-2 text-left flex items-center space-x-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setClaseSeleccionada(clase);
                                            setShowConfirmModal(true);
                                            setMenuAbierto(null);
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Salir de la clase</span>
                                    </button>
                                </div>
                            )}
                            
                            {/* Overlay para cerrar el menú al hacer clic fuera */}
                            {menuAbierto === clase.id && (
                                <div 
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuAbierto(null)}
                                />
                            )}
                        </div>
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

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-amber-500">
                            <AlertTriangle className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Confirmar salida?
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            ¿Estás seguro de que quieres salir de la clase "{claseSeleccionada?.nombre}"?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSalirClase(claseSeleccionada?.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para unirse */}
            {showJoinConfirmModal && claseParaUnirse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-green-500">
                            <BookOpen className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Unirse a la clase?
                        </h3>
                        <p className="text-gray-600 text-center mb-2">
                            ¿Quieres unirte a la clase "{claseParaUnirse.nombre}"?
                        </p>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Profesor: {claseParaUnirse.profesor}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowJoinConfirmModal(false)
                                    setClaseParaUnirse(null)
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmJoin}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación tipo toast */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 z-50 ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white px-6 py-3 rounded-lg shadow-lg transition-all transform translate-y-0`}>
                    <div className="flex items-center space-x-2">
                        <span>{notification.message}</span>
                        <button 
                            onClick={() => setNotification({ show: false, message: '', type: '' })}
                            className="ml-2 hover:text-gray-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardAlumno;
