const BASE_URL = 'http://localhost:8000/api';

const handleError = (error) => {
    if (error.message === 'Failed to fetch') {
        throw new Error('ERROR_DE_RED');
    }
    throw error;
};

export const handleRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');

    // Solo exigir token si NO es un endpoint público
    const isPublicEndpoint = url === '/registro' || url === '/registro/profesor';

    if (!isPublicEndpoint) {
        if (!token) {
            localStorage.clear();
            throw new Error('NO_TOKEN');
        }
        if (tokenTimestamp && Date.now() - parseInt(tokenTimestamp) > 3600000) {
            localStorage.clear();
            throw new Error('TOKEN_EXPIRED');
        }
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && !isPublicEndpoint ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${BASE_URL}${url}`, config);

        if (response.status === 401) {
            localStorage.clear();
            throw new Error('UNAUTHORIZED');
        }

        // Manejar error 409 de "ya pertenece a la clase" sin lanzar excepción
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
        if (!(error && error.message && error.message.includes('ya pertenece a esta clase'))) {
            console.error('Request Error:', error);
        }
        throw error;
    }
};

export const api = {
    async get(endpoint) {
        try {
            return await handleRequest(endpoint);
        } catch (error) {
            handleError(error);
        }
    },

    async post(endpoint, data) {
        try {
            return await handleRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (error) {
            handleError(error);
        }
    }
};

export const registerStudent = async (data) => {
    return handleRequest('/registro', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const registerTeacher = async (data) => {
    return handleRequest('/registro/profesor', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export default api;
