import { handleRequest } from './api';

export const getEntregasTarea = async (tareaId) => {
    try {
        const response = await handleRequest(`/tareas/${tareaId}/entregas`);
        return response;
    } catch (error) {
        console.error('Error al obtener entregas:', error);
        throw error;
    }
};
