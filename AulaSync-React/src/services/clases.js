const API_URL = 'http://localhost:8000/api';

let controller = null;

export const getClasesProfesor = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await fetch(`${API_URL}/clases/profesor`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las clases');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const crearClase = async (claseData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(claseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear la clase');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const eliminarClase = async (claseId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases/${claseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar la clase');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getClaseById = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener la clase');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
