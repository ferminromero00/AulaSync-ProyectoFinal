/**
 * @typedef {Object} ClassCardProps
 * @property {string} title - Título de la clase que se mostrará en la tarjeta
 * @property {number} students - Número de estudiantes inscritos en la clase
 * @property {string} time - Información temporal relevante de la clase (por ejemplo, horario o fecha)
 * @property {string} [color] - Color de la barra superior de la tarjeta (por defecto: "bg-blue-500")
 */

/**
 * Tarjeta que muestra información básica de una clase.
 * Incluye título, número de estudiantes y tiempo de la clase.
 * La tarjeta tiene un diseño responsive con efectos hover.
 * 
 * @param {ClassCardProps} props - Propiedades del componente
 * @param {string} props.title - Título de la clase que se mostrará en la tarjeta
 * @param {number} props.students - Número de estudiantes inscritos en la clase
 * @param {string} props.time - Información temporal relevante de la clase (por ejemplo, horario o fecha)
 * @param {string} [props.color="bg-blue-500"] - Color de la barra superior de la tarjeta
 * @returns {JSX.Element} Tarjeta con información de la clase
 */
export default function ClassCard({ title, students, time, color = "bg-blue-500" }) {
    return (
        <div className="group relative rounded-lg border p-4 hover:shadow-md">
            <div className={`absolute top-0 right-0 h-2 w-full rounded-t-lg ${color}`} />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{students} estudiantes</p>
            <p className="mt-1 text-sm text-gray-600">{time}</p>
        </div>
    )
}
