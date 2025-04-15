const API_URL = 'http://localhost:8000/api';

const handleRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
    // Verificar si el token ha expirado (1 hora)
    if (tokenTimestamp && Date.now() - parseInt(tokenTimestamp) > 3600000) {
        throw new Error('TOKEN_EXPIRED');
    }

    if (!token) {
        throw new Error('NO_TOKEN');
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
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            throw new Error('UNAUTHORIZED');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        return response.json();
    } catch (error) {
        if (error.message === 'TOKEN_EXPIRED' || 
            error.message === 'NO_TOKEN' || 
            error.message === 'UNAUTHORIZED') {
            // Solo limpiamos el storage, pero no redirigimos
            localStorage.clear();
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
        if (!role) {
            throw new Error('NO_ROLE');
        }

        const endpoint = role === 'alumno' ? `/clases/${id}/alumno` : `/clases/${id}`;

        return handleRequest(endpoint, {
            method: 'GET'
        });
    } catch (error) {
        console.error('Error en getClaseById:', error);
        if (
            error.message === 'TOKEN_EXPIRED' || 
            error.message === 'NO_TOKEN' || 
            error.message === 'UNAUTHORIZED'
        ) {
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            throw new Error('Sesión expirada. Redirigiendo al login...');
        }
        throw error;
    }
};

export const buscarClasePorCodigo = async (codigo) => {
    try {
        return handleRequest(`/clases/buscar/${codigo}`, {
            method: 'GET'
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getClasesAlumno = async () => {
    try {
        return handleRequest('/alumno/clases', {
            method: 'GET'
        });
    } catch (error) {
        console.error('Error en getClasesAlumno:', error);
        throw error;
    }
};

export const unirseAClase = async (codigo) => {
    try {
        return handleRequest('/alumno/clases/unirse', {
            method: 'POST',
            body: JSON.stringify({ codigo })
        });
    } catch (error) {
        console.error('Error en unirseAClase:', error);
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
    unirseAClase
};

export default claseService;
