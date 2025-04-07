import React from 'react'

export default function LoginForm({ role }) {
  const placeholderEmail = role === 'profesor' 
    ? 'profesor@centro.edu' 
    : 'alumno@centro.edu'

  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={placeholderEmail}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          role === 'profesor'
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }`}
      >
        Iniciar sesión como {role}
      </button>
    </form>
  )
}
