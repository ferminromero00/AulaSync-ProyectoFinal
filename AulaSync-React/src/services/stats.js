const API_URL = 'http://localhost:8000/api';

/**
 * Obtiene estadísticas generales del profesor (clases, estudiantes, etc).
 * 
 * @returns {Promise<Object>} Estadísticas del profesor
 * @throws {Error} Si ocurre un error al obtener las estadísticas
 */
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

/**
 * Obtiene estadísticas generales de tareas.
 * 
 * @returns {Promise<Object>} Estadísticas de tareas
 * @throws {Error} Si ocurre un error al obtener las estadísticas
 */
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

/**
 * Obtiene todas las tareas creadas por el profesor autenticado.
 * 
 * @returns {Promise<Array>} Lista de tareas del profesor
 * @throws {Error} Si ocurre un error al obtener las tareas
 */
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

/**
 * Obtiene todas las tareas asignadas al alumno autenticado.
 * 
 * @returns {Promise<Array>} Lista de tareas del alumno
 * @throws {Error} Si ocurre un error al obtener las tareas
 */
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
            // Mostrar el error real si lo hay
            let errorMsg = 'Error al obtener tareas';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch {}
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
