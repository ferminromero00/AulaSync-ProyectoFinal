import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { login } from '../services/auth' // Añadir esta importación

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm()
  const navigate = useNavigate()
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'alumno';

  const buttonColors = role === 'profesor' 
    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500';

  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingData, setPendingData] = useState({});
  const [codigo, setCodigo] = useState(''); // Asegúrate de que sea string vacío
  const [verifError, setVerifError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role,
      };
      await api.iniciarRegistro(payload);
      setPendingEmail(data.email);
      setPendingData(payload);
      setStep(2);
    } catch (error) {
      setError('root', { 
        type: 'manual',
        message: error.message 
      })
    } finally {
      setLoading(false);
    }
  }

  const handleVerificar = async (e) => {
    e.preventDefault();
    try {
        const response = await api.verificarRegistro({ 
            email: pendingEmail, 
            codigo 
        });

        // Iniciar sesión automáticamente después de verificar
        await login({
            email: pendingEmail,
            password: pendingData.password,
            role // <-- Asegura que el role se pasa aquí
        });

        // Redirigir al dashboard correspondiente
        navigate(role === 'profesor' ? '/profesor/dashboard' : '/alumno/dashboard', {
            replace: true
        });

    } catch (error) {
        console.error('Error:', error);
        setVerifError(error.message || 'Error al verificar el código.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-green-700">Enviando código de verificación...</span>
      </div>
    );
  }

  if (step === 2) {
    return (
      <form onSubmit={handleVerificar} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Introduce el código de verificación enviado a {pendingEmail}
          </label>
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            required
          />
          {verifError && <p className="mt-1 text-sm text-red-600">{verifError}</p>}
        </div>
        <button
          type="submit"
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${buttonColors} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Verificar código
        </button>
      </form>
    );
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
