import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, Users, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '../services/auth';
import NotificationButton from '../components/NotificationButton'
import AvatarButton from '../components/AvatarButton'

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Overlay solo para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex h-full flex-col bg-gradient-to-b from-blue-900 to-blue-800 text-white">
                    {/* Logo y título */}
                    <div className="flex h-16 items-center gap-2 px-6 border-b border-blue-700/50">
                        <BookOpen className="h-7 w-7 text-blue-300" />
                        <span className="text-xl font-bold tracking-wider text-white/90">AulaSync</span>
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex-1 space-y-2 px-3 py-4">
                        <Link to="/profesor/dashboard" 
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-blue-700/20 bg-blue-800/20 hover:bg-blue-600/30 hover:text-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                            <BarChart2 className="h-5 w-5 text-blue-300" />
                            <span className="font-medium">Dashboard</span>
                        </Link>

                        <Link to="/profesor/clases"
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-blue-700/20 bg-blue-800/20 hover:bg-blue-600/30 hover:text-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                            <Users className="h-5 w-5 text-blue-300" />
                            <span className="font-medium">Clases</span>
                        </Link>

                        <Link to="/profesor/tareas"
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-blue-700/20 bg-blue-800/20 hover:bg-blue-600/30 hover:text-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                            <FileText className="h-5 w-5 text-blue-300" />
                            <span className="font-medium">Tareas</span>
                        </Link>
                    </nav>

                    {/* Footer navigation */}
                    <div className="border-t border-blue-700/50 p-4 space-y-2">
                        <Link to="/profesor/configuracion"
                              className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg border border-blue-700/20 bg-blue-800/20 hover:bg-blue-600/30 hover:text-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                            <Settings className="h-5 w-5 text-blue-300" />
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
                <header className="sticky top-0 z-20 bg-white border-b w-full">
                    <div className="flex h-16 items-center gap-4 px-4 justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Toggle menú</span>
                                {isSidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
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

export default TeacherLayout;
