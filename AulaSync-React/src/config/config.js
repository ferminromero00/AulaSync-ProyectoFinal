export const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (baseUrl) return baseUrl;
    
    // En desarrollo, usar localhost
    if (import.meta.env.DEV) return 'http://localhost:8000';
    
    // En producción, construir la URL usando window.location
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;
