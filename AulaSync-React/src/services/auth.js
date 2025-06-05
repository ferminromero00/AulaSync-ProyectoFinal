import { API_BASE_URL } from '../config/config';

/**
 * Inicia sesión de usuario y gestiona el almacenamiento del token.
 * 
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @param {'profesor'|'alumno'} credentials.role - Rol del usuario
 * @returns {Promise<Object>} Datos del usuario y token de autenticación
 * @throws {Error} Si las credenciales son inválidas
 */
export const login = async (credentials) => {
    try {
        // Asegura que credentials.role existe
        const role = credentials.role;
        if (!role) {
            throw new Error('Role no especificado');
        }

        const response = await fetch(`${API_BASE_URL}/api/${role}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            }),
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const data = await response.json();
        
        // Guardar el token y otros datos
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        localStorage.setItem('role', role);
        
        return {
            ...data,
            role
        };
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

/**
 * Cierra la sesión del usuario eliminando sus datos del almacenamiento local.
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
};

/**
 * Verifica si hay un usuario autenticado.
 * 
 * @returns {boolean} true si hay un usuario autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Obtiene el rol del usuario actual.
 * 
 * @returns {string|null} Rol del usuario ('profesor'|'alumno') o null si no hay usuario
 */
export const getUserRole = () => {
    return localStorage.getItem('role');
};
