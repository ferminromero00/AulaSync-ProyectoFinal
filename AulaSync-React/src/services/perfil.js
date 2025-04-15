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

export const getPerfilAlumno = async () => {
    const response = await api.get('/alumno/perfil');
    return response;
};

export const actualizarPerfilAlumno = async (datos) => {
    const response = await api.put('/alumno/perfil', datos);
    return response;
};

export const cambiarPasswordAlumno = async (passwords) => {
    const response = await api.put('/alumno/password', passwords);
    return response;
};
