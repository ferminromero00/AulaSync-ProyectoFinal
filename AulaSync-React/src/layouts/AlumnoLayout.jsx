import { useEffect, useState } from "react";
import { getTareasByAlumno } from "../../services/stats";
import TareasResumenAlumno from "../../components/alumno/TareasResumenAlumno";
import { BookOpen } from "lucide-react";

/**
 * Layout de tareas del alumno.
 * Muestra un resumen de todas las tareas asignadas al alumno con animación de carga.
 *
 * @component
 * @returns {JSX.Element} Vista principal de tareas del alumno con resumen y animación de carga
 */
const TareasAlumno = () => {
    const [tareas, setTareas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cargarTareas = async () => {
            try {
                const tareasData = await getTareasByAlumno();
                setTareas(tareasData);
            } catch (error) {
                setTareas([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargarTareas();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Tus Tareas</h1>
            </div>
            <TareasResumenAlumno tareas={tareas} />
        </div>
    );
};

export default TareasAlumno;