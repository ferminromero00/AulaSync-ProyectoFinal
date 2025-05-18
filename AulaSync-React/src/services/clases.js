import { api } from './api';
import { API_BASE_URL } from '../config/config';

const API_URL = 'http://localhost:8000/api';

const handleRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
    // Verificar si hay token
    if (!token) {
        localStorage.clear(); // Limpiar todo el storage
        throw new Error('NO_TOKEN');
    }

    // Verificar si el token ha expirado (1 hora)
    if (tokenTimestamp && Date.now() - parseInt(tokenTimestamp) > 3600000) {
        localStorage.clear(); // Limpiar todo el storage
        throw new Error('TOKEN_EXPIRED');
    }

    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    try {
        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.clear(); // Limpiar storage en caso de token inválido
            throw new Error('UNAUTHORIZED');
        }

        // NUEVO: Manejar error 409 de "ya pertenece a la clase" sin lanzar excepción
        if (response.status === 409) {
            const error = await response.json();
            if (
                error.error &&
                (error.error.includes('ya pertenece a esta clase') || error.error.includes('El alumno ya pertenece a esta clase'))
            ) {
                // No mostrar error en consola para este caso controlado
                return { alreadyInClass: true, message: error.error };
            }
            // Solo mostrar error en consola si no es el caso controlado
            console.error('Request Error:', error);
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        if (!response.ok) {
            const error = await response.json();
            console.error('Request Error:', error);
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        return response.json();
    } catch (error) {
        // Solo mostrar error si no es el caso controlado
        if (!(error && error.message && (
            error.message.includes('ya pertenece a esta clase') ||
            error.message.includes('El alumno ya pertenece a esta clase')
        ))) {
            console.error('Request Error:', error);
        }
        throw error;
    }
};

export const getClasesProfesor = async () => {
    try {
        return handleRequest('/clases/profesor', {
            method: 'GET'
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const crearClase = async (claseData) => {
    try {
        return handleRequest('/clases', {
            method: 'POST',
            body: JSON.stringify(claseData)
        });
    } catch (error) {
        throw error;
    }
};

export const eliminarClase = async (claseId) => {
    try {
        return handleRequest(`/clases/${claseId}`, {
            method: 'DELETE'
        });
    } catch (error) {
        throw error;
    }
};

export const getClaseById = async (id) => {
    try {
        const role = localStorage.getItem('role');
        console.log('[getClaseById] Role:', role);
        console.log('[getClaseById] ID:', id);

        if (!role) {
            throw new Error('NO_ROLE');
        }

        const response = await fetch(`${API_BASE_URL}/api/clases/${id}${role === 'alumno' ? '/alumno' : ''}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[getClaseById] Error response:', error);
            throw new Error(error.message || 'Error al obtener la clase');
        }

        const data = await response.json();
        console.log('[getClaseById] Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error('[getClaseById] Error:', error);
        throw error;
    }
};

export const buscarClasePorCodigo = async (codigo) => {
    try {
        const response = await handleRequest(`/alumno/clases/buscar/${codigo}`, {
            method: 'GET'
        });
        const data = response;
        // Añadimos validación y transformación de datos
        if (!data || typeof data !== 'object') {
            throw new Error('Datos de clase inválidos');
        }
        return {
            ...data,
            numEstudiantes: data.numEstudiantes || '...' // Si no hay dato, mostramos puntos suspensivos
        };
    } catch (error) {
        console.error('Error en buscarClasePorCodigo:', error);
        throw error;
    }
};

export const getClasesAlumno = async () => {
    try {
        const data = await handleRequest('/alumno/clases', {
            method: 'GET'
        });
        console.log('Clases recibidas:', data); // Añadir este log
        return data || [];
    } catch (error) {
        console.error('Error obteniendo clases:', error); // Añadir este log
        throw error;
    }
};

export const unirseAClase = async (codigo) => {
    try {
        console.log("unirseAClase - Llamando a la API con código:", codigo); // Log 1
        const response = await handleRequest('/alumno/clases/unirse', {
            method: 'POST',
            body: JSON.stringify({ codigo })
        });
        // Después de unirse, podrías recargar las clases aquí si lo necesitas
        return response;
    } catch (error) {
        console.error('Error en unirseAClase:', error);
        throw error;
    }
};

export const salirDeClase = async (claseId) => {
    try {
        return await handleRequest(`/alumno/clases/${claseId}/salir`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error en salirDeClase:', error);
        throw error;
    }
};

// Exportar todas las funciones en un solo lugar
const claseService = {
    getClasesProfesor,
    crearClase,
    eliminarClase,
    getClaseById,
    buscarClasePorCodigo,
    getClasesAlumno,
    unirseAClase,
    salirDeClase
};

export default claseService;
