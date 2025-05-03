const API_URL = 'http://localhost:8000/api';

export const getProfesorStats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases/profesor/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getTareasStats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tareas/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas de tareas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getTareasByProfesor = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tareas/profesor`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener tareas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const getTareasByAlumno = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tareas/alumno`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener tareas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
