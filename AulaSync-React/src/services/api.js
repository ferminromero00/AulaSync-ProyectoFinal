const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    const isPublicEndpoint =
        url === '/registro' ||
        url === '/registro/profesor' ||
        url === '/registro/iniciar' ||
        url === '/registro/verificar';

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

        // NUEVO: Manejar error 400 de "Ya existe una invitación pendiente" sin mostrar error en consola
        if (response.status === 400) {
            const error = await response.json();
            if (
                error.error &&
                (error.error.includes('Ya existe una invitación pendiente'))
            ) {
                // No mostrar error en consola para este caso controlado
                throw new Error(error.error);
            }
            // Solo mostrar error en consola si no es el caso controlado
            console.error('Request Error:', error);
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        if (!response.ok) {
            const error = await response.json();
            // Solo mostrar error si no es el caso controlado
            if (
                !(error && error.error && error.error.includes('Ya existe una invitación pendiente'))
            ) {
                console.error('Request Error:', error);
            }
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        return response.json();
    } catch (error) {
        // Solo mostrar error si no es el caso controlado
        if (
            !(error && error.message && (
                error.message.includes('ya pertenece a esta clase') ||
                error.message.includes('El alumno ya pertenece a esta clase') ||
                error.message.includes('Ya existe una invitación pendiente')
            ))
        ) {
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

    async post(endpoint, data, customConfig = {}) {
        try {
            const token = localStorage.getItem('token');
            let config = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                ...customConfig
            };

            // No establecer Content-Type para FormData
            if (!(data instanceof FormData)) {
                config.headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(data);
            } else {
                // Eliminar Content-Type para FormData
                delete config.headers['Content-Type'];
                config.body = data;
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la petición');
            }
            
            return response.json();
        } catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    },

    // Agregar método PUT
    async put(endpoint, data) {
        return handleRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return handleRequest(endpoint, {
            method: 'DELETE'
        });
    },

    async iniciarRegistro(data) {
        return handleRequest('/registro/iniciar', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async verificarRegistro(data) {
        try {
            return await handleRequest('/registro/verificar', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Error al verificar registro:', error.message);
            throw error;
        }
    }
};

export default api;
