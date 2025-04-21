import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil } from '../services/perfil';

const AvatarButton = ({ size = 40 }) => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchPerfil = async () => {
            setLoading(true);
            try {
                const data = await getPerfil();
                setPerfil(data);
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    const handleClick = () => {
        navigate(`/${role}/configuracion`);
    };

    return (
        <button 
            onClick={handleClick}
            className="rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all relative"
            title="Ver perfil"
        >
            {loading ? (
                <div className="animate-pulse bg-gray-200 rounded-full" style={{ width: size, height: size }}></div>
            ) : (
                <img
                    src={perfil?.fotoPerfilUrl || '/default-avatar.png'}
                    alt="Foto de perfil"
                    style={{ width: size, height: size }}
                    className="rounded-full object-cover"
                />
            )}
        </button>
    );
};

export default AvatarButton;
