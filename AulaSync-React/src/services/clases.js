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

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        return response.json();
    } catch (error) {
        console.error('Request Error:', error);
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
        console.log("buscarClasePorCodigo - Llamando a la API con código:", codigo); // Log 1
        const response = await handleRequest(`/alumno/clases/buscar/${codigo}`, {
            method: 'GET'
        });
        console.log("buscarClasePorCodigo - Respuesta de la API:", response); // Log 2
        return response;
    } catch (error) {
        console.error('Error en buscarClasePorCodigo:', error);
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
        console.log("unirseAClase - Llamando a la API con código:", codigo); // Log 1
        const response = await handleRequest('/alumno/clases/unirse', {
            method: 'POST',
            body: JSON.stringify({ codigo })
        });
        console.log("unirseAClase - Respuesta de la API:", response); // Log 2
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
