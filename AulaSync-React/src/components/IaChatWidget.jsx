import { useRef, useState } from "react";

// Cambia esto por tu API Key real de AIMLAPI
const API_KEY = "84bd259c834644c2a3d40c62b6d7be44";
const BASE_URL = "https://api.aimlapi.com/v1";

// Resumen del proyecto y funciones principales para contexto de la IA
const PROJECT_CONTEXT = `
Eres el asistente IA de AulaSync, una plataforma para estudiantes y profesores. 
Funciones principales del proyecto:
- Gestión de usuarios (alumnos y profesores)
- Creación y gestión de clases y asignaturas
- Envío y recepción de mensajes y notificaciones
- Subida y descarga de materiales y tareas
- Chat en tiempo real y asistencia personalizada
- Panel de administración para profesores
- Integración con IA para ayuda y soporte educativo
Utiliza este contexto para responder preguntas relacionadas con el funcionamiento y uso de AulaSync.
`;

const IaChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: PROJECT_CONTEXT + "\nEres un asistente útil para estudiantes y profesores." 
            },
            ...newMessages.filter(m => m.role !== "system"),
          ],
          temperature: 0.7,
          max_tokens: 256,
        }),
      });
      const data = await res.json();
      const aiMsg = data?.choices?.[0]?.message?.content || "Lo siento, no pude responder.";
      setMessages([...newMessages, { role: "assistant", content: aiMsg }]);
      setLoading(false);
      scrollToBottom();
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Error al conectar con la IA." }]);
      setLoading(false);
      scrollToBottom();
    }
  };

  // Animación de entrada/salida y botón flotante
  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${open ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
      >
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-br from-blue-500 to-green-500 shadow-lg rounded-full p-4 hover:scale-110 transition-transform duration-200"
          aria-label="Abrir chat IA"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M8 10h8M8 14h5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Chat Widget */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[350px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col transition-all duration-300 ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ minHeight: open ? 420 : 0, maxHeight: 500 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-2xl">
          <span className="font-bold text-white flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M8 10h8M8 14h5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>
            AulaSync IA
          </span>
          <button onClick={() => setOpen(false)} className="text-white hover:text-blue-100 transition-colors">
            <XIcon />
          </button>
        </div>
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-blue-50/30" style={{ scrollbarWidth: "thin" }}>
          {messages.slice(1).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-xl px-3 py-2 max-w-[80%] text-sm shadow-sm
                ${msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none animate-fadeInRight"
                  : "bg-white border border-blue-100 text-gray-800 rounded-bl-none animate-fadeInLeft"
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-3 py-2 max-w-[80%] text-sm bg-white border border-blue-100 text-gray-800 rounded-bl-none animate-pulse">
                Pensando...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t bg-white rounded-b-2xl">
          <input
            type="text"
            className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus={open}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold transition disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? <Spinner /> : "Enviar"}
          </button>
        </form>
      </div>
      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-20px);} to {opacity:1; transform:translateX(0);} }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(20px);} to {opacity:1; transform:translateX(0);} }
        .animate-fadeInLeft { animation: fadeInLeft 0.4s; }
        .animate-fadeInRight { animation: fadeInRight 0.4s; }
      `}</style>
    </>
  );
};

function XIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"/>
      <path className="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

export default IaChatWidget;