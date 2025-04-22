import api from './api';
import { API_BASE_URL } from '../config/config';

export const getPerfilProfesor = async () => {
    const response = await api.get('/profesor/perfil');
    return response.data;
};

export const actualizarPerfilProfesor = async (datos) => {
    const response = await api.put('/profesor/perfil', datos);
    return response.data;
};

export const cambiarPassword = async (passwords) => {
    const response = await api.put('/profesor/password', passwords);
    return response;
};

export const getPerfilAlumno = async () => {
    const response = await api.get('/alumno/perfil');
    return response.data;
};

export const actualizarPerfilAlumno = async (datos) => {
    const response = await api.put('/alumno/perfil', datos);
    return response.data;
};

export const cambiarPasswordAlumno = async (passwords) => {
    const response = await api.put('/alumno/password', passwords);
    return response;
};

export const getPerfil = async () => {
    const role = localStorage.getItem('role');
    try {
        // console.log("[getPerfil] Rol detectado:", role); // innecesario
        
        if (!role) {
            throw new Error('No hay rol definido');
        }

        const response = role === 'profesor' 
            ? await api.get('/profesor/perfil')
            : role === 'alumno' 
                ? await api.get('/alumno/perfil')
                : null;

        if (!response) {
            throw new Error('Rol no reconocido');
        }

        // Log 1: Muestra la respuesta completa del servidor
        // console.log("[getPerfil] Respuesta completa:", response); // Eliminado

        // Si response.data existe, úsalo, si no, usa response directamente
        const data = response.data !== undefined ? response.data : response;

        // Log 2: Muestra los datos extraídos de la respuesta
        // console.log("[getPerfil] Datos recibidos:", data); // Eliminado

        if (!data) {
            throw new Error('Respuesta sin datos');
        }

        // Transformar y proporcionar valores por defecto
        const transformedData = {
            id: data.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            especialidad: data.especialidad || '',
            departamento: data.departamento || '',
            curso: data.curso || '',
            fotoPerfilUrl: data.fotoPerfilUrl ? `${API_BASE_URL}${data.fotoPerfilUrl}` : null,
            nombre: data.nombre || `${data.firstName || ''} ${data.lastName || ''}`.trim()
        };

        // Log 3: Muestra los datos después de transformarlos
        // console.log("[getPerfil] Datos transformados:", transformedData); // Puedes dejarlo si lo necesitas, si no, elimínalo también
        return transformedData;

    } catch (error) {
        console.error('[getPerfil] Error:', error);
        throw error;
    }
};

export async function subirFotoPerfil(formData) {
    const role = localStorage.getItem('role');
    const endpoint = role === 'profesor' ? '/profesor/perfil/foto' : '/alumno/perfil/foto';
    try {
        console.log('Token:', localStorage.getItem('token')); // Debug
        const response = await api.post(endpoint, formData);
        if (!response) {
            throw new Error('No se recibió respuesta del servidor');
        }
        return response;
    } catch (error) {
        console.error('Error subiendo foto:', error);
        throw error;
    }
}

export const actualizarPerfil = async (datos) => {
    const role = localStorage.getItem('role');
    if (role === 'profesor') {
        return await actualizarPerfilProfesor(datos);
    } else if (role === 'alumno') {
        return await actualizarPerfilAlumno(datos);
    } else {
        throw new Error('Rol no reconocido');
    }
};
