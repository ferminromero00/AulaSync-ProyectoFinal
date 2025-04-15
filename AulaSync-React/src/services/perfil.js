import api from './api';

export const getPerfilProfesor = async () => {
    const response = await api.get('/profesor/perfil');
    return response;
};

export const actualizarPerfilProfesor = async (datos) => {
    const response = await api.put('/profesor/perfil', datos);
    return response;
};

export const cambiarPassword = async (passwords) => {
    const response = await api.put('/profesor/password', passwords);
    return response;
};
