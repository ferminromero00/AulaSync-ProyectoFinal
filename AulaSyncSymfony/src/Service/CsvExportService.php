<?php

namespace App\Service;

use League\Csv\Writer;
use App\Entity\Clase;
use App\Entity\Tarea;
use Doctrine\ORM\EntityManagerInterface;

class CsvExportService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    private function prepareWriter(): Writer
    {
        $writer = Writer::createFromString('');
        $writer->setDelimiter("\t");
        $writer->setEnclosure('"');
        $writer->setEscape('\\');
        return $writer;
    }

    private function insertSeparator(Writer $writer, string $char = '='): void 
    {
        $writer->insertOne(['']);  // Línea en blanco
        $writer->insertOne([str_repeat($char, times: 60)]); // Línea separadora principal (120 caracteres)
        $writer->insertOne(['']);  // Línea en blanco
    }

    private function insertHeader(Writer $writer, string $title): void 
    {
        $this->insertSeparator($writer);
        $writer->insertOne([$this->center($title)]);
        $this->insertSeparator($writer);
    }

    private function insertDataRow(Writer $writer, string $label, string $value): void 
    {
        // Centrar todo, incluidos los números (convertir a string para evitar problemas)
        $writer->insertOne([
            $this->center((string)$label, 30),
            $this->center((string)$value, 90)
        ]);
    }

    private function center(string $text, int $width = 120): string
    {
        $padding = max(0, floor(($width - mb_strlen($text)) / 2));
        return str_repeat(' ', $padding) . $text;
    }

    public function exportClaseToCSV(Clase $clase): string
    {
        $writer = $this->prepareWriter();
        $resumenAlumnos = [];

        // Información de la clase
        $this->insertHeader($writer, 'INFORMACIÓN DE LA CLASE');
        
        // Usar el nuevo método insertDataRow para cada campo
        $this->insertDataRow($writer, 'ID:', $clase->getId());
        $this->insertDataRow($writer, 'Nombre:', $clase->getNombre());
        $this->insertDataRow($writer, 'Código:', $clase->getCodigoClase());
        $this->insertDataRow($writer, 'Num. Estudiantes:', (string)$clase->getNumEstudiantes());
        $this->insertDataRow($writer, 'Fecha Creación:', $clase->getCreatedAt()->format('Y-m-d H:i:s'));
        $this->insertDataRow($writer, 'Profesor:', $clase->getProfesor()->getFirstName() . ' ' . $clase->getProfesor()->getLastName());
        $this->insertDataRow($writer, 'Email Profesor:', $clase->getProfesor()->getEmail());

        // Sección de tareas
        $writer->insertOne(['']);
        $this->insertHeader($writer, 'TAREAS DE LA CLASE');

        $tareas = $this->entityManager->createQueryBuilder()
            ->select('a')
            ->from('App\Entity\Anuncio', 'a')
            ->where('a.clase = :clase')
            ->andWhere('a.tipo = :tipo')
            ->setParameter('clase', $clase)
            ->setParameter('tipo', 'tarea')
            ->orderBy('a.fechaCreacion', 'DESC')
            ->getQuery()
            ->getResult();

        foreach ($tareas as $tarea) {
            $this->insertDataRow($writer, 'Título:', $tarea->getTitulo() ?: 'Sin título');
            $this->insertDataRow($writer, 'Descripción:', $tarea->getContenido() ?: '');
            $this->insertDataRow($writer, 'Fecha Límite:', $tarea->getFechaEntrega() 
                ? $tarea->getFechaEntrega()->format('Y-m-d H:i:s') 
                : 'Sin fecha límite');
            $this->insertDataRow($writer, 'Total Entregas:', (string)count($tarea->getEntregas()));
            $this->insertDataRow($writer, 'Fecha Creación:', $tarea->getFechaCreacion()->format('Y-m-d H:i:s'));

            if (count($tarea->getEntregas()) > 0) {
                $writer->insertOne(['']);
                $writer->insertOne(['ENTREGAS:']);
                foreach ($tarea->getEntregas() as $entrega) {
                    $alumnoId = $entrega->getAlumno()->getId();
                    if (!isset($resumenAlumnos[$alumnoId])) {
                        $resumenAlumnos[$alumnoId] = [
                            'nombre' => $entrega->getAlumno()->getFirstName() . ' ' . $entrega->getAlumno()->getLastName(),
                            'email' => $entrega->getAlumno()->getEmail(),
                            'notas' => [],
                            'entregas_totales' => 0,
                            'tareas_calificadas' => 0
                        ];
                    }

                    if ($entrega->getNota() !== null) {
                        $resumenAlumnos[$alumnoId]['notas'][] = $entrega->getNota();
                        $resumenAlumnos[$alumnoId]['tareas_calificadas']++;
                    }
                    $resumenAlumnos[$alumnoId]['entregas_totales']++;

                    // Mostrar información de la entrega
                    $this->insertDataRow($writer, 'Alumno:', $entrega->getAlumno()->getFirstName() . ' ' . $entrega->getAlumno()->getLastName());
                    $this->insertDataRow($writer, 'Email:', $entrega->getAlumno()->getEmail());
                    $this->insertDataRow($writer, 'Fecha Entrega:', $entrega->getFechaEntrega() ? $entrega->getFechaEntrega()->format('Y-m-d H:i:s') : '');
                    $this->insertDataRow($writer, 'Comentario:', $entrega->getComentario() ?: '');
                    $this->insertDataRow($writer, 'Nota:', $entrega->getNota() ?? 'Sin calificar');
                    $this->insertDataRow($writer, 'Comentario Profesor:', $entrega->getComentarioCorreccion() ?: '');
                    $writer->insertOne(['']);
                }
            }
            $writer->insertOne(['']);
        }

        // Añadir resumen final
        if (!empty($resumenAlumnos)) {
            $writer->insertOne(['']);
            $this->insertHeader($writer, 'RESUMEN DE CALIFICACIONES');
            
            foreach ($resumenAlumnos as $resumen) {
                $this->insertSeparator($writer, '-');
                $writer->insertOne(['Alumno:', $resumen['nombre']]);
                $writer->insertOne(['Email:', $resumen['email']]);
                $writer->insertOne(['Total entregas:', $resumen['entregas_totales']]);
                $writer->insertOne(['Tareas calificadas:', $resumen['tareas_calificadas']]);
                
                if (!empty($resumen['notas'])) {
                    $media = array_sum($resumen['notas']) / count($resumen['notas']);
                    $writer->insertOne(['Nota media:', number_format($media, 2)]);
                    $writer->insertOne(['Nota más alta:', max($resumen['notas'])]);
                    $writer->insertOne(['Nota más baja:', min($resumen['notas'])]);
                } else {
                    $writer->insertOne(['Estado:', 'Sin calificaciones']);
                }
                $writer->insertOne(['']);
            }
        }

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
