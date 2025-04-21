import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

export default function LoginForm({ role }) {
    const { register, handleSubmit, formState: { errors }, setError } = useForm()
    const navigate = useNavigate()

    const placeholderEmail = role === 'profesor' 
        ? 'profesor@centro.edu' 
        : 'alumno@centro.edu'

    const onSubmit = async (data) => {
        try {
            const response = await login(data, role);
            console.log('Login exitoso:', response);
            navigate(role === 'profesor' ? '/profesor/dashboard' : '/alumno/dashboard');
        } catch (error) {
            console.error('Error en login:', error);
            setError('root', {
                type: 'manual',
                message: error.message || 'Error en el inicio de sesión'
            });
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
                className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColors}`}
            >
                Iniciar sesión como {role}
            </button>
        </form>
    )
}
