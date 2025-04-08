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
