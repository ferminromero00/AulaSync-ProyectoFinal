import { useContext, useState, useEffect } from 'react';
import { getClasesProfesor, eliminarClase, crearClase } from '../../services/clases';
import { BookOpen, Calendar, Users, Clock, MoreVertical, Trash, Plus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            <style>{`
                .animate-fadeIn { animation: fadeSlideIn 0.7s cubic-bezier(.4,1.4,.6,1) forwards; opacity: 0; }
                .animate-fadeIn-1 { animation-delay: 100ms; }
                .animate-fadeIn-2 { animation-delay: 300ms; }
                .animate-fadeIn-3 { animation-delay: 500ms; }
                .animate-fadeIn-4 { animation-delay: 700ms; }
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
                        Mis Clases
                    </h1>
                    <p className="mt-1 text-gray-500 text-lg">
                        Gestiona todas tus clases y sus detalles
                    </p>
                </div>
                <button
                    onClick={() => setMostrarFormulario(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow modern-shadow hover:bg-blue-700 transition-colors text-base font-semibold"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Clase
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn animate-fadeIn-2">
                    {clases.map((clase, index) => (
                        <Link
                            key={clase.id}
                            to={`/profesor/clase/${clase.id}`}
                            className="modern-card modern-shadow group transition-all duration-200 hover:scale-[1.02] relative overflow-hidden opacity-0 animate-fadeIn"
                            style={{ animationDelay: `${300 + index * 100}ms` }}
                        >
                            <div className="p-7">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-3 rounded-xl">
                                            <BookOpen className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900 truncate">{clase.nombre}</h2>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMenuAbierto(menuAbierto === clase.id ? null : clase.id);
                                            }}
                                            className="menu-button p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <MoreVertical className="h-5 w-5 text-gray-500" />
                                        </button>
                                        {menuAbierto === clase.id && (
                                            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEliminarClase(clase.id);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full"
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Eliminar clase
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        <span className="text-sm font-medium">Código: {clase.codigoClase}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <Users className="h-5 w-5" />
                                        <span className="text-sm font-medium">{clase.numEstudiantes} estudiantes</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <Calendar className="h-5 w-5" />
                                        <span className="text-sm font-medium">Creada: {new Date(clase.createdAt).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span className="text-sm font-medium">Última actividad: {clase.ultimaActividad}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            <p>Profesor: <span className="font-medium">{clase.profesor.nombre}</span></p>
                                            <p>Especialidad: <span className="font-medium">{clase.profesor.especialidad || 'No especificada'}</span></p>
                                        </div>
                                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap transition-colors">
                                            Ver detalles →
                                        </span>
                                    </div>
                                </div>
                                {/* Fondo decorativo */}
                                <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                                    <BookOpen className="h-24 w-24" />
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
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Crear Nueva Clase</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la clase
                                </label>
                                <input
                                    type="text"
                                    value={nuevaClase.nombre}
                                    onChange={(e) => setNuevaClase({ ...nuevaClase, nombre: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Crear Clase
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div
                    className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
                    style={{ margin: 0, padding: 0 }}
                >
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4 text-amber-500">
                            <AlertTriangle className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                            ¿Eliminar clase?
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            ¿Estás seguro de que quieres eliminar la clase "{claseSeleccionada?.nombre}"? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminacion}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clases;
