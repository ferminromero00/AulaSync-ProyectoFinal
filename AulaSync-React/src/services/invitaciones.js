import { handleRequest } from './api';

/**
 * Envía una invitación a un alumno para unirse a una clase.
 * 
 * @param {number|string} alumnoId - ID del alumno a invitar
 * @param {number|string} claseId - ID de la clase a la que se invita
 * @returns {Promise<Object>} Respuesta de la API
 */
export const enviarInvitacion = async (alumnoId, claseId) => {
    return handleRequest('/invitaciones/enviar', {
        method: 'POST',
        body: JSON.stringify({ alumnoId, claseId })
    });
};

/**
 * Obtiene la lista de invitaciones pendientes del usuario actual.
 * 
 * @returns {Promise<Array>} Lista de invitaciones pendientes
 */
export const obtenerInvitacionesPendientes = async () => {
    return handleRequest('/invitaciones/pendientes', {
        method: 'GET'
    });
};

/**
 * Responde a una invitación (aceptar o rechazar).
 * 
 * @param {number|string} invitacionId - ID de la invitación
 * @param {'aceptar'|'rechazar'} respuesta - Respuesta a la invitación
 * @returns {Promise<Object>} Respuesta de la API
 */
export const responderInvitacion = async (invitacionId, respuesta) => {
    return handleRequest(`/invitaciones/responder/${invitacionId}`, {
        method: 'POST',
        body: JSON.stringify({ respuesta })
    });
};
