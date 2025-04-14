import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { registerStudent, registerTeacher } from '../services/api'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm()
  const navigate = useNavigate()
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'alumno';

  const buttonColors = role === 'profesor' 
    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';

  const onSubmit = async (data) => {
    try {
      const response = await (role === 'alumno' ? registerStudent(data) : registerTeacher(data));
      navigate('/?role=' + role, { 
        state: { 
          message: 'Registro exitoso. Por favor, inicia sesión con tus credenciales.' 
        },
        replace: true // Esto evita que el usuario pueda volver atrás al formulario de registro
      })
    } catch (error) {
      console.error('Error en el registro:', error) // Y este para ver errores
      setError('root', { 
        type: 'manual',
        message: error.message 
      })
    }
  }

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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          {...register("password", { 
            required: "La contraseña es requerida",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres"
            }
          })}
          type="password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          {...register("firstName", { required: "El nombre es requerido" })}
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
        />
        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Apellidos
        </label>
        <input
          {...register("lastName", { required: "Los apellidos son requeridos" })}
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
        />
        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
      </div>

      {errors.root && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{errors.root.message}</p>
        </div>
      )}

      <button
        type="submit"
        className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${buttonColors} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        Registrarse como {role}
      </button>
    </form>
  )
}

export default RegisterForm
