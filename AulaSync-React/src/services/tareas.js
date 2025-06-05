import { handleRequest } from './api';

/**
 * Obtiene todas las entregas asociadas a una tarea específica.
 * 
 * @param {number|string} tareaId - ID de la tarea para la que se quieren obtener las entregas
 * @returns {Promise<Array>} Lista de entregas de la tarea
 * @throws {Error} Si ocurre un error al obtener las entregas
 */
export const getEntregasTarea = async (tareaId) => {
    try {
        return await handleRequest(`/tareas/${tareaId}/entregas`, {
            method: 'GET'
        });
    } catch (error) {
        console.error('Error al obtener entregas:', error);
        throw error;
    }
};
