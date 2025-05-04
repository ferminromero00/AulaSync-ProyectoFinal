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
                <div className="flex h-full flex-col bg-gradient-to-b from-green-900 to-green-800 text-white">
                    {/* Logo y título */}
                    <div className="flex h-16 items-center gap-2 px-6 border-b border-green-700/50">
                        <BookOpen className="h-7 w-7 text-green-400" />
                        <span className="text-xl font-bold tracking-wider text-white/90">AulaSync</span>
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex-1 space-y-2 px-3 py-4">
                        {/* Dashboard link */}
                        <Link to="/alumno/dashboard" 
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-green-700/20 bg-green-800/20 hover:bg-green-600/30 hover:text-white hover:border-green-400 hover:shadow-md hover:shadow-green-500/20 transition-all duration-200">
                            <BarChart2 className="h-5 w-5 text-green-300" />
                            <span className="font-medium">Dashboard</span>
                        </Link>

                        {/* Sección de Mis Clases */}
                        <div className="space-y-2 pt-1">
                            <button
                                onClick={() => setIsClassesOpen(!isClassesOpen)}
                                className="flex w-full items-center justify-between px-4 py-3 text-gray-300 rounded-lg border border-green-700/20 bg-green-800/20 hover:bg-green-600/30 hover:text-white hover:border-green-400 hover:shadow-md hover:shadow-green-500/20 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5 text-green-400" />
                                    <span className="font-medium">Mis Clases</span>
                                </div>
                                <div className="transform transition-transform duration-200">
                                    {isClassesOpen ? (
                                        <ChevronDown className="h-4 w-4 opacity-70" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 opacity-70" />
                                    )}
                                </div>
                            </button>

                            {/* Lista de clases con animación mejorada */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isClassesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="pl-11 pr-3 space-y-1 border-l-2 border-green-700/20 ml-6">
                                    {clases.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-green-400/60 italic">
                                            No hay clases disponibles
                                        </div>
                                    ) : (
                                        clases.map(clase => (
                                            <Link
                                                key={clase.id}
                                                to={`/alumno/clase/${clase.id}`}
                                                className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 rounded-lg border border-green-700/10 bg-green-800/10 hover:bg-green-600/30 hover:text-white hover:border-green-400 hover:shadow-sm hover:shadow-green-500/20 group/item relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="h-2 w-2 rounded-full bg-green-500/50 group-hover/item:bg-green-400"></div>
                                                    <span className="truncate group-hover/item:text-white transition-colors">
                                                        {clase.nombre}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-green-400/70 bg-green-800/30 px-2 py-0.5 rounded-full">
                                                    {clase.numEstudiantes} 👥
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tareas link */}
                        <Link to="/alumno/tareas"
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-green-700/20 bg-green-800/20 hover:bg-green-600/30 hover:text-white hover:border-green-400 hover:shadow-md hover:shadow-green-500/20 transition-all duration-200">
                            <FileText className="h-5 w-5 text-green-300" />
                            <span className="font-medium">Tareas</span>
                        </Link>
                    </nav>

                    {/* Footer navigation */}
                    <div className="border-t border-green-700/50 p-4 space-y-2">
                        <Link to="/alumno/configuracion"
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-green-700/20 bg-green-800/20 hover:bg-green-600/30 hover:text-white hover:border-green-400 hover:shadow-md hover:shadow-green-500/20 transition-all duration-200">
                            <Settings className="h-5 w-5 text-green-300" />
                            <span className="font-medium">Configuración</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-red-700/20 bg-red-900/10 hover:bg-red-500/20 hover:border-red-400 hover:text-red-100 hover:shadow-md hover:shadow-red-500/20 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5 text-red-400" />
                            <span className="font-medium">Cerrar Sesión</span>
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
