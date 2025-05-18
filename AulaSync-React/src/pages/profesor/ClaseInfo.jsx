import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClaseById } from '../../services/clases';
import { obtenerAnuncios } from '../../services/anuncios';
import { Users, BookOpen, CheckCircle, FileText } from 'lucide-react';

const ClaseInfo = () => {
    const { id } = useParams();
    const [clase, setClase] = useState(null);
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const claseData = await getClaseById(id);
                setClase(claseData);
                const anuncios = await obtenerAnuncios(id);
                setTareas(anuncios.filter(a => a.tipo === 'tarea'));
            } catch (e) {
                setClase(null);
                setTareas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!clase) {
        return <div className="text-center text-gray-500 py-12">Clase no encontrada</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-4">{clase.nombre}</h1>
            <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Alumnos unidos:</span>
                    <span>{clase.estudiantes?.length || 0}</span>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Tareas publicadas
                </h2>
                {tareas.length === 0 ? (
                    <div className="text-gray-500">No hay tareas publicadas.</div>
                ) : (
                    tareas.map(tarea => (
                        <div key={tarea.id} className="mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2 font-medium text-blue-900">
                                <FileText className="h-4 w-4" />
                                {tarea.titulo}
                            </div>
                            <div className="ml-6 mt-2">
                                <div className="font-semibold text-gray-700 mb-1">Estado de entregas:</div>
                                <ul className="space-y-1">
                                    {clase.estudiantes?.map(alumno => {
                                        const entrega = tarea.entregas?.find(e => e.alumno?.id === alumno.id);
                                        return (
                                            <li key={alumno.id} className="flex items-center gap-2 text-sm">
                                                <span className="font-medium">{alumno.nombre}</span>
                                                {entrega ? (
                                                    <span className="flex items-center gap-1 text-emerald-700">
                                                        <CheckCircle className="h-4 w-4" /> Entregado
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600">No entregado</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClaseInfo;
