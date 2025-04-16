import { handleRequest } from './api';

export const enviarInvitacion = async (alumnoId, claseId) => {
    return handleRequest('/invitaciones/enviar', {
        method: 'POST',
        body: JSON.stringify({ alumnoId, claseId })
    });
};

export const obtenerInvitacionesPendientes = async () => {
    return handleRequest('/invitaciones/pendientes', {
        method: 'GET'
    });
};

export const responderInvitacion = async (invitacionId, respuesta) => {
    return handleRequest(`/invitaciones/responder/${invitacionId}`, {
        method: 'POST',
        body: JSON.stringify({ respuesta })
    });
};
