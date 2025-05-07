import { handleRequest } from './api';

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
