import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '../services/auth'
import NotificationButton from '../components/NotificationButton'
import AvatarButton from '../components/AvatarButton'

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()

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
