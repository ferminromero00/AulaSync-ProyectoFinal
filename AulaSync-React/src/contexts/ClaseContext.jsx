import { createContext, useState, useContext } from 'react';

const ClaseContext = createContext();

export function ClaseProvider({ children }) {
    const [claseData, setClaseData] = useState(null);
    const [anuncios, setAnuncios] = useState([]);

    return (
        <ClaseContext.Provider value={{ 
            claseData, 
            setClaseData, 
            anuncios, 
            setAnuncios
        }}>
            {children}
        </ClaseContext.Provider>
    );
}

export function useClase() {
    const context = useContext(ClaseContext);
    if (!context) {
        throw new Error('useClase debe usarse dentro de ClaseProvider');
    }
    return context;
}
