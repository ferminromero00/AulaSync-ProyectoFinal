<?php

namespace App\Service;

use League\Csv\Writer;
use App\Entity\Clase;
use App\Entity\Tarea;

class CsvExportService
{
    private function prepareWriter(): Writer
    {
        $writer = Writer::createFromString('');
        $writer->setDelimiter(',');
        $writer->setEnclosure('"');
        $writer->setEscape('\\');
        return $writer;
    }

    public function exportClaseToCSV(Clase $clase): string
    {
        $writer = $this->prepareWriter();

        // Encabezados para la información básica de la clase
        $writer->insertOne([
            'ID',
            'Nombre',
            'Código',
            'Num. Estudiantes',
            'Fecha Creación',
            'Profesor',
            'Email Profesor'
        ]);

        // Datos básicos de la clase
        $writer->insertOne([
            $clase->getId(),
            $clase->getNombre(),
            $clase->getCodigoClase(),
            $clase->getNumEstudiantes(),
            $clase->getCreatedAt()->format('Y-m-d H:i:s'),
            $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName(),
            $clase->getProfesor()->getEmail()
        ]);

        return $writer->toString();
    }

    public function exportTareaToCSV(Tarea $tarea): string
    {
        $writer = $this->prepareWriter();

        $writer->insertOne([
            'ID Alumno',
            'Nombre Alumno',
            'Estado',
            'Fecha Entrega',
            'Nota',
            'Comentario Profesor'
        ]);

        foreach ($tarea->getClase()->getAlumnos() as $alumno) {
            $entrega = $tarea->getEntregas()->filter(
                fn($e) => $e->getAlumno() === $alumno
            )->first();

            $writer->insertOne([
                $alumno->getId(),
                $alumno->getNombreCompleto(),
                $entrega ? 'Entregada' : 'Pendiente',
                $entrega ? $entrega->getFechaEntrega()->format('d/m/Y H:i') : '-',
                $entrega && $entrega->getNota() ? $entrega->getNota() : '-',
                $entrega ? ($entrega->getComentarioCorreccion() ?? '-') : '-'
            ]);
        }

        return $writer->toString();
    }
}
