import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getClaseById } from '../../services/clases';
import { obtenerAnuncios } from '../../services/anuncios';
import { Users, BookOpen, FileText, Calendar, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';

/**
 * Página de información detallada de una clase para el profesor.
 * Muestra los datos principales de la clase, lista de estudiantes, tareas publicadas
 * y permite exportar la información a PDF.
 * 
 * @component
 * @returns {JSX.Element} Vista de información y gestión de una clase concreta
 */
const ClaseInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clase, setClase] = useState(null);
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profesorNombre, setProfesorNombre] = useState(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const exportModalRef = useRef(null);

    // Animación de ticks progresivos para la carga
    const steps = [
        { label: "Cargando información de la clase...", icon: <BookOpen className="h-6 w-6 text-blue-400" /> },
        { label: "Cargando estudiantes...", icon: <Users className="h-6 w-6 text-blue-400" /> },
        { label: "Cargando tareas publicadas...", icon: <FileText className="h-6 w-6 text-blue-400" /> }
    ];
    const [step, setStep] = useState(0);
    const [dotCount, setDotCount] = useState(0);
    const intervalRef = useRef();
    const dotIntervalRef = useRef();

    useEffect(() => {
        if (loading) {
            setStep(0);
            intervalRef.current = setInterval(() => {
                setStep(prev => (prev < steps.length ? prev + 1 : prev));
            }, 600);
            dotIntervalRef.current = setInterval(() => {
                setDotCount(prev => (prev + 1) % 3);
            }, 400);
        }
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(dotIntervalRef.current);
        };
    }, [loading]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('[ClaseInfo] Obteniendo datos de clase...');
                const claseData = await getClaseById(id);
                console.log('[ClaseInfo] Datos de clase recibidos:', claseData);

                console.log('[ClaseInfo] Obteniendo anuncios...');
                const anuncios = await obtenerAnuncios(id);
                console.log('[ClaseInfo] Anuncios recibidos:', anuncios);

                setClase(claseData);
                setTareas(anuncios.filter(a => a.tipo === 'tarea'));

                // Buscar nombre del profesor en el objeto profesor de la clase
                let nombreProfesor = null;
                if (claseData.profesor && (claseData.profesor.nombre || claseData.profesor.firstName)) {
                    nombreProfesor = claseData.profesor.nombre || `${claseData.profesor.firstName || ''} ${claseData.profesor.lastName || ''}`.trim();
                } else {
                    // Buscar en anuncios
                    const primerAutor = anuncios.find(a => a.autor && a.autor.nombre)?.autor;
                    if (primerAutor) {
                        nombreProfesor = primerAutor.nombre;
                    }
                }
                setProfesorNombre(nombreProfesor);

                // NUEVO: Log extra para depuración si no hay profesor en la clase
                if (!claseData.profesor) {
                    console.warn('[ClaseInfo] clase.profesor es undefined. ¿El backend está devolviendo el profesor en la petición de clase?');
                    const primerAutor = anuncios.find(a => a.autor && a.autor.nombre)?.autor;
                    if (primerAutor) {
                        console.warn('[ClaseInfo] Primer autor encontrado en anuncios:', primerAutor);
                    } else {
                        console.warn('[ClaseInfo] No se encontró autor en los anuncios.');
                    }
                }
            } catch (e) {
                console.error('[ClaseInfo] Error al cargar datos:', e);
                setClase(null);
                setTareas([]);
                setProfesorNombre(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // NUEVO: función para exportar a PDF con loading animado
    const handleExportPDF = async () => {
        setExportingPdf(true);
        setTimeout(() => {
            // Centrar el modal respecto al scroll actual, pero más arriba (1/3 de la pantalla)
            if (exportModalRef.current) {
                const scrollY = window.scrollY || window.pageYOffset;
                exportModalRef.current.style.top = `${scrollY + window.innerHeight / 3 - 120}px`;
            }
        }, 10);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/clases/${id}/exportar-pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Error al generar el PDF');
            const blob = await response.blob();
            // Descargar el PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clase_${id}_info.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('Error al exportar el PDF');
        } finally {
            setExportingPdf(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center border border-blue-100 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-6">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <span className="text-2xl font-bold text-blue-900">AulaSync</span>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[300px]">
                        {steps.map((s, idx) => (
                            <div className="flex items-center gap-3" key={s.label}>
                                {step > idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 animate-pop" />
                                    </span>
                                ) : step === idx ? (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                                    </span>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent"></span>
                                    </span>
                                )}
                                <span className={`text-blue-800 ${step > idx ? "line-through text-blue-700" : ""}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-blue-700 text-sm flex items-center gap-2">
                        Un momento, preparando la información de la clase
                        <span className="inline-block w-6 text-blue-700 font-bold" style={{ letterSpacing: 1 }}>
                            {".".repeat(dotCount + 1)}
                        </span>
                    </div>
                    <style>{`
                        @keyframes fade-in-up {
                            0% { opacity: 0; transform: translateY(20px);}
                            100% { opacity: 1; transform: translateY(0);}
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 0.7s cubic-bezier(.4,1.4,.6,1) both;
                        }
                        @keyframes pop {
                            0% { transform: scale(0.7); opacity: 0.5;}
                            60% { transform: scale(1.2);}
                            100% { transform: scale(1); opacity: 1;}
                        }
                        .animate-pop { animation: pop 0.4s; }
                    `}</style>
                </div>
            </div>
        );
    }

    if (!clase) {
        return <div className="text-center text-gray-500 py-12">Clase no encontrada</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 animate-fadeInInfo">
            {/* Cabecera moderna */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4 animate-slideDown">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl shadow">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900">{clase.nombre}</h1>
                        <div className="flex items-center gap-4 mt-2 text-gray-600 text-base">
                            <span className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-400" />
                                <span className="font-semibold">{clase.estudiantes?.length || 0}</span> alumnos unidos
                            </span>
                            <span className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-400" />
                                Código: {clase.codigoClase}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Profesor y especialidad */}
                <div className="flex flex-col gap-2 items-end">
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold text-blue-700">Profesor:</span>{" "}
                        {profesorNombre
                            ? profesorNombre
                            : <span className="italic text-gray-400">No disponible</span>
                        }
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold text-blue-700">Especialidad:</span>{" "}
                        {(() => {
                            // Mostrar especialidad del objeto profesor si existe
                            const especialidad = clase.profesor && clase.profesor.especialidad;
                            return (especialidad && especialidad.trim() !== "")
                                ? especialidad
                                : <span className="italic text-gray-400">No disponible</span>;
                        })()}
                    </div>
                </div>
            </div>

            {/* Botón para ir a la clase y exportar PDF */}
            <div className="flex flex-wrap justify-end gap-3 mb-4 -mt-2">
                <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition-all duration-300 animate-fadeInInfo"
                    style={{ animationDelay: '180ms' }}
                >
                    <FileText className="h-5 w-5" />
                    Exportar PDF
                </button>
                <button
                    onClick={() => navigate(`/profesor/clase/${id}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all duration-300 animate-fadeInInfo"
                    style={{ animationDelay: '200ms' }}
                >
                    <BookOpen className="h-5 w-5" />
                    Ir a la clase
                </button>
            </div>

            {/* Lista de tareas */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-3 mb-6 animate-fadeInInfo" style={{ animationDelay: '120ms' }}>
                    <BookOpen className="h-7 w-7 text-blue-500" />
                    Tareas publicadas
                </h2>
                {tareas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-fadeInInfo" style={{ animationDelay: '200ms' }}>
                        <FileText className="h-12 w-12 mb-3" />
                        <p className="text-gray-500">No hay tareas publicadas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tareas.map((tarea, idx) => (
                            <div
                                key={tarea.id}
                                className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 animate-fadeInInfo"
                                style={{ animationDelay: `${200 + idx * 80}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    <h3 className="font-semibold text-lg text-blue-900">{tarea.titulo}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    {tarea.fechaEntrega
                                        ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : "Sin fecha límite"}
                                </div>
                                <div className="mb-3 text-gray-700 text-sm whitespace-pre-line">
                                    {tarea.contenido || <span className="italic text-gray-400">Sin descripción</span>}
                                </div>
                                <div className="mt-4">
                                    <div className="font-semibold text-blue-900 mb-2">Estado de entregas:</div>
                                    <ul className="space-y-2">
                                        {clase.estudiantes?.length === 0 && (
                                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                                <AlertCircle className="h-4 w-4" />
                                                No hay estudiantes inscritos.
                                            </li>
                                        )}
                                        {clase.estudiantes?.map((alumno, i) => (
                                            <li key={alumno.id} className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-900">{alumno.nombre}</span>
                                                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-semibold border border-amber-200">
                                                    <AlertCircle className="h-4 w-4" /> No entregado
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DE CARGA PDF */}
            {exportingPdf && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            width: '100%',
                            maxWidth: 350,
                        }}
                        ref={exportModalRef}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 min-w-[320px] max-w-xs animate-fadeInPdfModal">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center mb-2 shadow-lg">
                                <FileText className="h-8 w-8 text-blue-600 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2 text-center">Exportando página a PDF...</h3>
                            <div className="w-full">
                                <div className="relative w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pdfBar" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <p className="text-blue-700 text-sm mt-2 animate-fadeInPdfText">Por favor, espera unos segundos mientras generamos tu PDF.</p>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" />
                    <style>{`
                        @keyframes pdfBar {
                            0% { width: 0%; }
                            60% { width: 80%; }
                            80% { width: 95%; }
                            100% { width: 100%; }
                        }
                        .animate-pdfBar {
                            animation: pdfBar 2.2s cubic-bezier(.4,1.4,.6,1) infinite;
                        }
                        @keyframes fadeInPdfModal {
                            0% { opacity: 0; transform: scale(0.95);}
                            100% { opacity: 1; transform: scale(1);}
                        }
                        .animate-fadeInPdfModal {
                            animation: fadeInPdfModal 0.5s both;
                        }
                        @keyframes fadeInPdfText {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        .animate-fadeInPdfText {
                            animation: fadeInPdfText 1.2s both;
                        }
                    `}</style>
                </>
            )}
            <style>{`
                @keyframes fadeInInfo {
                    0% { opacity: 0; transform: translateY(32px);}
                    100% { opacity: 1; transform: none;}
                }
                .animate-fadeInInfo {
                    animation: fadeInInfo 0.7s cubic-bezier(.4,1.4,.6,1) both;
                }
                @keyframes slideDown {
                    0% { opacity: 0; transform: translateY(-32px);}
                    100% { opacity: 1; transform: none;}
                }
                .animate-slideDown {
                    animation: slideDown 0.7s cubic-bezier(.4,1.4,.6,1) both;
                }
            `}</style>
        </div>
    );
};

export default ClaseInfo;
