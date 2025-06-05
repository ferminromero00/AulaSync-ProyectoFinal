import { handleRequest } from './api';

/**
 * Obtiene todas las entregas de una tarea por su ID.
 * 
 * @param {number|string} tareaId - ID de la tarea
 * @returns {Promise<Array>} Lista de entregas asociadas a la tarea
 * @throws {Error} Si ocurre un error al obtener las entregas
 */
export const getEntregasTarea = async (tareaId) => {
    try {
        const response = await handleRequest(`/tareas/${tareaId}/entregas`);
        return response;
    } catch (error) {
        console.error('Error al obtener entregas:', error);
        throw error;
    }
};
