import { useContext, useState, useEffect } from 'react';
import { getClasesProfesor, eliminarClase, crearClase } from '../../services/clases';
import { Plus, BookOpen, Users, Calendar, ChevronRight, Trash, AlertTriangle, MoreVertical, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GlobalContext } from '../../App';
import "../../styles/animations.css";

const Clases = () => {
    const { userData, setUserData } = useContext(GlobalContext);
    const [clases, setClases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        nombre: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Siempre recarga desde la API al entrar en la página
        const cargarClases = async () => {
            try {
                setIsLoading(true);
                const data = await getClasesProfesor();
                setClases(data);
                // Opcional: actualiza el contexto global para mantenerlo sincronizado
                setUserData(prev => ({ ...prev, clases: data }));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        cargarClases();
    }, [setUserData]);

    const handleEliminarClase = async (claseId) => {
        setClaseSeleccionada(clases.find(clase => clase.id === claseId));
        setMenuAbierto(null);
        setShowConfirmModal(true);
    };

    const confirmarEliminacion = async () => {
        try {
            setIsDeleting(true);
            await eliminarClase(claseSeleccionada.id);
            setClases(prevClases => prevClases.filter(clase => clase.id !== claseSeleccionada.id));
            setShowConfirmModal(false);
            toast.success('Clase eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar la clase:', error);
            toast.error('Error al eliminar la clase');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            const response = await crearClase(nuevaClase);
            setMostrarFormulario(false);
            setNuevaClase({ nombre: '' });
            // Agregar la nueva clase directamente al estado
            setClases(prevClases => [...prevClases, response.clase]);
        } catch (error) {
            console.error('Error al crear la clase:', error);
            alert(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuAbierto && !event.target.closest('.menu-button')) {
                setMenuAbierto(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuAbierto]);

    return (
        <div className="space-y-8 p-6">
            {/* Header con estilo consistente */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn animate-fadeIn-1">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                                 bg-gradient-to-r from-indigo-500 to-blue-600
                                 animate-gradient-x">
                        Mis Clases
                    </h1>
                    <p className="mt-1 text-gray-600 text-lg">
                        Gestiona todas tus clases y sus detalles
                    </p>
                </div>
                <button
                    onClick={() => setMostrarFormulario(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl 
                              hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Nueva Clase</span>
                </button>
            </div>

            {/* Grid de clases con nuevo diseño */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clases.map((clase, index) => (
                        <Link
                            key={clase.id}
                            to={`/profesor/clase/${clase.id}`}
                            className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 
                                     p-6 hover:border-blue-200 transition-all duration-300 hover:shadow-xl
                                     animate-fadeIn"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Botón menú 3 puntitos - Reposicionado arriba a la derecha */}
                            <button
                                type="button"
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-20 menu-button transition-colors"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuAbierto(menuAbierto === clase.id ? null : clase.id);
                                }}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>
                            {/* Menú desplegable alineado a la derecha */}
                            {menuAbierto === clase.id && (
                                <div className="absolute top-14 right-4 bg-white border border-gray-100 rounded-xl shadow-lg z-30 min-w-[160px] animate-fadeIn">
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-t-xl"
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMenuAbierto(null);
                                            navigate(`/profesor/clase/${clase.id}/info`);
                                        }}
                                    >
                                        Ver info clase
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-xl"
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEliminarClase(clase.id);
                                        }}
                                    >
                                        Borrar clase
                                    </button>
                                </div>
                            )}

                            {/* Fondo decorativo */}
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-blue-500/5 
                                          to-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                            
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl
                                                  group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-xl text-gray-900 group-hover:text-blue-600 
                                                 transition-colors">
                                        {clase.nombre}
                                    </h3>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <span className="text-sm font-medium">
                                            Código: {clase.codigoClase}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">{clase.numEstudiantes} estudiantes</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            Creada: {new Date(clase.createdAt).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-gray-900">{clase.profesor.nombre}</p>
                                        <p>Especialidad: {clase.profesor.especialidad || 'No especificada'}</p>
                                    </div>
                                    <span className="text-blue-600 flex items-center gap-1 font-medium">
                                        Ver detalles
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal para crear clase */}
            {mostrarFormulario && (
                <div
                    className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ margin: 0, padding: 0 }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden animate-fadeInUpModal">
                        {/* Header moderno */}
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-t-2xl">
                            <Plus className="h-7 w-7 text-blue-500 animate-fadeIn" />
                            <span className="text-xl font-bold text-blue-900 animate-fadeIn" style={{ animationDelay: '80ms' }}>
                                Crear Nueva Clase
                            </span>
                            <button
                                onClick={() => setMostrarFormulario(false)}
                                className="ml-auto text-gray-400 hover:text-blue-600 rounded-full p-2 transition-colors"
                                disabled={isCreating}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8 bg-white rounded-b-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la clase
                                </label>
                                <input
                                    type="text"
                                    value={nuevaClase.nombre}
                                    onChange={(e) => setNuevaClase({ ...nuevaClase, nombre: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-base placeholder:text-gray-400 transition-shadow"
                                    placeholder="Ej: Matemáticas 2ºA"
                                    required
                                    autoFocus
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="min-w-[120px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2"
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                                            <span>Creando</span>
                                        </>
                                    ) : (
                                        'Crear Clase'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <style>{`
                        @keyframes fadeInUpModal {
                            0% { opacity: 0; transform: translateY(40px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fadeInUpModal {
                            animation: fadeInUpModal 0.5s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.4s both;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(16px);}
                            to { opacity: 1; transform: none;}
                        }
                    `}</style>
                </div>
            )}

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden animate-fadeInUpModal">
                        <div className="flex flex-col items-center gap-4 px-8 py-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-full shadow-lg animate-bounce">
                                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 text-center">¿Eliminar clase?</h3>
                            <p className="text-gray-600 text-center">
                                ¿Estás seguro de que quieres eliminar la clase "<span className="font-semibold text-amber-700">{claseSeleccionada?.nombre}</span>"? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3 w-full mt-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarEliminacion}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                                            <span>Eliminando</span>
                                        </>
                                    ) : (
                                        'Eliminar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeInUpModal {
                            0% { opacity: 0; transform: translateY(40px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fadeInUpModal {
                            animation: fadeInUpModal 0.5s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        .animate-bounce {
                            animation: bounce 0.7s;
                        }
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0);}
                            50% { transform: translateY(-10px);}
                        }
                        .animate-ping {
                            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                        }
                        @keyframes ping {
                            0% { transform: scale(1); opacity: 1;}
                            75%, 100% { transform: scale(1.5); opacity: 0;}
                        }
                    `}</style>
                </div>
            )}

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
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Clases;
