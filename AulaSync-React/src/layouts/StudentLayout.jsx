import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, FileText, Settings, LogOut, ChevronRight, ChevronDown, GraduationCap } from 'lucide-react'
import { logout } from '../services/auth'
import { getClasesAlumno } from '../services/clases'
import NotificationButton from '../components/NotificationButton'
import AvatarButton from '../components/AvatarButton'

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isClassesOpen, setIsClassesOpen] = useState(false)
    const [clases, setClases] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const cargarClases = async () => {
            try {
                const data = await getClasesAlumno();
                setClases(data);
            } catch (error) {
                console.error('Error al cargar clases:', error);
            }
        };
        cargarClases();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Overlay para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex h-full flex-col bg-green-900 text-white">
                    <div className="flex h-16 items-center justify-between px-4">
                        <Link to="/alumno/dashboard" className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6" />
                            <span className="text-xl font-bold">AulaSync</span>
                        </Link>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        <Link to="/alumno/dashboard" 
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <BarChart2 className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>

                        {/* Menú desplegable de clases */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsClassesOpen(!isClassesOpen)}
                                className="flex items-center justify-between w-full rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-2">
                                    <GraduationCap className="h-5 w-5" />
                                    <span>Mis Clases</span>
                                </div>
                                <div className="transform transition-transform duration-300">
                                    {isClassesOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </div>
                            </button>

                            {/* Lista de clases con animación */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    isClassesOpen ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="pl-4 space-y-1 py-2">
                                    {clases.length === 0 ? (
                                        <div className="px-4 py-2 text-gray-400 text-sm italic">
                                            No hay clases disponibles
                                        </div>
                                    ) : (
                                        clases.map(clase => (
                                            <Link
                                                key={clase.id}
                                                to={`/alumno/clase/${clase.id}`}
                                                className="flex items-center space-x-2 rounded-lg px-4 py-2.5 text-gray-300 hover:bg-green-800 text-sm group relative overflow-hidden transition-all duration-300 border border-green-800/20"
                                            >
                                                <div className="absolute inset-y-0 left-0 w-1 bg-green-500 transform origin-left scale-y-0 transition-transform group-hover:scale-y-100"></div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-green-400 transition-colors"></div>
                                                    <span className="truncate group-hover:text-white transition-colors">{clase.nombre}</span>
                                                </div>
                                                <span className="ml-auto text-xs bg-green-900/30 px-2 py-0.5 rounded-full group-hover:bg-green-700/50 transition-colors">
                                                    {clase.numEstudiantes} 👥
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link to="/alumno/tareas"
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <FileText className="h-5 w-5" />
                            <span>Tareas</span>
                        </Link>
                    </nav>
                    <div className="border-t border-green-800 p-4 space-y-2">
                        <Link to="/alumno/configuracion"
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <Settings className="h-5 w-5" />
                            <span>Configuración</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-20 bg-white border-b">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
                            >
                                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <span className="text-lg font-semibold">AulaSync</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationButton />
                            <AvatarButton size={40} />
                        </div>
                    </div>
                </header>
                
                <main className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default StudentLayout;
