import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar, AlertCircle, Hourglass, X, FileText, BookOpen, CheckCircle, Paperclip } from 'lucide-react';
import { API_BASE_URL } from '../../config/config';

const TareasResumenAlumno = ({ tareas = [] }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        estaSemana: false,
        esteMes: false,
        proximamente: false,
        sinFecha: false,
        entregadas: false,
        calificadas: false
    });
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [showTareaModal, setShowTareaModal] = useState(false);
    const [archivoEntrega, setArchivoEntrega] = useState(null);
    const [comentarioEntrega, setComentarioEntrega] = useState('');
    const [isEntregando, setIsEntregando] = useState(false);
    const [entregada, setEntregada] = useState(false);
    const [tareasState, setTareasState] = useState(tareas);
    const [isClosing, setIsClosing] = useState(false);
    const [notaEdicion, setNotaEdicion] = useState('');
    const [comentarioCorreccionEdicion, setComentarioCorreccionEdicion] = useState('');
    const [isCalificando, setIsCalificando] = useState(false);
    const [entregaAlumnoReciente, setEntregaAlumnoReciente] = useState(null);

    const seccionRefs = {
        entregadas: useRef(null),
        calificadas: useRef(null),
        expirada: useRef(null),
        expiradas: useRef(null),
        estaSemana: useRef(null),
        esteMes: useRef(null),
        proximamente: useRef(null),
        sinFecha: useRef(null)
    };

    const toggleSeccion = (seccion) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));

        if (!seccionesAbiertas[seccion] && seccionRefs[seccion] && seccionRefs[seccion].current) {
            setTimeout(() => {
                seccionRefs[seccion].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
    };

    const hoy = new Date();
    const finDeSemana = new Date();
    finDeSemana.setDate(hoy.getDate() + (7 - hoy.getDay()));
    const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const dentroDeUnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

    const tareasNoEntregadas = tareasState.filter(t => !t.entregada);

    const tareasEstaSemana = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha >= hoy && fecha <= finDeSemana;
    });

    const tareasEsteMes = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeSemana && fecha <= finDeMes;
    });

    const tareasProximamente = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha > finDeMes;
    });

    const tareasSinFecha = tareasNoEntregadas.filter(t => !t.fechaEntrega);

    const tareasEntregadas = tareasState.filter(t => {
        return t.entregada && (!t.nota || t.nota === '' || t.nota === null);
    });

    const tareasCalificadas = tareasState.filter(t => {
        return t.entregada && t.nota !== undefined && t.nota !== null && t.nota !== '';
    });

    const tareasExpiradas = tareasNoEntregadas.filter(t => {
        if (!t.fechaEntrega) return false;
        const fecha = new Date(t.fechaEntrega);
        return fecha < hoy;
    });

    const handleClickTarea = (tarea) => {
        console.log('[TareasResumenAlumno] Tarea seleccionada:', tarea);
        console.log('[TareasResumenAlumno] Tiene nota:', tarea.nota);
        console.log('[TareasResumenAlumno] Comentario corrección:', tarea.comentarioCorreccion);
        
        setTareaSeleccionada(tarea);
        setShowTareaModal(true);
        setArchivoEntrega(null);
        setComentarioEntrega('');
        setEntregada(!!tarea.entregada);
        setNotaEdicion(tarea.nota !== undefined ? tarea.nota : '');
        setComentarioCorreccionEdicion(tarea.comentarioCorreccion || '');
    };

    const handleEntregaTarea = async (e) => {
        e && e.preventDefault && e.preventDefault();
        if (!tareaSeleccionada) return;
        setIsEntregando(true);
        try {
            const formData = new FormData();
            formData.append('comentario', comentarioEntrega);
            if (archivoEntrega) formData.append('archivo', archivoEntrega);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tareas/${tareaSeleccionada.id}/entregar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Error al entregar la tarea');
            await response.json();

            const entregaRes = await fetch(`${API_BASE_URL}/api/tareas/${tareaSeleccionada.id}/entregas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const entregas = await entregaRes.json();
            let userId = localStorage.getItem('userId');
            const entregaAlumnoNueva = Array.isArray(entregas)
                ? entregas.find(e => String(e.alumno?.id || e.alumnoId) === String(userId))
                : null;
            setEntregaAlumnoReciente(entregaAlumnoNueva);

            setEntregada(true);
            setTareaSeleccionada(prev =>
                prev
                    ? {
                        ...prev,
                        entregada: true,
                        archivoEntregaUrl: entregaAlumnoNueva?.archivoUrl || null,
                        comentarioEntrega: entregaAlumnoNueva?.comentario || '',
                        fechaEntregada: entregaAlumnoNueva?.fechaEntrega || new Date().toISOString()
                    }
                    : prev
            );
            setTareasState(prev =>
                prev.map(t =>
                    t.id === tareaSeleccionada.id
                        ? {
                            ...t,
                            entregada: true,
                            archivoEntregaUrl: entregaAlumnoNueva?.archivoUrl || null,
                            comentarioEntrega: entregaAlumnoNueva?.comentario || '',
                            fechaEntregada: entregaAlumnoNueva?.fechaEntrega || new Date().toISOString()
                        }
                        : t
                )
            );
        } catch (e) {
            alert('Error al entregar la tarea');
        } finally {
            setIsEntregando(false);
        }
    };

    const handleCalificarEntrega = async () => {
        if (!tareaSeleccionada || !tareaSeleccionada.entregaId) {
            alert('No se puede calificar esta entrega');
            return;
        }
        setIsCalificando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/entregas/${tareaSeleccionada.entregaId}/calificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nota: notaEdicion,
                    comentarioCorreccion: comentarioCorreccionEdicion
                })
            });
            if (!response.ok) throw new Error('Error al calificar la entrega');
            setTareaSeleccionada(prev =>
                prev
                    ? { ...prev, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                    : prev
            );
            setTareasState(prev =>
                prev.map(t =>
                    t.id === tareaSeleccionada.id
                        ? { ...t, nota: notaEdicion, comentarioCorreccion: comentarioCorreccionEdicion }
                        : t
                )
            );
            alert('Entrega calificada correctamente');
        } catch (e) {
            alert('Error al calificar la entrega');
        } finally {
            setIsCalificando(false);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowTareaModal(false);
            setIsClosing(false);
        }, 200);
    };

    const renderTareaModal = () => {
        if (!showTareaModal || !tareaSeleccionada) return null;

        const entregaFinal = entregaAlumnoReciente || tareaSeleccionada;
        const downloadUrl = entregaFinal.archivoUrl ? `${API_BASE_URL}${entregaFinal.archivoUrl}` : null;
        const archivoEntregaUrl = entregaFinal.archivoEntregaUrl
            ? `${API_BASE_URL}${entregaFinal.archivoEntregaUrl}`
            : entregaFinal.archivoUrl
            ? `${API_BASE_URL}${entregaFinal.archivoUrl}`
            : null;
        const comentarioMostrado = entregaFinal.comentarioEntrega || entregaFinal.comentario || comentarioEntrega;

        return (
            <div className={`fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50
                ${isClosing ? 'modal-closing' : ''}`} style={{ margin: 0, padding: 0 }}>
                <div className={`bg-white rounded-2xl w-full max-w-5xl mx-4 flex flex-col md:flex-row relative 
                    shadow-2xl modal-content max-h-[96vh] overflow-hidden
                    ${isClosing ? 'modal-content-closing' : ''}`}>
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-5 right-5 z-50 bg-red-500 hover:bg-red-400 text-white p-2.5 rounded-full shadow-lg transition-all"
                        style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex-[1.15] flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-0 min-w-[320px] max-w-[60%] tarea-anim-fadeIn">
                        <div className="flex flex-col gap-0 h-full flex-1 tarea-stagger">
                            <div className="flex items-center gap-4 px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 tarea-anim-fadeIn">
                                <div className="bg-blue-200 p-4 rounded-2xl shadow flex items-center justify-center">
                                    <BookOpen className="h-7 w-7 text-blue-700" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-blue-900">{tareaSeleccionada.titulo || <span className="italic text-gray-400">Sin título</span>}</h3>
                                </div>
                            </div>
                            <div className="px-8 py-3 border-b border-blue-50 bg-white flex items-center gap-4 tarea-anim-slideUp">
                                <div className="bg-amber-100 p-2 rounded-xl flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                    <div className="font-semibold text-amber-900 text-base">Fecha de entrega</div>
                                    <div className="text-sm text-amber-800">
                                        {tareaSeleccionada.fechaEntrega
                                            ? new Date(tareaSeleccionada.fechaEntrega).toLocaleString('es-ES', {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })
                                            : <span className="italic text-gray-400">Sin fecha límite</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col px-8 py-5 border-b border-blue-50 bg-white min-h-0 tarea-anim-slideUp">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-base">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    Descripción de la tarea
                                </h4>
                                <div className="flex-1 min-h-0">
                                    <div className="bg-blue-50 rounded-xl p-4 text-gray-700 whitespace-pre-line h-full border border-blue-100 flex items-start min-h-[50px] text-sm">
                                        {tareaSeleccionada.contenido
                                            ? tareaSeleccionada.contenido
                                            : <span className="italic text-gray-400">Sin descripción</span>}
                                    </div>
                                </div>
                            </div>
                            {downloadUrl && (
                                <div className="px-8 py-4 bg-white tarea-anim-slideUp">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-base">
                                        <Paperclip className="h-5 w-5 text-blue-400" />
                                        Material de la tarea
                                    </h4>
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 
                                             text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all
                                             shadow-sm hover:shadow group font-medium text-sm"
                                    >
                                        <FileText className="h-4 w-4 text-blue-400 group-hover:text-blue-600" />
                                        Descargar material
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-[0.85] bg-gradient-to-b from-gray-50 to-white px-10 py-10 w-full md:w-[370px] border-t 
                                 md:border-t-0 md:border-l border-gray-200 flex flex-col gap-6 overflow-y-auto max-h-[96vh] min-w-[260px] tarea-anim-fadeIn relative z-20">
                        <div className="flex flex-col gap-6">
                            <div className="tarea-anim-fadeIn">
                                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                    Tu entrega
                                </h4>
                                <div className={`rounded-xl p-3 flex items-center gap-3 shadow-sm text-sm font-semibold tarea-anim-slideUp
                                    ${entregada
                                        ? (entregaFinal.nota !== undefined && entregaFinal.nota !== null && entregaFinal.nota !== ''
                                            ? 'bg-blue-50 border border-blue-200 text-blue-800'
                                            : 'bg-emerald-50 border border-emerald-200 text-emerald-800')
                                        : 'bg-amber-50 border border-amber-200 text-amber-800'
                                    }`
                                }>
                                    {entregada ? (
                                        entregaFinal.nota !== undefined && entregaFinal.nota !== null && entregaFinal.nota !== '' ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                ¡Tarea calificada!
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                ¡Tarea entregada!
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Clock className="h-5 w-5 text-amber-600" />
                                            Pendiente de entrega
                                        </>
                                    )}
                                </div>
                            </div>
                            {entregada ? (
                                <>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                                <Paperclip className="h-5 w-5 text-green-600" />
                                                Archivo entregado:
                                            </div>
                                            {archivoEntregaUrl ? (
                                                <a
                                                    href={archivoEntregaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Descargar entrega
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 italic text-xs">No se adjuntó archivo</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-white border border-gray-100 rounded-xl p-3 tarea-anim-slideUp">
                                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                                Comentario enviado:
                                            </div>
                                            <div className="text-gray-700 whitespace-pre-line text-sm">
                                                {comentarioMostrado ? comentarioMostrado : <span className="italic text-gray-400">Sin comentario</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                Nota:
                                                <span className="ml-2 text-blue-900 font-bold text-base">
                                                    {entregaFinal.nota !== undefined && entregaFinal.nota !== null && entregaFinal.nota !== ''
                                                        ? entregaFinal.nota
                                                        : <span className="italic text-blue-400 text-base">Sin calificar</span>
                                                    }
                                                </span>
                                            </div>
                                            <div className="text-blue-700 mt-1">
                                                <span className="font-medium text-xs">Comentario del profesor:</span>
                                                <div className="w-full mt-1 px-2 py-1 border border-blue-200 rounded bg-white min-h-[28px] text-xs">
                                                    {entregaFinal.comentarioCorreccion
                                                        ? entregaFinal.comentarioCorreccion
                                                        : <span className="italic text-blue-400">Sin comentario</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tarea-anim-fadeIn">
                                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 flex flex-col gap-1 tarea-anim-slideUp">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span className="font-semibold text-gray-700 text-xs">Fecha de entrega:</span>
                                                <span className="text-gray-700 text-xs">
                                                    {entregaFinal.fechaEntregada
                                                        ? new Date(entregaFinal.fechaEntregada).toLocaleString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Desconocida'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleEntregaTarea} className="flex flex-col gap-6 tarea-anim-slideUp">
                                    <div className="relative group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Paperclip className="h-5 w-5 text-blue-500" />
                                            <span className="font-semibold text-gray-900">Adjuntar archivo</span>
                                        </div>
                                        <div className="w-full h-32 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center bg-blue-50/50 group-hover:bg-blue-50 transition-all cursor-pointer relative">
                                            <input
                                                type="file"
                                                onChange={(e) => setArchivoEntrega(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {archivoEntrega ? (
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <FileText className="h-6 w-6" />
                                                    <span className="font-medium">{archivoEntrega.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                                                    <p className="text-sm">Arrastra un archivo o haz clic para seleccionar</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            <span className="font-semibold text-gray-900">Comentario</span>
                                        </div>
                                        <textarea
                                            value={comentarioEntrega}
                                            onChange={(e) => setComentarioEntrega(e.target.value)}
                                            placeholder="Añade un comentario a tu entrega..."
                                            className="w-full h-32 p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm text-gray-700 resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isEntregando}
                                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg 
                                                 hover:bg-blue-700 active:bg-blue-800 transition-all duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 flex items-center justify-center gap-2"
                                    >
                                        {isEntregando ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Entregando...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-5 w-5" />
                                                Entregar tarea
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const seccionConfig = {
        calificadas: {
            icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
            bg: "from-blue-100 via-blue-50 to-white",
            border: "border-blue-200"
        },
        entregadas: {
            icon: <FileText className="h-6 w-6 text-emerald-600" />,
            bg: "from-emerald-100 via-emerald-50 to-white",
            border: "border-emerald-200"
        },
        expiradas: {
            icon: <AlertCircle className="h-6 w-6 text-red-600" />,
            bg: "from-red-100 via-red-50 to-white",
            border: "border-red-200"
        },
        estaSemana: {
            icon: <Clock className="h-6 w-6 text-orange-600" />,
            bg: "from-orange-100 via-orange-50 to-white",
            border: "border-orange-200"
        },
        esteMes: {
            icon: <Calendar className="h-6 w-6 text-blue-600" />,
            bg: "from-blue-100 via-blue-50 to-white",
            border: "border-blue-200"
        },
        proximamente: {
            icon: <Hourglass className="h-6 w-6 text-green-600" />,
            bg: "from-green-100 via-green-50 to-white",
            border: "border-green-200"
        },
        sinFecha: {
            icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
            bg: "from-gray-100 via-gray-50 to-white",
            border: "border-gray-200"
        }
    };

    const renderSeccion = (titulo, tareas, seccionId) => {
        const config = seccionConfig[seccionId];
        const abierto = seccionesAbiertas[seccionId];
        return (
            <div
                ref={seccionRefs[seccionId]}
                className={`mb-5 transition-all duration-300`}
            >
                <button
                    onClick={() => toggleSeccion(seccionId)}
                    className={`
                        w-full flex items-center justify-between px-6 py-4 rounded-2xl shadow border ${config?.border}
                        bg-gradient-to-r ${config?.bg}
                        hover:shadow-lg transition-all duration-300
                        ${abierto ? 'ring-2 ring-blue-200' : ''}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            {config?.icon}
                        </div>
                        <span className="font-bold text-lg text-gray-900">{titulo}</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-base font-semibold bg-white text-blue-700 border border-blue-100`}>
                            {tareas.length}
                        </span>
                    </div>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-3 pt-3">
                            {tareas.length > 0 ? (
                                tareas.map((tarea, idx) => (
                                    <div
                                        key={tarea.id}
                                        className={`
                                            group bg-white border border-blue-50 rounded-xl p-5 shadow-sm hover:shadow-xl
                                            transition-all duration-300 cursor-pointer
                                            hover:border-blue-300
                                        `}
                                        onClick={() => handleClickTarea(tarea)}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="font-semibold text-blue-900 text-base truncate">{tarea.titulo}</h3>
                                            {tarea.archivoUrl && (
                                                <span className="flex items-center gap-1 text-blue-600 ml-2">
                                                    <Paperclip className="h-4 w-4" />
                                                    <span className="text-xs">Adjunto</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-1">
                                            <span>
                                                <Calendar className="h-4 w-4 inline mr-1" />
                                                {tarea.fechaEntrega
                                                    ? new Date(tarea.fechaEntrega).toLocaleString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : "Sin fecha límite"}
                                            </span>
                                            <span>
                                                {tarea.clase?.nombre || 'Sin clase'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {(() => {
                                                let isExpirada = false;
                                                if (!tarea.entregada && tarea.fechaEntrega) {
                                                    const fecha = new Date(tarea.fechaEntrega);
                                                    const hoy = new Date();
                                                    isExpirada = fecha < hoy;
                                                }
                                                const isCalificada = tarea.entregada && tarea.nota !== undefined && tarea.nota !== null && tarea.nota !== '';
                                                if (isCalificada) {
                                                    return (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                            Calificada ({tarea.nota})
                                                        </span>
                                                    );
                                                } else if (tarea.entregada) {
                                                    return (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            Entregada
                                                        </span>
                                                    );
                                                } else if (isExpirada) {
                                                    return (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                            Expirada
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                            Pendiente
                                                        </span>
                                                    );
                                                }
                                            })()}
                                            <span className="ml-auto text-xs text-blue-600 group-hover:underline group-hover:text-blue-800 transition-colors">
                                                Ver detalles →
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 animate-fadeIn">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-bounce" />
                                    <p className="text-gray-500">No hay tareas en este período</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderSeccion("Calificadas", tareasCalificadas, "calificadas")}
            {renderSeccion("Entregadas", tareasEntregadas, "entregadas")}
            {renderSeccion("Expiradas", tareasExpiradas, "expiradas")}
            {renderSeccion("Esta semana", tareasEstaSemana, "estaSemana")}
            {renderSeccion("Este mes", tareasEsteMes, "esteMes")}
            {renderSeccion("Próximamente", tareasProximamente, "proximamente")}
            {renderSeccion("Sin fecha de entrega", tareasSinFecha, "sinFecha")}
            {renderTareaModal()}
        </div>
    );
};

export default TareasResumenAlumno;
