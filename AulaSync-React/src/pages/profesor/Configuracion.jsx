import { useState, useEffect } from 'react';
import { getPerfilProfesor, actualizarPerfilProfesor, cambiarPassword } from '../../services/perfil';
import { Check, X, Edit2, Save } from 'lucide-react';

const Configuracion = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        especialidad: '',
        departamento: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('perfil');
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                setLoading(true);
                const data = await getPerfilProfesor();
                setFormData(data);
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: error.message || 'Error al cargar el perfil' 
                });
            } finally {
                setLoading(false);
            }
        };
        cargarPerfil();
    }, []);

    const handleSubmitPerfil = async (e) => {
        e.preventDefault();
        try {
            await actualizarPerfilProfesor(formData);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setEditMode(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        try {
            await cambiarPassword(passwordData);
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="border-b p-6">
                    <h1 className="text-2xl font-bold text-gray-900 text-center">Configuración de la cuenta</h1>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex justify-center space-x-8">
                        <button
                            className={`${
                                activeTab === 'perfil'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            onClick={() => setActiveTab('perfil')}
                        >
                            Perfil
                        </button>
                        <button
                            className={`${
                                activeTab === 'seguridad'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            onClick={() => setActiveTab('seguridad')}
                        >
                            Seguridad
                        </button>
                    </nav>
                </div>

                {/* Mensajes de feedback */}
                {message && (
                    <div className={`m-4 p-4 rounded-md ${
                        message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        <p className="text-sm text-center">{message.text}</p>
                    </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                    {activeTab === 'perfil' && (
                        <form onSubmit={handleSubmitPerfil} className="space-y-6 max-w-xl mx-auto">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditMode(!editMode)}
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {editMode ? (
                                        <>
                                            <X className="h-4 w-4 mr-1" />
                                            Cancelar
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Editar
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {/* ... campos del formulario ... */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        disabled={!editMode}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        disabled={!editMode}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        disabled={!editMode}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                                    <input
                                        type="text"
                                        value={formData.especialidad}
                                        onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                                        disabled={!editMode}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                                    <input
                                        type="text"
                                        value={formData.departamento}
                                        onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                                        disabled={!editMode}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>
                            {editMode && (
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar cambios
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {activeTab === 'seguridad' && (
                        <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-xl mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Actualizar contraseña
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuracion;
