import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { GlobalContext } from '../App'
import { getPerfil } from '../services/perfil'
import { getClasesAlumno, getClasesProfesor } from '../services/clases'
import { obtenerInvitacionesPendientes } from '../services/invitaciones'

export default function LoginForm({ role }) {
    const { register, handleSubmit, formState: { errors }, setError } = useForm()
    const navigate = useNavigate()
    const { setUserData } = useContext(GlobalContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const placeholderEmail = role === 'profesor' 
        ? 'profesor@centro.edu' 
        : 'alumno@centro.edu'

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const loginData = {
                ...data,
                role: role || 'alumno'
            };
            
            const response = await login(loginData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', role);

            // Cargar datos del perfil inmediatamente después del login
            const perfilData = await getPerfil();
            localStorage.setItem('userId', perfilData.id); // Guardar el ID del usuario

            // NUEVO: Cargar invitaciones/notificaciones si es alumno
            let invitaciones = [];
            if (role === 'alumno') {
                try {
                    invitaciones = await obtenerInvitacionesPendientes();
                } catch (e) {
                    invitaciones = [];
                }
            }

            setUserData({ 
                user: perfilData, 
                clases: [], 
                invitaciones, // <-- aquí ya tienes las notificaciones
                loading: true 
            });

            navigate(role === 'profesor' ? '/profesor/dashboard' : '/alumno/dashboard');
            
        } catch (error) {
            console.error('Error en login:', error);
            setError('root', {
                type: 'manual',
                message: error.message || 'Error en el inicio de sesión'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const buttonColors = role === 'profesor' 
        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'  
        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';

    const inputFocusColors = role === 'profesor'
        ? 'focus:border-blue-500 focus:ring-blue-500'
        : 'focus:border-green-500 focus:ring-green-500';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                </label>
                <input
                    {...register("email", {
                        required: "El email es requerido",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email inválido"
                        }
                    })}
                    type="email"
                    placeholder={placeholderEmail}
                    className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ${inputFocusColors}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <input
                    {...register("password", { required: "La contraseña es requerida" })}
                    type="password"
                    className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ${inputFocusColors}`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {errors.root && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-700">{errors.root.message}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-all
                    ${buttonColors} focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isSubmitting ? 'animate-button-press opacity-75 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Iniciando sesión...
                    </div>
                ) : (
                    `Iniciar sesión como ${role}`
                )}
            </button>
        </form>
    )
}
